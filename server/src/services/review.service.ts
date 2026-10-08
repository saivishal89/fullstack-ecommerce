import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { CreateReviewDto } from '@ecommerce/shared';

export class ReviewService {
  static async createReview(userId: string, productId: string, dto: CreateReviewDto) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError('Product not found', 404);

    // Verify user purchased the product
    const purchasedOrder = await prisma.order.findFirst({
      where: {
        userId,
        status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
        items: { some: { productId } },
      },
    });

    const isVerifiedPurchase = Boolean(purchasedOrder);

    // Check if user already reviewed
    const existing = await prisma.review.findFirst({
      where: { userId, productId },
    });

    let review;
    if (existing) {
      review = await prisma.review.update({
        where: { id: existing.id },
        data: {
          rating: dto.rating,
          title: dto.title,
          comment: dto.comment,
          isVerifiedPurchase,
          isApproved: true,
        },
      });
    } else {
      review = await prisma.review.create({
        data: {
          userId,
          productId,
          rating: dto.rating,
          title: dto.title,
          comment: dto.comment,
          isVerifiedPurchase,
          isApproved: true,
        },
      });
    }

    // Recalculate average rating
    const aggregate = await prisma.review.aggregate({
      where: { productId, isApproved: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const newAvg = Math.round((aggregate._avg.rating || 0) * 10) / 10;
    const newCount = aggregate._count.rating || 0;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: newAvg,
        reviewCount: newCount,
      },
    });

    return review;
  }
}
