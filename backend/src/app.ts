import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import specialistRoutes from './routes/specialist.routes';
import appointmentRoutes from './routes/appointment.routes';
import medicineRoutes from './routes/medicine.routes';
import prescriptionRoutes from './routes/prescription.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/specialists', specialistRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

app.use(errorMiddleware);

export default app;
