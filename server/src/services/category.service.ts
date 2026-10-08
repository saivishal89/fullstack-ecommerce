import { prisma } from '../config/prisma.js';

export class CategoryService {
  static async getAll() {
    return prisma.category.findMany({
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getBrands() {
    return prisma.brand.findMany({
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
