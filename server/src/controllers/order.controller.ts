import { Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service.js';
import { CouponService } from '../services/coupon.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  checkoutSummarySchema,
  createOrderSchema,
  validateCouponSchema,
} from '../validators/cart.validator.js';

export class OrderController {
  static async validateCoupon(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = validateCouponSchema.parse(req.body);
      const result = await CouponService.validateCoupon(
        validated.code,
        validated.subtotal,
        req.user?.userId
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async getCheckoutSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = checkoutSummarySchema.parse(req.body);
      const summary = await OrderService.getCheckoutSummary(
        req.user!.userId,
        validated.addressId,
        validated.couponCode
      );
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  static async createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createOrderSchema.parse(req.body);
      const order = await OrderService.createOrder(req.user!.userId, validated);
      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: order,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getUserOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orders = await OrderService.getUserOrders(req.user!.userId);
      res.json({ success: true, data: orders });
    } catch (err) {
      next(err);
    }
  }

  static async getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id as string;
      const isAdmin = req.user?.role === 'ADMIN';
      const order = await OrderService.getOrderById(req.user!.userId, orderId, isAdmin);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  static async cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id as string;
      const result = await OrderService.cancelOrder(req.user!.userId, orderId);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}
