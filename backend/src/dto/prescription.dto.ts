import { AppError } from '../middleware/error.middleware';

export interface PrescriptionItemDTO {
  medicineId: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface CreatePrescriptionDTO {
  appointmentId: string;
  patientId: string;
  notes?: string;
  items: PrescriptionItemDTO[];
}

export interface UpdatePrescriptionStatusDTO {
  status: 'CREATED' | 'SENT_TO_PHARMACY' | 'PROCESSING' | 'DISPENSED' | 'CANCELLED';
}

export function validateCreatePrescription(data: any): CreatePrescriptionDTO {
  if (!data.appointmentId || typeof data.appointmentId !== 'string') {
    throw new AppError('Appointment ID is required');
  }
  if (!data.patientId || typeof data.patientId !== 'string') {
    throw new AppError('Patient ID is required');
  }
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new AppError('At least one prescription item is required');
  }

  const items: PrescriptionItemDTO[] = data.items.map((item: any, index: number) => {
    if (!item.medicineId) throw new AppError(`Item ${index + 1}: Medicine ID is required`);
    if (!item.quantity || item.quantity <= 0) throw new AppError(`Item ${index + 1}: Quantity must be greater than 0`);
    if (!item.dosage) throw new AppError(`Item ${index + 1}: Dosage is required`);
    if (!item.frequency) throw new AppError(`Item ${index + 1}: Frequency is required`);
    if (!item.duration) throw new AppError(`Item ${index + 1}: Duration is required`);

    return {
      medicineId: item.medicineId,
      quantity: parseInt(item.quantity, 10),
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
    };
  });

  return {
    appointmentId: data.appointmentId,
    patientId: data.patientId,
    notes: data.notes || '',
    items,
  };
}

export function validateUpdatePrescriptionStatus(data: any): UpdatePrescriptionStatusDTO {
  const validStatuses = ['CREATED', 'SENT_TO_PHARMACY', 'PROCESSING', 'DISPENSED', 'CANCELLED'];
  if (!data.status || !validStatuses.includes(data.status)) {
    throw new AppError(`Status must be one of: ${validStatuses.join(', ')}`);
  }
  return { status: data.status };
}
