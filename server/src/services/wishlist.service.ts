import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';

export class WishlistService {
  static async getWishlist(userId: string) {
    const wishlist = await prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
                category: true,
                brand: true,
              },
            },
          },
        },
      },
    });

    return wishlist.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        specifications: JSON.parse(item.product.specifications || '{}'),
      },
    }));
  }

  static async toggleItem(userId: string, productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError('Product not found', 404);

    const wishlist = await prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return { inWishlist: false, message: 'Removed from wishlist' };
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
      return { inWishlist: true, message: 'Added to wishlist' };
    }
  }

  static async removeItem(userId: string, productId: string) {
    const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
    if (!wishlist) return { message: 'Item not in wishlist' };

    await prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId },
    });

    return { message: 'Item removed from wishlist' };
  }
}
