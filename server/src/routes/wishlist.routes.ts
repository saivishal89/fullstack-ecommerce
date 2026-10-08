import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', WishlistController.getWishlist);
router.post('/toggle', WishlistController.toggleItem);
router.delete('/:productId', WishlistController.removeItem);

export default router;
