import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../services/payment.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AppError } from '../utils/appError.js';

export class PaymentController {
  static async createIntent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { addressId, couponCode } = req.body;
      if (!addressId) throw new AppError('Address ID is required', 400);

      const result = await PaymentService.createPaymentIntent(
        req.user!.userId,
        addressId,
        couponCode
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const sig = req.headers['stripe-signature'] as string;
      if (!sig) throw new AppError('Missing Stripe signature header', 400);

      const result = await PaymentService.handleWebhook(req.body, sig);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async confirmDevPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.body;
      if (!orderId) throw new AppError('Order ID is required', 400);

      const result = await PaymentService.confirmDevPayment(orderId);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}
