import { Router } from 'express';
import { specialistController } from '../controllers/specialist.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, specialistController.getAll);
router.get('/symptoms', authMiddleware, specialistController.getSymptoms);
router.post('/recommend', authMiddleware, specialistController.recommend);
router.post('/chat-analyze', authMiddleware, specialistController.chatAnalyze);
router.get('/doctors', authMiddleware, specialistController.getDoctors);

export default router;
