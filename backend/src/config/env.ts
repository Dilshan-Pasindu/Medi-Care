import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'medicare-dev-secret-change-in-production',
  NODE_ENV: process.env.NODE_ENV || 'development',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
};

export function validateEnv(): void {
  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }
}
