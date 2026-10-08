import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/appError.js';
import { AddToCartDto } from '@ecommerce/shared';

export class CartService {
  static async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
              variant: true,
            },
          },
        },
      });
    }

    let subtotal = 0;
    let totalQuantity = 0;

    const formattedItems = cart.items.map((item) => {
      const unitPrice = item.variant
        ? item.product.price + item.variant.priceAdjustment
        : item.product.price;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;
      totalQuantity += item.quantity;

      return {
        ...item,
        unitPrice: Math.round(unitPrice * 100) / 100,
        totalPrice: Math.round(itemTotal * 100) / 100,
        variant: item.variant
          ? {
              ...item.variant,
              attributes: JSON.parse(item.variant.attributes || '{}'),
            }
          : null,
      };
    });

    return {
      id: cart.id,
      userId: cart.userId,
      items: formattedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      totalQuantity,
    };
  }

  static async addItem(userId: string, dto: AddToCartDto) {
    const product = await prisma.product.findUnique({
      where: { id: dto.productId },
      include: { variants: true },
    });

    if (!product || !product.isActive) {
      throw new AppError('Product not found or unavailable', 404);
    }

    let availableStock = product.stock;
    if (dto.variantId) {
      const variant = product.variants.find((v) => v.id === dto.variantId);
      if (!variant) throw new AppError('Invalid variant selected', 400);
      availableStock = variant.stock;
    }

    if (availableStock < dto.quantity) {
      throw new AppError(`Only ${availableStock} units available in stock`, 400);
    }

    const cart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: dto.productId,
        variantId: dto.variantId || null,
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + dto.quantity;
      if (newQty > availableStock) {
        throw new AppError(`Cannot add more. Reached max available stock (${availableStock})`, 400);
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          variantId: dto.variantId || null,
          quantity: dto.quantity,
        },
      });
    }

    return this.getOrCreateCart(userId);
  }

  static async updateQuantity(userId: string, itemId: string, quantity: number) {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: true,
        variant: true,
      },
    });

    if (!item || item.cart.userId !== userId) {
      throw new AppError('Cart item not found', 404);
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
      return this.getOrCreateCart(userId);
    }

    const availableStock = item.variant ? item.variant.stock : item.product.stock;
    if (quantity > availableStock) {
      throw new AppError(`Only ${availableStock} units available in stock`, 400);
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return this.getOrCreateCart(userId);
  }

  static async removeItem(userId: string, itemId: string) {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item || item.cart.userId !== userId) {
      throw new AppError('Cart item not found', 404);
    }

    await prisma.cartItem.delete({ where: { id: itemId } });
    return this.getOrCreateCart(userId);
  }

  static async clearCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return this.getOrCreateCart(userId);
  }
}
