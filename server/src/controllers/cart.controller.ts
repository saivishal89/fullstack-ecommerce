import { Response, NextFunction } from 'express';
import { CartService } from '../services/cart.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { addToCartSchema, updateCartItemSchema } from '../validators/cart.validator.js';

export class CartController {
  static async getCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cart = await CartService.getOrCreateCart(req.user!.userId);
      res.json({ success: true, data: cart });
    } catch (err) {
      next(err);
    }
  }

  static async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = addToCartSchema.parse(req.body);
      const cart = await CartService.addItem(req.user!.userId, {
        productId: validated.productId,
        quantity: validated.quantity,
        variantId: validated.variantId ?? undefined,
      });
      res.status(201).json({ success: true, message: 'Item added to cart', data: cart });
    } catch (err) {
      next(err);
    }
  }

  static async updateQuantity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const itemId = req.params.id as string;
      const validated = updateCartItemSchema.parse(req.body);
      const cart = await CartService.updateQuantity(req.user!.userId, itemId, validated.quantity);
      res.json({ success: true, message: 'Cart updated', data: cart });
    } catch (err) {
      next(err);
    }
  }

  static async removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const itemId = req.params.id as string;
      const cart = await CartService.removeItem(req.user!.userId, itemId);
      res.json({ success: true, message: 'Item removed from cart', data: cart });
    } catch (err) {
      next(err);
    }
  }

  static async clearCart(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cart = await CartService.clearCart(req.user!.userId);
      res.json({ success: true, message: 'Cart cleared', data: cart });
    } catch (err) {
      next(err);
    }
  }
}
