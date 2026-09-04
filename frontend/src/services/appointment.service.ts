import { api } from './api';
import { ApiResponse, PaginatedResponse, Appointment } from '../types';

export const appointmentService = {
  async getAll(page = 1, limit = 20, date?: string, status?: string) {
    let query = `/api/appointments?page=${page}&limit=${limit}`;
    if (date) query += `&date=${date}`;
    if (status) query += `&status=${status}`;
    return api.get<PaginatedResponse<Appointment>>(query);
  },

  async getById(id: string) {
    const res = await api.get<ApiResponse<Appointment>>(`/api/appointments/${id}`);
    return res.data;
  },

  async create(data: { doctorId: string; date: string; time: string; symptoms?: string[] }) {
    const res = await api.post<ApiResponse<Appointment>>('/api/appointments', data);
    return res.data;
  },

  async updateStatus(id: string, status: string) {
    const res = await api.patch<ApiResponse<Appointment>>(`/api/appointments/${id}/status`, { status });
    return res.data;
  },

  async updateNotes(id: string, notes: string) {
    const res = await api.patch<ApiResponse<Appointment>>(`/api/appointments/${id}/notes`, { notes });
    return res.data;
  },
};
