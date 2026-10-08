import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { CouponService } from './coupon.service.js';
import { CreateOrderDto } from '@ecommerce/shared';

export class OrderService {
  static calculateShippingAndTax(subtotal: number, discountAmount: number) {
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    // Free shipping on orders over $150, else $10 flat
    const shippingAmount = discountedSubtotal >= 150 ? 0 : 10.0;
    // 8% tax on products
    const taxAmount = Math.round(discountedSubtotal * 0.08 * 100) / 100;
    const totalAmount = Math.round((discountedSubtotal + shippingAmount + taxAmount) * 100) / 100;

    return {
      shippingAmount,
      taxAmount,
      totalAmount,
    };
  }

  static async getCheckoutSummary(userId: string, addressId: string, couponCode?: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty', 400);
    }

    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) {
      throw new AppError('Shipping address not found', 400);
    }

    let subtotal = 0;
    let itemCount = 0;

    for (const item of cart.items) {
      const unitPrice = item.variant
        ? item.product.price + item.variant.priceAdjustment
        : item.product.price;
      subtotal += unitPrice * item.quantity;
      itemCount += item.quantity;
    }

    subtotal = Math.round(subtotal * 100) / 100;

    let discountAmount = 0;
    if (couponCode) {
      const couponResult = await CouponService.validateCoupon(couponCode, subtotal, userId);
      discountAmount = couponResult.discountAmount;
    }

    const { shippingAmount, taxAmount, totalAmount } = this.calculateShippingAndTax(subtotal, discountAmount);

    return {
      subtotal,
      discountAmount,
      shippingAmount,
      taxAmount,
      totalAmount,
      itemCount,
      address,
    };
  }

  static async createOrder(userId: string, dto: CreateOrderDto) {
    const summary = await this.getCheckoutSummary(userId, dto.addressId, dto.couponCode);

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true, variant: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // Atomic stock verification and deduction
    const orderItemsData: any[] = [];

    // Run inventory updates and order creation in a single transaction
    const order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        if (item.variantId && item.variant) {
          // Conditional atomic decrement on variant
          const updated = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          if (updated.count === 0) {
            throw new AppError(`Item "${item.product.name} (${item.variant.name})" is out of stock or insufficient quantity`, 400);
          }
        } else {
          // Conditional atomic decrement on product
          const updated = await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: { gte: item.quantity },
            },
            data: {
              stock: { decrement: item.quantity },
            },
          });

          if (updated.count === 0) {
            throw new AppError(`Product "${item.product.name}" is out of stock or insufficient quantity`, 400);
          }
        }

        const unitPrice = item.variant
          ? item.product.price + item.variant.priceAdjustment
          : item.product.price;
        const totalPrice = Math.round(unitPrice * item.quantity * 100) / 100;

        orderItemsData.push({
          productId: item.productId,
          variantId: item.variantId || null,
          productName: item.variant ? `${item.product.name} - ${item.variant.name}` : item.product.name,
          unitPrice,
          quantity: item.quantity,
          totalPrice,
        });
      }

      // Generate human-friendly order number
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const orderNumber = `ORD-${new Date().getFullYear()}-${randomSuffix}`;

      // Snapshot the address JSON
      const addressSnapshot = JSON.stringify(summary.address);

      const initialStatus = 'PENDING';
      const initialPaymentStatus = dto.paymentMethod === 'COD' ? 'PENDING' : dto.paymentMethod === 'DEV_SIMULATOR' ? 'PAID' : 'PENDING';

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          shippingAddressId: summary.address.id,
          shippingAddressSnapshot: addressSnapshot,
          subtotal: summary.subtotal,
          discountAmount: summary.discountAmount,
          shippingAmount: summary.shippingAmount,
          taxAmount: summary.taxAmount,
          totalAmount: summary.totalAmount,
          status: initialPaymentStatus === 'PAID' ? 'CONFIRMED' : initialStatus,
          paymentStatus: initialPaymentStatus,
          couponCode: dto.couponCode || null,
          items: {
            create: orderItemsData,
          },
          statusHistory: {
            create: [
              {
                status: initialPaymentStatus === 'PAID' ? 'CONFIRMED' : 'PENDING',
                note: dto.paymentMethod === 'COD' ? 'Order placed via Cash on Delivery' : 'Order placed successfully',
                changedBy: 'CUSTOMER',
              },
            ],
          },
          payments: {
            create: [
              {
                provider: dto.paymentMethod,
                transactionId: dto.paymentIntentId || (dto.paymentMethod === 'DEV_SIMULATOR' ? `sim_${randomSuffix}` : null),
                amount: summary.totalAmount,
                status: initialPaymentStatus,
              },
            ],
          },
        },
        include: {
          items: true,
          statusHistory: true,
          payments: true,
        },
      });

      // If coupon used, track and increment count
      if (dto.couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: dto.couponCode.toUpperCase() } });
        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });

          await tx.userCoupon.create({
            data: {
              userId,
              couponId: coupon.id,
              orderId: newOrder.id,
            },
          });
        }
      }

      // Clear the user's cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return order;
  }

  static async getUserOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        payments: true,
      },
    });
  }

  static async getOrderById(userId: string, orderId: string, isAdmin = false) {
    const where: any = { id: orderId };
    if (!isAdmin) where.userId = userId;

    const order = await prisma.order.findFirst({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: {
              include: { images: { where: { isPrimary: true }, take: 1 } },
            },
          },
        },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        payments: true,
      },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    return {
      ...order,
      parsedShippingAddress: JSON.parse(order.shippingAddressSnapshot),
    };
  }

  static async cancelOrder(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) throw new AppError('Order not found', 404);

    if (['SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status)) {
      throw new AppError(`Cannot cancel order in "${order.status}" status`, 400);
    }

    // Restock items in transaction
    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          statusHistory: {
            create: {
              status: 'CANCELLED',
              note: 'Order cancelled by customer',
              changedBy: 'CUSTOMER',
            },
          },
        },
      });
    });

    return { message: 'Order successfully cancelled and items restocked.' };
  }
}
