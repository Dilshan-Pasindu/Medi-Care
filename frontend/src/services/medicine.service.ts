import { api } from './api';
import { PaginatedResponse, Medicine } from '../types';

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
};
