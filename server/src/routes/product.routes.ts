import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Static and category/brand routes FIRST before :slugOrId parameter
router.get('/', ProductController.getProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/trending', ProductController.getTrendingProducts);
router.get('/categories', ProductController.getCategories);
router.get('/brands', ProductController.getBrands);
router.get('/related', ProductController.getRelatedProducts);

// Parameterized product details and reviews
router.get('/:slugOrId', ProductController.getProductBySlugOrId);
router.post('/:id/reviews', requireAuth, ProductController.createReview);

export default router;
