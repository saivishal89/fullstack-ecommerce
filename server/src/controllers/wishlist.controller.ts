import { Response, NextFunction } from 'express';
import { WishlistService } from '../services/wishlist.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class WishlistController {
  static async getWishlist(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const items = await WishlistService.getWishlist(req.user!.userId);
      res.json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  }

  static async toggleItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { productId } = req.body;
      const result = await WishlistService.toggleItem(req.user!.userId, productId);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId as string;
      const result = await WishlistService.removeItem(req.user!.userId, productId);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}
