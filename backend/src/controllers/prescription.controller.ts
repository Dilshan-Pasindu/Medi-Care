import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prescriptionService } from '../services/prescription.service';
import { validateCreatePrescription, validateUpdatePrescriptionStatus } from '../dto/prescription.dto';

export const prescriptionController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const dto = validateCreatePrescription(req.body);
      const prescription = await prescriptionService.create(req.user!.userId, dto);
      res.status(201).json({ success: true, data: prescription });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string | undefined;

      let result;
      if (req.user!.role === 'PATIENT') {
        result = await prescriptionService.getForPatient(req.user!.userId, page, limit);
      } else if (req.user!.role === 'DOCTOR') {
        result = await prescriptionService.getForDoctor(req.user!.userId, page, limit);
      } else if (req.user!.role === 'PHARMACIST') {
        result = status === 'pending'
          ? await prescriptionService.getPending(page, limit)
          : await prescriptionService.getAll(page, limit);
      } else {
        result = await prescriptionService.getAll(page, limit);
      }

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const prescription = await prescriptionService.getById(req.params.id);
      res.json({ success: true, data: prescription });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const dto = validateUpdatePrescriptionStatus(req.body);
      const prescription = await prescriptionService.updateStatus(req.params.id, dto);
      res.json({ success: true, data: prescription });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async dispense(req: AuthRequest, res: Response): Promise<void> {
    try {
      const prescription = await prescriptionService.dispense(req.params.id);
      res.json({ success: true, data: prescription, message: 'Prescription dispensed successfully' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async getPharmacyStats(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await prescriptionService.getPharmacyStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },
};
