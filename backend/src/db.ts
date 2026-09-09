import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/padel_db';

export const pgPool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_URL?.includes('railway') || process.env.DATABASE_URL?.includes('render')
    ? { rejectUnauthorized: false }
    : undefined,
});

pgPool.on('error', (err) => {
  console.warn('⚠️ PostgreSQL Pool Error (non-fatal):', err.message);
});

export const initDb = async () => {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️ DATABASE_URL not set. Running in mock mode.');
    return;
  }

  try {
    const client = await pgPool.connect();
    console.log('✅ Connected to PostgreSQL database!');

    // Add new configuration columns to clubs table if not exist
    await client.query(`
      ALTER TABLE clubs ADD COLUMN IF NOT EXISTS open_time VARCHAR(10) DEFAULT '14:00';
      ALTER TABLE clubs ADD COLUMN IF NOT EXISTS close_time VARCHAR(10) DEFAULT '01:00';
      ALTER TABLE clubs ADD COLUMN IF NOT EXISTS slot_duration_min INT DEFAULT 90;
      ALTER TABLE clubs ADD COLUMN IF NOT EXISTS price_day NUMERIC(10,2) DEFAULT 14000;
      ALTER TABLE clubs ADD COLUMN IF NOT EXISTS price_night NUMERIC(10,2) DEFAULT 18000;
      ALTER TABLE clubs ADD COLUMN IF NOT EXISTS light_start_time VARCHAR(10) DEFAULT '18:30';
      ALTER TABLE clubs ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10,2) DEFAULT 8000;
    `);
    console.log('✅ Verified club pricing and schedule columns in PostgreSQL!');

    client.release();
  } catch (e: any) {
    console.warn('⚠️ PostgreSQL initialization warning:', e.message);
  }
};
