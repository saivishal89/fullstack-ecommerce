import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { ProductQueryDto } from '@ecommerce/shared';

export class ProductService {
  static async getProducts(query: ProductQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.brand) {
      where.brand = { slug: query.brand };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.price = {};
      if (query.minPrice !== undefined) where.price.gte = Number(query.minPrice);
      if (query.maxPrice !== undefined) where.price.lte = Number(query.maxPrice);
    }

    if (query.rating) {
      where.rating = { gte: Number(query.rating) };
    }

    if (query.inStock) {
      where.stock = { gt: 0 };
    }

    if (query.search && query.search.trim()) {
      const s = query.search.trim();
      where.OR = [
        { name: { contains: s } },
        { description: { contains: s } },
        { shortDescription: { contains: s } },
        { sku: { contains: s } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (query.sortBy === 'price-asc') orderBy = { price: 'asc' };
    if (query.sortBy === 'price-desc') orderBy = { price: 'desc' };
    if (query.sortBy === 'rating') orderBy = { rating: 'desc' };
    if (query.sortBy === 'popular') orderBy = { reviewCount: 'desc' };

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: true,
          brand: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
        },
      }),
    ]);

    const formattedProducts = products.map((p) => ({
      ...p,
      specifications: JSON.parse(p.specifications || '{}'),
      variants: p.variants.map((v) => ({
        ...v,
        attributes: JSON.parse(v.attributes || '{}'),
      })),
    }));

    return {
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getFeaturedProducts() {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      orderBy: { rating: 'desc' },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
    });

    return products.map((p) => ({
      ...p,
      specifications: JSON.parse(p.specifications || '{}'),
      variants: p.variants.map((v) => ({
        ...v,
        attributes: JSON.parse(v.attributes || '{}'),
      })),
    }));
  }

  static async getTrendingProducts() {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 8,
      orderBy: { reviewCount: 'desc' },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
    });

    return products.map((p) => ({
      ...p,
      specifications: JSON.parse(p.specifications || '{}'),
      variants: p.variants.map((v) => ({
        ...v,
        attributes: JSON.parse(v.attributes || '{}'),
      })),
    }));
  }

  static async getProductBySlugOrId(identifier: string) {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ slug: identifier }, { id: identifier }],
        isActive: true,
      },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return {
      ...product,
      specifications: JSON.parse(product.specifications || '{}'),
      variants: product.variants.map((v) => ({
        ...v,
        attributes: JSON.parse(v.attributes || '{}'),
      })),
    };
  }

  static async getRelatedProducts(categoryId: string, excludeId: string) {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: excludeId },
        isActive: true,
      },
      take: 4,
      orderBy: { rating: 'desc' },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
    });

    return products.map((p) => ({
      ...p,
      specifications: JSON.parse(p.specifications || '{}'),
      variants: p.variants.map((v) => ({
        ...v,
        attributes: JSON.parse(v.attributes || '{}'),
      })),
    }));
  }

  static async softDeleteProduct(productId: string) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError('Product not found', 404);

    return prisma.product.update({
      where: { id: productId },
      data: { isActive: false },
    });
  }
}
