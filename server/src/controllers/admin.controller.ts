import { Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service.js';
import { ProductService } from '../services/product.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { updateOrderStatusSchema } from '../validators/cart.validator.js';
import { createProductSchema, updateProductSchema } from '../validators/catalog.validator.js';

export class AdminController {
  static async getAnalytics(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getAnalytics();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status, search, page, limit } = req.query as any;
      const data = await AdminService.getOrders({ status, search, page, limit });
      res.json({ success: true, data: data.orders, pagination: data.pagination });
    } catch (err) {
      next(err);
    }
  }

  static async updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.id as string;
      const validated = updateOrderStatusSchema.parse(req.body);
      const updated = await AdminService.updateOrderStatus(
        req.user!.userId,
        orderId,
        validated.status as any,
        validated.note,
        validated.trackingNumber
      );
      res.json({ success: true, message: 'Order status updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { role, search, page, limit } = req.query as any;
      const data = await AdminService.getUsers({ role, search, page, limit });
      res.json({ success: true, data: data.users, pagination: data.pagination });
    } catch (err) {
      next(err);
    }
  }

  static async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id as string;
      const { isActive } = req.body;
      const updated = await AdminService.updateUserStatus(req.user!.userId, userId, Boolean(isActive));
      res.json({ success: true, message: 'User status updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async updateUserRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id as string;
      const { role } = req.body;
      const updated = await AdminService.updateUserRole(req.user!.userId, userId, role);
      res.json({ success: true, message: 'User role updated', data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createProductSchema.parse(req.body);
      const product = await AdminService.createProduct(req.user!.userId, validated);
      res.status(201).json({ success: true, message: 'Product created', data: product });
    } catch (err) {
      next(err);
    }
  }

  static async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.params.id as string;
      const validated = updateProductSchema.parse(req.body);
      const product = await AdminService.updateProduct(req.user!.userId, productId, validated);
      res.json({ success: true, message: 'Product updated', data: product });
    } catch (err) {
      next(err);
    }
  }

  static async deleteProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.params.id as string;
      const product = await ProductService.softDeleteProduct(productId);
      await AdminService.logAction(req.user!.userId, 'DEACTIVATE_PRODUCT', 'Product', productId);
      res.json({ success: true, message: 'Product deactivated (soft-deleted)', data: product });
    } catch (err) {
      next(err);
    }
  }

  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const data = await AdminService.getAuditLogs(page, limit);
      res.json({ success: true, data: data.logs, pagination: data.pagination });
    } catch (err) {
      next(err);
    }
  }
}
