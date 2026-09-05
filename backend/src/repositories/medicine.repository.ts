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

  async create(data: {
    name: string;
    category: string;
    price: number;
    stock_quantity: number;
    minimum_stock: number;
    expiry_date?: string;
  }) {
    const result = await pool.query(
      `INSERT INTO medicines (name, category, price, stock_quantity, minimum_stock, expiry_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.name, data.category, data.price, data.stock_quantity, data.minimum_stock, data.expiry_date || null]
    );
    return result.rows[0];
  },

  async update(id: string, data: {
    name?: string;
    category?: string;
    price?: number;
    stock_quantity?: number;
    minimum_stock?: number;
    expiry_date?: string;
  }) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.name !== undefined)           { fields.push(`name = $${idx++}`);           values.push(data.name); }
    if (data.category !== undefined)       { fields.push(`category = $${idx++}`);       values.push(data.category); }
    if (data.price !== undefined)          { fields.push(`price = $${idx++}`);          values.push(data.price); }
    if (data.stock_quantity !== undefined) { fields.push(`stock_quantity = $${idx++}`); values.push(data.stock_quantity); }
    if (data.minimum_stock !== undefined)  { fields.push(`minimum_stock = $${idx++}`);  values.push(data.minimum_stock); }
    if (data.expiry_date !== undefined)    { fields.push(`expiry_date = $${idx++}`);    values.push(data.expiry_date || null); }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE medicines SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async delete(id: string) {
    const result = await pool.query(
      'DELETE FROM medicines WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0] || null;
  },
};
