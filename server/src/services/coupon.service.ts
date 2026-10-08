import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';

export class CouponService {
  static async validateCoupon(code: string, subtotal: number, userId?: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      throw new AppError('Invalid or inactive coupon code', 400);
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new AppError('Coupon has expired or is not yet active', 400);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit reached', 400);
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      throw new AppError(`Order subtotal must be at least $${coupon.minOrderAmount} to use this coupon`, 400);
    }

    if (userId) {
      const userUsageCount = await prisma.userCoupon.count({
        where: { userId, couponId: coupon.id },
      });
      if (userUsageCount >= coupon.perUserLimit) {
        throw new AppError(`You have already used this coupon the maximum allowed times (${coupon.perUserLimit})`, 400);
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = (subtotal * coupon.discountAmount) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountAmount;
    }

    discountAmount = Math.min(discountAmount, subtotal);
    discountAmount = Math.round(discountAmount * 100) / 100;

    return {
      valid: true,
      coupon,
      discountAmount,
    };
  }
}
