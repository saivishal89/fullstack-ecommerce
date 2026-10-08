import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Strict security: protected by both requireAuth and requireAdmin
router.use(requireAuth, requireAdmin);

router.get('/analytics', AdminController.getAnalytics);

router.get('/orders', AdminController.getOrders);
router.patch('/orders/:id/status', AdminController.updateOrderStatus);

router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.patch('/users/:id/role', AdminController.updateUserRole);

router.post('/products', AdminController.createProduct);
router.put('/products/:id', AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);

router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
