import { pool } from '../config/database';

export const adminRepository = {
  async listAllUsers() {
    const result = await pool.query(
      `SELECT id, name, email, role, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async updateRole(userId: string, newRole: string) {
    const result = await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2
       RETURNING id, name, email, role, created_at`,
      [newRole, userId]
    );
    return result.rows[0] || null;
  },

  async findById(userId: string) {
    const result = await pool.query(
      `SELECT id, name, email, role FROM users WHERE id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  },
};
