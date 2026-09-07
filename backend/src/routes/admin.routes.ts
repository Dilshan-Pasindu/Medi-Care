import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authMiddleware, adminMiddleware);

router.get('/users', adminController.listUsers);
router.patch('/users/:id/role', adminController.updateUserRole);

export default router;
