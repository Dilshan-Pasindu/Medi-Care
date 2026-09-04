import { pool } from '../config/database';

export const specialistRepository = {
  async findAll() {
    const result = await pool.query(
      'SELECT id, name, description FROM specialists ORDER BY name'
    );
    return result.rows;
  },

  async findById(id: string) {
    const result = await pool.query(
      'SELECT id, name, description FROM specialists WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async getSymptoms() {
    const result = await pool.query('SELECT id, name FROM symptoms ORDER BY name');
    return result.rows;
  },

  async getRecommendation(symptomIds: string[]) {
    const result = await pool.query(
      `SELECT s.id, s.name, s.description, SUM(ss.weight) as total_score
       FROM symptom_specialists ss
       JOIN specialists s ON ss.specialist_id = s.id
       WHERE ss.symptom_id = ANY($1)
       GROUP BY s.id, s.name, s.description
       ORDER BY total_score DESC`,
      [symptomIds]
    );
    return result.rows;
  },

  async getDoctorsBySpecialistId(specialistId: string) {
    const result = await pool.query(
      `SELECT d.id, d.user_id, u.name, u.email, s.name as specialist_name
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       JOIN specialists s ON d.specialist_id = s.id
       WHERE d.specialist_id = $1
       ORDER BY u.name`,
      [specialistId]
    );
    return result.rows;
  },

  async getAllDoctors() {
    const result = await pool.query(
      `SELECT d.id, d.user_id, u.name, u.email, s.name as specialist_name, s.id as specialist_id
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       JOIN specialists s ON d.specialist_id = s.id
       ORDER BY u.name`
    );
    return result.rows;
  },
};
