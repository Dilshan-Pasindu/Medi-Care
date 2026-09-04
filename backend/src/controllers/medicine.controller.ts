import { Request, Response } from 'express';
import { medicineService } from '../services/medicine.service';

export const medicineController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await medicineService.getAll(page, limit);
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

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const medicine = await medicineService.getById(req.params.id);
      res.json({ success: true, data: medicine });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async search(req: Request, res: Response): Promise<void> {
    try {
      const query = (req.query.q || req.query.query || '') as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await medicineService.search(query, page, limit);
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

  async create(req: Request, res: Response): Promise<void> {
    try {
      const medicine = await medicineService.create(req.body);
      res.status(201).json({ success: true, data: medicine });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    try {
      const medicine = await medicineService.update(req.params.id, req.body);
      res.json({ success: true, data: medicine });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await medicineService.delete(req.params.id);
      res.json({ success: true, message: 'Medicine deleted successfully' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },
};
