import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service.js';
import { CategoryService } from '../services/category.service.js';
import { ReviewService } from '../services/review.service.js';
import { productQuerySchema, createReviewSchema } from '../validators/catalog.validator.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = productQuerySchema.parse(req.query);
      const result = await ProductService.getProducts(validated as any);
      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getFeaturedProducts(_req: Request, res: Response, next: NextFunction) {
    try {
      const products = await ProductService.getFeaturedProducts();
      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  }

  static async getTrendingProducts(_req: Request, res: Response, next: NextFunction) {
    try {
      const products = await ProductService.getTrendingProducts();
      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  }

  static async getCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getAll();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }

  static async getBrands(_req: Request, res: Response, next: NextFunction) {
    try {
      const brands = await CategoryService.getBrands();
      res.json({ success: true, data: brands });
    } catch (err) {
      next(err);
    }
  }

  static async getProductBySlugOrId(req: Request, res: Response, next: NextFunction) {
    try {
      const slugOrId = req.params.slugOrId as string;
      const product = await ProductService.getProductBySlugOrId(slugOrId);
      res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  static async getRelatedProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, excludeId } = req.query as { categoryId: string; excludeId: string };
      const products = await ProductService.getRelatedProducts(categoryId, excludeId);
      res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  }

  static async createReview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const productId = req.params.id as string;
      const validated = createReviewSchema.parse(req.body);
      const review = await ReviewService.createReview(req.user!.userId, productId, validated);
      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review,
      });
    } catch (err) {
      next(err);
    }
  }
}
