import { Router } from 'express';
import { medicineController } from '../controllers/medicine.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

router.get('/', authMiddleware, medicineController.getAll);
router.get('/search', authMiddleware, medicineController.search);
router.get('/:id', authMiddleware, medicineController.getById);

// Pharmacist & Admin only
router.post('/', authMiddleware, roleMiddleware('PHARMACIST', 'ADMIN'), medicineController.create);
router.put('/:id', authMiddleware, roleMiddleware('PHARMACIST', 'ADMIN'), medicineController.update);
router.delete('/:id', authMiddleware, roleMiddleware('PHARMACIST', 'ADMIN'), medicineController.delete);

export default router;
