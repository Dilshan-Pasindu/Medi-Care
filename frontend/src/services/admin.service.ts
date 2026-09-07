import { api } from './api';
import { ApiResponse } from '../types';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'PHARMACIST' | 'ADMIN';
  created_at: string;
}

export const adminService = {
  async listUsers(): Promise<AdminUser[]> {
    const res = await api.get<ApiResponse<AdminUser[]>>('/api/admin/users');
    return res.data;
  },

  async updateUserRole(userId: string, role: string): Promise<AdminUser> {
    const res = await api.patch<ApiResponse<AdminUser>>(`/api/admin/users/${userId}/role`, { role });
    return res.data;
  },
};
