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

  async create(data: {
    name: string;
    category: string;
    price: number;
    stock_quantity: number;
    minimum_stock: number;
    expiry_date?: string;
  }) {
    if (!data.name?.trim()) throw new AppError('Medicine name is required', 400);
    if (!data.category?.trim()) throw new AppError('Category is required', 400);
    if (data.price < 0) throw new AppError('Price cannot be negative', 400);
    if (data.stock_quantity < 0) throw new AppError('Stock quantity cannot be negative', 400);
    if (data.minimum_stock < 0) throw new AppError('Minimum stock cannot be negative', 400);
    return medicineRepository.create(data);
  },

  async update(id: string, data: any) {
    const existing = await medicineRepository.findById(id);
    if (!existing) throw new AppError('Medicine not found', 404);
    const updated = await medicineRepository.update(id, data);
    if (!updated) throw new AppError('Nothing to update', 400);
    return updated;
  },

  async delete(id: string) {
    const existing = await medicineRepository.findById(id);
    if (!existing) throw new AppError('Medicine not found', 404);
    await medicineRepository.delete(id);
  },
};
