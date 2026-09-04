import { Pool } from 'pg';
import { env } from './env';

const isSupabase = env.DATABASE_URL.includes('supabase.co') || env.DATABASE_URL.includes('pooler.supabase.com');
const useSsl = env.NODE_ENV === 'production' || isSupabase;

export const pool = new Pool({
  connectionString: env.DATABASE_URL || undefined,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export async function testConnection(): Promise<void> {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required to connect to PostgreSQL');
  }

  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Connected to Supabase PostgreSQL database successfully');
  } catch (error: any) {
    console.error(`❌ PostgreSQL connection failed: ${error.message}`);
    throw error;
  }
}
