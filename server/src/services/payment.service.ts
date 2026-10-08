import Stripe from 'stripe';
import { prisma } from '../config/prisma.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/appError.js';
import { OrderService } from './order.service.js';

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2025-02-24.acacia' as any,
});

export class PaymentService {
  static async createPaymentIntent(userId: string, addressId: string, couponCode?: string) {
    const summary = await OrderService.getCheckoutSummary(userId, addressId, couponCode);

    // Amount in cents
    const amountInCents = Math.round(summary.totalAmount * 100);

    try {
      if (config.stripeSecretKey && !config.stripeSecretKey.includes('placeholder')) {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amountInCents,
          currency: 'usd',
          metadata: {
            userId,
            addressId,
            couponCode: couponCode || '',
          },
        });

        return {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          amount: summary.totalAmount,
        };
      } else {
        // Safe dev fallback when live keys are not configured
        const devIntentId = `pi_dev_sim_${Date.now()}`;
        return {
          clientSecret: `${devIntentId}_secret_test`,
          paymentIntentId: devIntentId,
          amount: summary.totalAmount,
          isDevMode: true,
        };
      }
    } catch (err: any) {
      throw new AppError(`Stripe error: ${err.message}`, 400);
    }
  }

  static async handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret);
    } catch (err: any) {
      throw new AppError(`Webhook signature verification failed: ${err.message}`, 400);
    }

    // Idempotent webhook handling
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const payment = await prisma.payment.findFirst({
        where: { transactionId: paymentIntent.id },
      });

      if (payment && payment.status !== 'PAID') {
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'PAID', payload: JSON.stringify(paymentIntent) },
          }),
          prisma.order.update({
            where: { id: payment.orderId },
            data: {
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              statusHistory: {
                create: {
                  status: 'CONFIRMED',
                  note: 'Payment successfully captured via Stripe webhook',
                  changedBy: 'STRIPE_WEBHOOK',
                },
              },
            },
          }),
        ]);
      }
    }

    return { received: true };
  }

  static async confirmDevPayment(orderId: string) {
    // SECURITY: Strictly gated so this endpoint can NEVER be called in production
    if (config.nodeEnv === 'production') {
      throw new AppError('Dev payment confirmation is disabled in production environments.', 403);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) throw new AppError('Order not found', 404);
    if (order.paymentStatus === 'PAID') {
      return { message: 'Order is already marked as paid' };
    }

    await prisma.$transaction([
      prisma.payment.updateMany({
        where: { orderId },
        data: { status: 'PAID' },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          statusHistory: {
            create: {
              status: 'CONFIRMED',
              note: 'Payment confirmed via Dev Simulator',
              changedBy: 'DEV_SIMULATOR',
            },
          },
        },
      }),
    ]);

    return { message: 'Dev payment simulated successfully', orderId };
  }
}
