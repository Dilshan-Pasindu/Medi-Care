import { api } from './api';
import { ApiResponse, User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
}

export const authService = {
  async register(data: RegisterPayload) {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/api/auth/register', data);
    return res.data;
  },

  async login(email: string, password: string) {
    const res = await api.post<ApiResponse<{ token: string; user: User }>>('/api/auth/login', { email, password });
    return res.data;
  },

  async getMe() {
    const res = await api.get<ApiResponse<User>>('/api/auth/me');
    return res.data;
  },
};
