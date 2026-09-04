import { AppError } from '../middleware/error.middleware';

export interface CreateMedicineDTO {
  name: string;
  category: string;
  price: number;
  stockQuantity: number;
  minimumStock: number;
  expiryDate?: string;
}

export function validateCreateMedicine(data: any): CreateMedicineDTO {
  if (!data.name || typeof data.name !== 'string') {
    throw new AppError('Medicine name is required');
  }
  if (!data.category || typeof data.category !== 'string') {
    throw new AppError('Category is required');
  }
  if (data.price === undefined || data.price < 0) {
    throw new AppError('Price must be a non-negative number');
  }
  if (data.stockQuantity === undefined || data.stockQuantity < 0) {
    throw new AppError('Stock quantity must be a non-negative number');
  }

  return {
    name: data.name,
    category: data.category,
    price: parseFloat(data.price),
    stockQuantity: parseInt(data.stockQuantity, 10),
    minimumStock: parseInt(data.minimumStock || '10', 10),
    expiryDate: data.expiryDate,
  };
}
