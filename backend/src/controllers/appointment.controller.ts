import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { appointmentService } from '../services/appointment.service';
import { validateCreateAppointment, validateUpdateAppointmentStatus } from '../dto/appointment.dto';

export const appointmentController = {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const dto = validateCreateAppointment(req.body);
      const appointment = await appointmentService.create(req.user!.userId, dto);
      res.status(201).json({ success: true, data: appointment });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const date = req.query.date as string | undefined;
      const status = req.query.status as string | undefined;

      let result;
      if (req.user!.role === 'PATIENT') {
        result = await appointmentService.getForPatient(req.user!.userId, page, limit);
      } else if (req.user!.role === 'DOCTOR') {
        result = await appointmentService.getForDoctor(req.user!.userId, page, limit, date, status);
      } else {
        res.status(403).json({ success: false, message: 'Insufficient permissions' });
        return;
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
      const appointment = await appointmentService.getById(req.params.id);
      res.json({ success: true, data: appointment });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const dto = validateUpdateAppointmentStatus(req.body);
      const appointment = await appointmentService.updateStatus(req.params.id, dto);
      res.json({ success: true, data: appointment });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async updateNotes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { notes } = req.body;
      const appointment = await appointmentService.updateNotes(req.params.id, notes);
      res.json({ success: true, data: appointment });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },
};
