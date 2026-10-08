import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/create-intent', requireAuth, PaymentController.createIntent);
router.post('/confirm-dev', PaymentController.confirmDevPayment);

export default router;
