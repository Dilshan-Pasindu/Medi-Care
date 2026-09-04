import { Request, Response } from 'express';
import { specialistService } from '../services/specialist.service';
import { aiService } from '../services/ai.service';

export const specialistController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const specialists = await specialistService.getAll();
      res.json({ success: true, data: specialists });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async getSymptoms(_req: Request, res: Response): Promise<void> {
    try {
      const symptoms = await specialistService.getSymptoms();
      res.json({ success: true, data: symptoms });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async recommend(req: Request, res: Response): Promise<void> {
    try {
      const { symptomIds } = req.body;
      const recommendations = await specialistService.recommend(symptomIds);
      res.json({ success: true, data: recommendations });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async getDoctors(req: Request, res: Response): Promise<void> {
    try {
      const specialistId = req.query.specialistId as string | undefined;
      const doctors = await specialistService.getDoctors(specialistId);
      res.json({ success: true, data: doctors });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },

  async chatAnalyze(req: Request, res: Response): Promise<void> {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ success: false, message: 'Message is required' });
        return;
      }
      const result = await aiService.analyzeCondition(message, history || []);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  },
};
