import { appointmentRepository } from '../repositories/appointment.repository';
import { userRepository } from '../repositories/user.repository';
import { CreateAppointmentDTO, UpdateAppointmentStatusDTO } from '../dto/appointment.dto';
import { AppError } from '../middleware/error.middleware';
import { pool } from '../config/database';

export const appointmentService = {
  async create(userId: string, dto: CreateAppointmentDTO) {
    const patient = await userRepository.getPatientByUserId(userId);
    if (!patient) {
      throw new AppError('Patient profile not found', 404);
    }

    // Verify doctor exists
    const doctorCheck = await pool.query('SELECT id FROM doctors WHERE id = $1', [dto.doctorId]);
    if (!doctorCheck.rows[0]) {
      throw new AppError('Selected doctor does not exist', 404);
    }

    // Check for conflicting appointment with the same doctor at the same slot
    const hasConflict = await appointmentRepository.checkConflict(dto.doctorId, dto.date, dto.time);
    if (hasConflict) {
      throw new AppError('This doctor already has a booked appointment at this date and time. Please select another slot.', 409);
    }

    return appointmentRepository.create(
      patient.id,
      dto.doctorId,
      dto.date,
      dto.time,
      dto.symptoms || []
    );
  },

  async getById(id: string) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }
    return appointment;
  },

  async getForPatient(userId: string, page: number, limit: number) {
    const patient = await userRepository.getPatientByUserId(userId);
    if (!patient) {
      throw new AppError('Patient profile not found', 404);
    }
    return appointmentRepository.findByPatientId(patient.id, { page, limit });
  },

  async getForDoctor(userId: string, page: number, limit: number, date?: string, status?: string) {
    const doctor = await userRepository.getDoctorByUserId(userId);
    if (!doctor) {
      throw new AppError('Doctor profile not found', 404);
    }
    return appointmentRepository.findByDoctorId(doctor.id, { page, limit }, date, status);
  },

  async updateStatus(id: string, dto: UpdateAppointmentStatusDTO) {
    const appointment = await appointmentRepository.updateStatus(id, dto.status);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }
    return appointment;
  },

  async updateNotes(id: string, notes: string) {
    const appointment = await appointmentRepository.updateNotes(id, notes);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }
    return appointment;
  },
};
