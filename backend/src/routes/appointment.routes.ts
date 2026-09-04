import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

router.get('/', authMiddleware, appointmentController.getAll);
router.post('/', authMiddleware, roleMiddleware('PATIENT'), appointmentController.create);
router.get('/:id', authMiddleware, appointmentController.getById);
router.patch('/:id/status', authMiddleware, roleMiddleware('DOCTOR', 'ADMIN'), appointmentController.updateStatus);
router.patch('/:id/notes', authMiddleware, roleMiddleware('DOCTOR'), appointmentController.updateNotes);

export default router;
