import { prescriptionRepository } from '../repositories/prescription.repository';
import { userRepository } from '../repositories/user.repository';
import { CreatePrescriptionDTO, UpdatePrescriptionStatusDTO } from '../dto/prescription.dto';
import { AppError } from '../middleware/error.middleware';

export const prescriptionService = {
  async create(userId: string, dto: CreatePrescriptionDTO) {
    const doctor = await userRepository.getDoctorByUserId(userId);
    if (!doctor) {
      throw new AppError('Doctor profile not found', 404);
    }

    return prescriptionRepository.create(
      dto.appointmentId,
      dto.patientId,
      doctor.id,
      dto.notes || '',
      dto.items
    );
  },

  async getById(id: string) {
    const prescription = await prescriptionRepository.findById(id);
    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }
    return prescription;
  },

  async getForPatient(userId: string, page: number, limit: number) {
    const patient = await userRepository.getPatientByUserId(userId);
    if (!patient) {
      throw new AppError('Patient profile not found', 404);
    }
    return prescriptionRepository.findByPatientId(patient.id, { page, limit });
  },

  async getForDoctor(userId: string, page: number, limit: number) {
    const doctor = await userRepository.getDoctorByUserId(userId);
    if (!doctor) {
      throw new AppError('Doctor profile not found', 404);
    }
    return prescriptionRepository.findByDoctorId(doctor.id, { page, limit });
  },

  async getPending(page: number, limit: number) {
    return prescriptionRepository.findPending({ page, limit });
  },

  async getAll(page: number, limit: number) {
    return prescriptionRepository.findAll({ page, limit });
  },

  async updateStatus(id: string, dto: UpdatePrescriptionStatusDTO) {
    const prescription = await prescriptionRepository.updateStatus(id, dto.status);
    if (!prescription) {
      throw new AppError('Prescription not found', 404);
    }
    return prescription;
  },

  async dispense(id: string) {
    try {
      return await prescriptionRepository.dispense(id);
    } catch (error: any) {
      throw new AppError(error.message || 'Failed to dispense prescription');
    }
  },

  async getPharmacyStats() {
    return prescriptionRepository.getPharmacyStats();
  },
};
