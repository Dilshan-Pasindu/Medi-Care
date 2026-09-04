import { pool } from '../config/database';

interface PaginationParams {
  page: number;
  limit: number;
}

export const medicineRepository = {
  async findAll({ page, limit }: PaginationParams) {
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM medicines');
    const result = await pool.query(
      'SELECT * FROM medicines ORDER BY name LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },

  async findById(id: string) {
    const result = await pool.query('SELECT * FROM medicines WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async search(query: string, { page, limit }: PaginationParams) {
    const offset = (page - 1) * limit;
    const searchPattern = `%${query}%`;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM medicines WHERE name ILIKE $1 OR category ILIKE $1',
      [searchPattern]
    );

    const result = await pool.query(
      'SELECT * FROM medicines WHERE name ILIKE $1 OR category ILIKE $1 ORDER BY name LIMIT $2 OFFSET $3',
      [searchPattern, limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },

  async decreaseStock(medicineId: string, quantity: number) {
    const result = await pool.query(
      `UPDATE medicines 
       SET stock_quantity = stock_quantity - $1 
       WHERE id = $2 AND stock_quantity >= $1
       RETURNING *`,
      [quantity, medicineId]
    );
    return result.rows[0] || null;
  },

  async findByIds(ids: string[]) {
    const result = await pool.query(
      'SELECT * FROM medicines WHERE id = ANY($1)',
      [ids]
    );
    return result.rows;
  },
};
