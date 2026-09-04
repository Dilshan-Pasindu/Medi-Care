import { pool } from '../config/database';

interface PaginationParams {
  page: number;
  limit: number;
}

export const appointmentRepository = {
  async checkConflict(doctorId: string, date: string, time: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = $1 AND date = $2 AND time = $3 AND status != 'CANCELLED'
       LIMIT 1`,
      [doctorId, date, time]
    );
    return result.rows.length > 0;
  },

  async create(patientId: string, doctorId: string, date: string, time: string, symptoms: string[]) {
    const result = await pool.query(
      `INSERT INTO appointments (patient_id, doctor_id, date, time, symptoms)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, patient_id, doctor_id, date::TEXT as date, time::TEXT as time, status, symptoms, notes, created_at`,
      [patientId, doctorId, date, time, symptoms]
    );
    return result.rows[0];
  },

  async findById(id: string) {
    const result = await pool.query(
      `SELECT a.id, a.patient_id, a.doctor_id, a.date::TEXT as date, a.time::TEXT as time, a.status, a.symptoms, a.notes, a.created_at,
              p_user.name as patient_name, p.phone as patient_phone, p.date_of_birth::TEXT as patient_dob,
              d_user.name as doctor_name, s.name as specialist_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users p_user ON p.user_id = p_user.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users d_user ON d.user_id = d_user.id
       JOIN specialists s ON d.specialist_id = s.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findByPatientId(patientId: string, { page, limit }: PaginationParams) {
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM appointments WHERE patient_id = $1',
      [patientId]
    );

    const result = await pool.query(
      `SELECT a.id, a.patient_id, a.doctor_id, a.date::TEXT as date, a.time::TEXT as time, a.status, a.symptoms, a.notes, a.created_at,
              d_user.name as doctor_name, s.name as specialist_name
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users d_user ON d.user_id = d_user.id
       JOIN specialists s ON d.specialist_id = s.id
       WHERE a.patient_id = $1
       ORDER BY a.date DESC, a.time DESC
       LIMIT $2 OFFSET $3`,
      [patientId, limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },

  async findByDoctorId(doctorId: string, { page, limit }: PaginationParams, date?: string, status?: string) {
    const offset = (page - 1) * limit;

    const conditions = ['a.doctor_id = $1'];
    const countConditions = ['doctor_id = $1'];
    const params: any[] = [doctorId];
    const countParams: any[] = [doctorId];

    if (date) {
      params.push(date);
      conditions.push(`a.date = $${params.length}`);
      countParams.push(date);
      countConditions.push(`date = $${countParams.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
      countParams.push(status);
      countConditions.push(`status = $${countParams.length}`);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM appointments WHERE ${countConditions.join(' AND ')}`,
      countParams
    );

    params.push(limit);
    const limitIdx = params.length;
    params.push(offset);
    const offsetIdx = params.length;

    const result = await pool.query(
      `SELECT a.id, a.patient_id, a.doctor_id, a.date::TEXT as date, a.time::TEXT as time, a.status, a.symptoms, a.notes, a.created_at,
              p_user.name as patient_name, p.phone as patient_phone, p.date_of_birth::TEXT as patient_dob
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users p_user ON p.user_id = p_user.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.date ASC, a.time ASC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },

  async updateStatus(id: string, status: string) {
    const result = await pool.query(
      `UPDATE appointments SET status = $1 WHERE id = $2 
       RETURNING id, patient_id, doctor_id, date::TEXT as date, time::TEXT as time, status, symptoms, notes, created_at`,
      [status, id]
    );
    return result.rows[0] || null;
  },

  async updateNotes(id: string, notes: string) {
    const result = await pool.query(
      `UPDATE appointments SET notes = $1 WHERE id = $2 
       RETURNING id, patient_id, doctor_id, date::TEXT as date, time::TEXT as time, status, symptoms, notes, created_at`,
      [notes, id]
    );
    return result.rows[0] || null;
  },
};
