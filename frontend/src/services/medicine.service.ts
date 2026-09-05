import { api } from './api';
import { PaginatedResponse, Medicine, ApiResponse } from '../types';

export interface MedicinePayload {
  name: string;
  category: string;
  price: number;
  stock_quantity: number;
  minimum_stock: number;
  expiry_date?: string;
}

export const medicineService = {
  async getAll(page = 1, limit = 10) {
    return api.get<PaginatedResponse<Medicine>>(`/api/medicines?page=${page}&limit=${limit}`);
  },

  async search(query: string, page = 1, limit = 10) {
    return api.get<PaginatedResponse<Medicine>>(`/api/medicines/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  },

  async getById(id: string) {
    const res = await api.get<{ success: boolean; data: Medicine }>(`/api/medicines/${id}`);
    return res.data;
  },

  async create(data: MedicinePayload) {
    const res = await api.post<ApiResponse<Medicine>>('/api/medicines', data);
    return res.data;
  },

  async update(id: string, data: Partial<MedicinePayload>) {
    const res = await api.put<ApiResponse<Medicine>>(`/api/medicines/${id}`, data);
    return res.data;
  },

  async delete(id: string) {
    await api.delete(`/api/medicines/${id}`);
  },
};
