import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.put('/profile', UserController.updateProfile);
router.put('/change-password', UserController.changePassword);
router.get('/addresses', UserController.getAddresses);
router.post('/addresses', UserController.addAddress);
router.put('/addresses/:id', UserController.updateAddress);
router.delete('/addresses/:id', UserController.deleteAddress);

export default router;
