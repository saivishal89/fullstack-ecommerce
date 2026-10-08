import { z } from 'zod';

export const productQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  inStock: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price-asc', 'price-desc', 'newest', 'rating', 'popular']).default('newest'),
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  shortDescription: z.string().optional(),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  compareAtPrice: z.number().min(0).optional().nullable(),
  sku: z.string().min(2, 'SKU is required'),
  stock: z.number().int().min(0, 'Stock must be at least 0'),
  categoryId: z.string().min(1, 'Category ID is required'),
  brandId: z.string().min(1, 'Brand ID is required'),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  specifications: z.record(z.string()).default({}),
  images: z.array(
    z.object({
      url: z.string().url('Valid image URL required'),
      altText: z.string().optional(),
      isPrimary: z.boolean().default(false),
    })
  ).min(1, 'At least one image is required'),
  variants: z.array(
    z.object({
      name: z.string().min(1),
      sku: z.string().min(1),
      priceAdjustment: z.number().default(0),
      stock: z.number().int().min(0),
      attributes: z.record(z.string()).default({}),
    })
  ).optional().default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(2, 'Review title must be at least 2 characters'),
  comment: z.string().min(10, 'Review comment must be at least 10 characters'),
});
