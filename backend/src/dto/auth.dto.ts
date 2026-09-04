import { AppError } from '../middleware/error.middleware';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(data: any): RegisterDTO {
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    throw new AppError('Full name must be at least 2 characters long', 400);
  }

  if (!data.email || typeof data.email !== 'string' || !EMAIL_REGEX.test(data.email.trim())) {
    throw new AppError('Please provide a valid email address', 400);
  }

  if (!data.password || typeof data.password !== 'string' || data.password.length < 6) {
    throw new AppError('Password must be at least 6 characters long', 400);
  }

  if (data.phone && typeof data.phone === 'string') {
    const cleanPhone = data.phone.replace(/[\s\-()]/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      throw new AppError('Please provide a valid phone number (8-15 digits)', 400);
    }
  }

  if (data.dateOfBirth && typeof data.dateOfBirth === 'string') {
    const dob = new Date(data.dateOfBirth);
    const now = new Date();
    if (isNaN(dob.getTime())) {
      throw new AppError('Invalid date of birth format', 400);
    }
    if (dob >= now) {
      throw new AppError('Date of birth cannot be today or in the future', 400);
    }
  }

  return {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    phone: data.phone?.trim() || undefined,
    dateOfBirth: data.dateOfBirth?.trim() || undefined,
  };
}

export function validateLogin(data: any): LoginDTO {
  if (!data.email || typeof data.email !== 'string' || !EMAIL_REGEX.test(data.email.trim())) {
    throw new AppError('Please provide a valid email address', 400);
  }

  if (!data.password || typeof data.password !== 'string') {
    throw new AppError('Password is required', 400);
  }

  return {
    email: data.email.trim().toLowerCase(),
    password: data.password,
  };
}
