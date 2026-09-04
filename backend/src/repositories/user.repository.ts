import { pool } from '../config/database';

export const userRepository = {
  async findByEmail(email: string) {
    const result = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  },

  async findById(id: string) {
    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async getPatientByUserId(userId: string) {
    const result = await pool.query(
      'SELECT p.id, p.user_id, p.phone, p.date_of_birth::TEXT as date_of_birth, u.name, u.email FROM patients p JOIN users u ON p.user_id = u.id WHERE p.user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  },

  async getDoctorByUserId(userId: string) {
    const result = await pool.query(
      `SELECT d.id, d.user_id, d.specialist_id, u.name, u.email, s.name as specialist_name 
       FROM doctors d 
       JOIN users u ON d.user_id = u.id 
       JOIN specialists s ON d.specialist_id = s.id 
       WHERE d.user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  async createPatientUser(name: string, email: string, passwordHash: string, phone?: string, dateOfBirth?: string) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userRes = await client.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, 'PATIENT')
         RETURNING id, name, email, role, created_at`,
        [name, email, passwordHash]
      );
      const newUser = userRes.rows[0];

      const patientRes = await client.query(
        `INSERT INTO patients (user_id, phone, date_of_birth)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, phone, date_of_birth::TEXT as date_of_birth`,
        [newUser.id, phone || null, dateOfBirth || null]
      );
      const newPatient = patientRes.rows[0];

      await client.query('COMMIT');

      return {
        user: newUser,
        patient: newPatient,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};
