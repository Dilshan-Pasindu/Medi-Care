import { AppError } from '../middleware/error.middleware';

export interface CreateAppointmentDTO {
  doctorId: string;
  date: string;
  time: string;
  symptoms?: string[];
}

export interface UpdateAppointmentStatusDTO {
  status: 'BOOKED' | 'COMPLETED' | 'CANCELLED';
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}(:\d{2})?$/;

export function validateCreateAppointment(data: any): CreateAppointmentDTO {
  if (!data.doctorId || typeof data.doctorId !== 'string' || data.doctorId.trim().length === 0) {
    throw new AppError('Doctor ID is required', 400);
  }

  if (!data.date || typeof data.date !== 'string' || !DATE_REGEX.test(data.date.trim())) {
    throw new AppError('A valid date is required in YYYY-MM-DD format', 400);
  }

  // Validate appointment date is not in the past
  const appointmentDate = new Date(`${data.date.trim()}T23:59:59`);
  const now = new Date();
  if (isNaN(appointmentDate.getTime())) {
    throw new AppError('Invalid appointment date', 400);
  }
  if (appointmentDate < now) {
    throw new AppError('Appointment date cannot be in the past', 400);
  }

  if (!data.time || typeof data.time !== 'string' || !TIME_REGEX.test(data.time.trim())) {
    throw new AppError('A valid appointment time is required (e.g. 09:30)', 400);
  }

  return {
    doctorId: data.doctorId.trim(),
    date: data.date.trim(),
    time: data.time.trim().substring(0, 5), // normalize to HH:MM
    symptoms: Array.isArray(data.symptoms) ? data.symptoms.filter((s: any) => typeof s === 'string' && s.trim().length > 0) : [],
  };
}

export function validateUpdateAppointmentStatus(data: any): UpdateAppointmentStatusDTO {
  const validStatuses = ['BOOKED', 'COMPLETED', 'CANCELLED'];
  if (!data.status || !validStatuses.includes(data.status)) {
    throw new AppError(`Status must be one of: ${validStatuses.join(', ')}`, 400);
  }
  return { status: data.status };
}
