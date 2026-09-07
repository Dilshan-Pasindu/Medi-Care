import { adminRepository } from '../repositories/admin.repository';
import { AppError } from '../middleware/error.middleware';

const ALLOWED_ROLES = ['PATIENT', 'DOCTOR', 'PHARMACIST', 'ADMIN'];

export const adminService = {
  async listUsers() {
    return adminRepository.listAllUsers();
  },

  async updateUserRole(userId: string, newRole: string) {
    if (!ALLOWED_ROLES.includes(newRole)) {
      throw new AppError(`Invalid role. Must be one of: ${ALLOWED_ROLES.join(', ')}`, 400);
    }

    const user = await adminRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const updatedUser = await adminRepository.updateRole(userId, newRole);
    return updatedUser;
  },
};
