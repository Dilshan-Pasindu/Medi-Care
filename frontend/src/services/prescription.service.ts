import { api } from './api';
import { ApiResponse, PaginatedResponse, Prescription, PharmacyStats } from '../types';

export const prescriptionService = {
  async getAll(page = 1, limit = 10, status?: string) {
    let query = `/api/prescriptions?page=${page}&limit=${limit}`;
    if (status) query += `&status=${status}`;
    return api.get<PaginatedResponse<Prescription>>(query);
  },

  async getById(id: string) {
    const res = await api.get<ApiResponse<Prescription>>(`/api/prescriptions/${id}`);
    return res.data;
  },

  async create(data: {
    appointmentId: string;
    patientId: string;
    notes?: string;
    items: { medicineId: string; quantity: number; dosage: string; frequency: string; duration: string }[];
  }) {
    const res = await api.post<ApiResponse<Prescription>>('/api/prescriptions', data);
    return res.data;
  },

  async updateStatus(id: string, status: string) {
    const res = await api.patch<ApiResponse<Prescription>>(`/api/prescriptions/${id}/status`, { status });
    return res.data;
  },

  async dispense(id: string) {
    const res = await api.post<ApiResponse<Prescription>>(`/api/prescriptions/${id}/dispense`);
    return res.data;
  },

  async getPharmacyStats() {
    const res = await api.get<ApiResponse<PharmacyStats>>('/api/prescriptions/pharmacy/stats');
    return res.data;
  },
};
