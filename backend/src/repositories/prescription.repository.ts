import { pool } from '../config/database';
import { PrescriptionItemDTO } from '../dto/prescription.dto';

interface PaginationParams {
  page: number;
  limit: number;
}

export const prescriptionRepository = {
  async create(appointmentId: string, patientId: string, doctorId: string, notes: string, items: PrescriptionItemDTO[]) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const prescResult = await client.query(
        `INSERT INTO prescriptions (appointment_id, patient_id, doctor_id, notes, status)
         VALUES ($1, $2, $3, $4, 'SENT_TO_PHARMACY')
         RETURNING *`,
        [appointmentId, patientId, doctorId, notes]
      );

      const prescription = prescResult.rows[0];

      for (const item of items) {
        await client.query(
          `INSERT INTO prescription_items (prescription_id, medicine_id, quantity, dosage, frequency, duration)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [prescription.id, item.medicineId, item.quantity, item.dosage, item.frequency, item.duration]
        );
      }

      // Calculate total from medicine prices
      const totalResult = await client.query(
        `SELECT SUM(pi.quantity * m.price) as total
         FROM prescription_items pi
         JOIN medicines m ON pi.medicine_id = m.id
         WHERE pi.prescription_id = $1`,
        [prescription.id]
      );

      const total = totalResult.rows[0].total || 0;

      await client.query(
        'UPDATE prescriptions SET total_amount = $1 WHERE id = $2',
        [total, prescription.id]
      );

      // Update appointment status to COMPLETED
      await client.query(
        'UPDATE appointments SET status = $1 WHERE id = $2',
        ['COMPLETED', appointmentId]
      );

      await client.query('COMMIT');

      return { ...prescription, total_amount: total };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async findById(id: string) {
    const prescResult = await pool.query(
      `SELECT p.*, 
              p_user.name as patient_name, pat.phone as patient_phone,
              d_user.name as doctor_name, s.name as specialist_name
       FROM prescriptions p
       JOIN patients pat ON p.patient_id = pat.id
       JOIN users p_user ON pat.user_id = p_user.id
       JOIN doctors d ON p.doctor_id = d.id
       JOIN users d_user ON d.user_id = d_user.id
       JOIN specialists s ON d.specialist_id = s.id
       WHERE p.id = $1`,
      [id]
    );

    if (!prescResult.rows[0]) return null;

    const itemsResult = await pool.query(
      `SELECT pi.*, m.name as medicine_name, m.price, m.stock_quantity, m.category
       FROM prescription_items pi
       JOIN medicines m ON pi.medicine_id = m.id
       WHERE pi.prescription_id = $1
       ORDER BY m.name`,
      [id]
    );

    return {
      ...prescResult.rows[0],
      items: itemsResult.rows,
    };
  },

  async findByPatientId(patientId: string, { page, limit }: PaginationParams) {
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM prescriptions WHERE patient_id = $1',
      [patientId]
    );

    const result = await pool.query(
      `SELECT p.*, 
              d_user.name as doctor_name, s.name as specialist_name
       FROM prescriptions p
       JOIN doctors d ON p.doctor_id = d.id
       JOIN users d_user ON d.user_id = d_user.id
       JOIN specialists s ON d.specialist_id = s.id
       WHERE p.patient_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [patientId, limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },

  async findByDoctorId(doctorId: string, { page, limit }: PaginationParams) {
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM prescriptions WHERE doctor_id = $1',
      [doctorId]
    );

    const result = await pool.query(
      `SELECT p.*, 
              p_user.name as patient_name
       FROM prescriptions p
       JOIN patients pat ON p.patient_id = pat.id
       JOIN users p_user ON pat.user_id = p_user.id
       WHERE p.doctor_id = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [doctorId, limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },

  async findPending({ page, limit }: PaginationParams) {
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM prescriptions WHERE status IN ('SENT_TO_PHARMACY', 'PROCESSING')"
    );

    const result = await pool.query(
      `SELECT p.*, 
              p_user.name as patient_name,
              d_user.name as doctor_name
       FROM prescriptions p
       JOIN patients pat ON p.patient_id = pat.id
       JOIN users p_user ON pat.user_id = p_user.id
       JOIN doctors d ON p.doctor_id = d.id
       JOIN users d_user ON d.user_id = d_user.id
       WHERE p.status IN ('SENT_TO_PHARMACY', 'PROCESSING')
       ORDER BY p.created_at ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },

  async findAll({ page, limit }: PaginationParams) {
    const offset = (page - 1) * limit;

    const countResult = await pool.query('SELECT COUNT(*) FROM prescriptions');

    const result = await pool.query(
      `SELECT p.*, 
              p_user.name as patient_name,
              d_user.name as doctor_name
       FROM prescriptions p
       JOIN patients pat ON p.patient_id = pat.id
       JOIN users p_user ON pat.user_id = p_user.id
       JOIN doctors d ON p.doctor_id = d.id
       JOIN users d_user ON d.user_id = d_user.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
    };
  },

  async updateStatus(id: string, status: string) {
    const result = await pool.query(
      'UPDATE prescriptions SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0] || null;
  },

  async dispense(id: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Lock the prescription row
      const prescResult = await client.query(
        'SELECT * FROM prescriptions WHERE id = $1 FOR UPDATE',
        [id]
      );

      const prescription = prescResult.rows[0];
      if (!prescription) throw new Error('Prescription not found');
      if (prescription.status === 'DISPENSED') throw new Error('Prescription has already been dispensed');
      if (prescription.status === 'CANCELLED') throw new Error('Prescription has been cancelled');

      // Get all items
      const itemsResult = await client.query(
        `SELECT pi.*, m.name as medicine_name, m.stock_quantity, m.price
         FROM prescription_items pi
         JOIN medicines m ON pi.medicine_id = m.id
         WHERE pi.prescription_id = $1`,
        [id]
      );

      const items = itemsResult.rows;

      // Verify stock for all items
      for (const item of items) {
        if (item.stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${item.medicine_name}. Available: ${item.stock_quantity}, Required: ${item.quantity}`);
        }
      }

      // Calculate total server-side
      let total = 0;
      for (const item of items) {
        total += item.quantity * parseFloat(item.price);
      }

      // Decrease stock for each item
      for (const item of items) {
        const updateResult = await client.query(
          'UPDATE medicines SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND stock_quantity >= $1 RETURNING *',
          [item.quantity, item.medicine_id]
        );
        if (!updateResult.rows[0]) {
          throw new Error(`Failed to update stock for ${item.medicine_name}`);
        }
      }

      // Update prescription status and total
      await client.query(
        'UPDATE prescriptions SET status = $1, total_amount = $2 WHERE id = $3',
        ['DISPENSED', total, id]
      );

      await client.query('COMMIT');

      return { ...prescription, status: 'DISPENSED', total_amount: total };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getPharmacyStats() {
    const pending = await pool.query(
      "SELECT COUNT(*) FROM prescriptions WHERE status IN ('SENT_TO_PHARMACY', 'PROCESSING')"
    );
    const dispensedToday = await pool.query(
      "SELECT COUNT(*) FROM prescriptions WHERE status = 'DISPENSED' AND DATE(created_at) = CURRENT_DATE"
    );
    const lowStock = await pool.query(
      'SELECT COUNT(*) FROM medicines WHERE stock_quantity <= minimum_stock'
    );

    return {
      pendingPrescriptions: parseInt(pending.rows[0].count, 10),
      dispensedToday: parseInt(dispensedToday.rows[0].count, 10),
      lowStockMedicines: parseInt(lowStock.rows[0].count, 10),
    };
  },
};
