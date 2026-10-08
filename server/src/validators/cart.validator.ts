import { z } from 'zod';

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  subtotal: z.number().min(0, 'Subtotal must be positive'),
});

export const checkoutSummarySchema = z.object({
  addressId: z.string().min(1, 'Address ID is required'),
  shippingMethodId: z.string().optional(),
  couponCode: z.string().optional(),
});

export const createOrderSchema = z.object({
  addressId: z.string().min(1, 'Address ID is required'),
  paymentMethod: z.enum(['STRIPE', 'COD', 'DEV_SIMULATOR']),
  couponCode: z.string().optional(),
  paymentIntentId: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ]),
  note: z.string().optional(),
  trackingNumber: z.string().optional(),
});
