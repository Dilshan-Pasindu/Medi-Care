import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { adminService } from '../services/admin.service';

export const adminController = {
  async listUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await adminService.listUsers();
      res.json({ success: true, data: users });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, message: error.message });
    }
  },

  async updateUserRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      // Prevent admin from changing their own role
      if (req.user?.userId === id) {
        res.status(400).json({ success: false, message: 'You cannot change your own role' });
        return;
      }

      const updatedUser = await adminService.updateUserRole(id, role);
      res.json({ success: true, data: updatedUser });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, message: error.message });
    }
  },
};
