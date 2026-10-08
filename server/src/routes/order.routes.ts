import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/validate-coupon', OrderController.validateCoupon);
router.post('/checkout-summary', OrderController.getCheckoutSummary);
router.post('/', OrderController.createOrder);
router.get('/', OrderController.getUserOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/:id/cancel', OrderController.cancelOrder);

export default router;
