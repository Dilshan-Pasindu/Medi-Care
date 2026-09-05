import { Router } from 'express';
import { prescriptionController } from '../controllers/prescription.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

router.get('/pharmacy/stats', authMiddleware, roleMiddleware('PHARMACIST', 'ADMIN'), prescriptionController.getPharmacyStats);
router.get('/', authMiddleware, prescriptionController.getAll);
router.post('/', authMiddleware, roleMiddleware('DOCTOR'), prescriptionController.create);
router.get('/:id', authMiddleware, prescriptionController.getById);
router.patch('/:id/status', authMiddleware, roleMiddleware('PHARMACIST', 'DOCTOR'), prescriptionController.updateStatus);
router.post('/:id/dispense', authMiddleware, roleMiddleware('PHARMACIST'), prescriptionController.dispense);

export default router;
