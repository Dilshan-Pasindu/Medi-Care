import { medicineRepository } from '../repositories/medicine.repository';
import { AppError } from '../middleware/error.middleware';

export const medicineService = {
  async getAll(page: number, limit: number) {
    return medicineRepository.findAll({ page, limit });
  },

  async getById(id: string) {
    const medicine = await medicineRepository.findById(id);
    if (!medicine) {
      throw new AppError('Medicine not found', 404);
    }
    return medicine;
  },

  async search(query: string, page: number, limit: number) {
    if (!query || query.trim().length === 0) {
      return medicineRepository.findAll({ page, limit });
    }
    return medicineRepository.search(query.trim(), { page, limit });
  },
};
