import { Router } from 'express';
import { medicineController } from '../controllers/medicine.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, medicineController.getAll);
router.get('/search', authMiddleware, medicineController.search);
router.get('/:id', authMiddleware, medicineController.getById);

export default router;
