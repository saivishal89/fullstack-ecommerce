import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { addressSchema, changePasswordSchema, updateProfileSchema } from '../validators/auth.validator.js';

export class UserController {
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = updateProfileSchema.parse(req.body);
      const user = await UserService.updateProfile(req.user!.userId, validated);
      res.json({ success: true, message: 'Profile updated', data: user });
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = changePasswordSchema.parse(req.body);
      const result = await UserService.changePassword(
        req.user!.userId,
        validated.currentPassword,
        validated.newPassword
      );
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async getAddresses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const addresses = await UserService.getAddresses(req.user!.userId);
      res.json({ success: true, data: addresses });
    } catch (err) {
      next(err);
    }
  }

  static async addAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = addressSchema.parse(req.body);
      const address = await UserService.addAddress(req.user!.userId, validated as any);
      res.status(201).json({ success: true, message: 'Address created', data: address });
    } catch (err) {
      next(err);
    }
  }

  static async updateAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const addressId = req.params.id as string;
      const validated = addressSchema.partial().parse(req.body);
      const address = await UserService.updateAddress(req.user!.userId, addressId, validated as any);
      res.json({ success: true, message: 'Address updated', data: address });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const addressId = req.params.id as string;
      const result = await UserService.deleteAddress(req.user!.userId, addressId);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  }
}
