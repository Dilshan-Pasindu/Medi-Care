import { api } from './api';
import { ApiResponse, Specialist, Symptom, SpecialistRecommendation, Doctor } from '../types';

export const specialistService = {
  async getAll() {
    const res = await api.get<ApiResponse<Specialist[]>>('/api/specialists');
    return res.data;
  },

  async getSymptoms() {
    const res = await api.get<ApiResponse<Symptom[]>>('/api/specialists/symptoms');
    return res.data;
  },

  async recommend(symptomIds: string[]) {
    const res = await api.post<ApiResponse<SpecialistRecommendation[]>>('/api/specialists/recommend', { symptomIds });
    return res.data;
  },

  async getDoctors(specialistId?: string) {
    const query = specialistId ? `?specialistId=${specialistId}` : '';
    const res = await api.get<ApiResponse<Doctor[]>>(`/api/specialists/doctors${query}`);
    return res.data;
  },

  async chatAnalyze(message: string, history: Array<{ role: 'user' | 'assistant'; content: string }> = []) {
    const res = await api.post<ApiResponse<import('../types').AIChatAnalysis>>('/api/specialists/chat-analyze', {
      message,
      history,
    });
    return res.data;
  },
};
