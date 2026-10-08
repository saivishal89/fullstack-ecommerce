import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { OrderStatus, Role } from '@ecommerce/shared';

export class AdminService {
  static async logAction(adminId: string, action: string, entityType: string, entityId: string, details?: any) {
    return prisma.auditLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        details: details ? JSON.stringify(details) : null,
      },
    });
  }

  static async getAnalytics() {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      pendingOrdersCount,
      lowStockProducts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: { status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] } },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 15 }, isActive: true },
        select: { id: true, name: true, sku: true, stock: true },
        take: 10,
      }),
    ]);

    const totalRevenue = Math.round((revenueResult._sum.totalAmount || 0) * 100) / 100;

    // Recent 5 orders for dashboard feed
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    // Sales by Category
    const categories = await prisma.category.findMany({
      include: {
        products: {
          select: {
            orderItems: { select: { totalPrice: true, quantity: true } },
          },
        },
      },
    });

    const salesByCategory = categories.map((cat) => {
      let revenue = 0;
      let count = 0;
      cat.products.forEach((prod) => {
        prod.orderItems.forEach((item) => {
          revenue += item.totalPrice;
          count += item.quantity;
        });
      });
      return {
        category: cat.name,
        count,
        revenue: Math.round(revenue * 100) / 100,
      };
    });

    return {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      pendingOrdersCount,
      lowStockCount: lowStockProducts.length,
      lowStockProducts,
      recentOrders,
      salesByCategory,
    };
  }

  static async getOrders(query: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 15));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search } },
        { user: { name: { contains: query.search } } },
        { user: { email: { contains: query.search } } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateOrderStatus(adminId: string, orderId: string, status: OrderStatus, note?: string, trackingNumber?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found', 404);

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(trackingNumber ? { trackingNumber } : {}),
        statusHistory: {
          create: {
            status,
            note: note || `Status updated to ${status} by administrator`,
            changedBy: 'ADMIN',
          },
        },
      },
      include: {
        statusHistory: true,
      },
    });

    await this.logAction(adminId, 'UPDATE_ORDER_STATUS', 'Order', orderId, {
      from: order.status,
      to: status,
      trackingNumber,
      note,
    });

    return updated;
  }

  static async getUsers(query: { search?: string; role?: string; page?: number; limit?: number }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 15));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.role) where.role = query.role;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateUserStatus(adminId: string, userId: string, isActive: boolean) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true },
    });

    await this.logAction(adminId, 'UPDATE_USER_STATUS', 'User', userId, { isActive });
    return updated;
  }

  static async updateUserRole(adminId: string, userId: string, role: Role) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    await this.logAction(adminId, 'UPDATE_USER_ROLE', 'User', userId, { role });
    return updated;
  }

  static async createProduct(adminId: string, data: any) {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        sku: data.sku,
        stock: data.stock,
        categoryId: data.categoryId,
        brandId: data.brandId,
        isFeatured: Boolean(data.isFeatured),
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        specifications: JSON.stringify(data.specifications || {}),
        images: {
          create: data.images.map((img: any, idx: number) => ({
            url: img.url,
            isPrimary: img.isPrimary || idx === 0,
            sortOrder: idx,
            altText: img.altText || data.name,
          })),
        },
        variants: {
          create: (data.variants || []).map((v: any) => ({
            name: v.name,
            sku: v.sku,
            priceAdjustment: v.priceAdjustment || 0,
            stock: v.stock || 0,
            attributes: JSON.stringify(v.attributes || {}),
          })),
        },
      },
      include: {
        images: true,
        variants: true,
      },
    });

    await this.logAction(adminId, 'CREATE_PRODUCT', 'Product', product.id, { name: product.name });
    return product;
  }

  static async updateProduct(adminId: string, productId: string, data: any) {
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) throw new AppError('Product not found', 404);

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.compareAtPrice !== undefined) updateData.compareAtPrice = data.compareAtPrice;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.brandId !== undefined) updateData.brandId = data.brandId;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.specifications !== undefined) updateData.specifications = JSON.stringify(data.specifications);

    const updated = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        images: true,
        variants: true,
      },
    });

    await this.logAction(adminId, 'UPDATE_PRODUCT', 'Product', productId, updateData);
    return updated;
  }

  static async getAuditLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return {
      logs: logs.map((l) => ({
        ...l,
        details: l.details ? JSON.parse(l.details) : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
