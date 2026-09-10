import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/padel_db';
const isInternalRailway = connectionString.includes('railway.internal');
const isRemoteWithSsl =
  Boolean(process.env.DATABASE_URL) &&
  !isInternalRailway &&
  !connectionString.includes('localhost') &&
  !connectionString.includes('127.0.0.1');

export const pgPool = new Pool({
  connectionString,
  ssl: isRemoteWithSsl ? { rejectUnauthorized: false } : undefined,
});

pgPool.on('error', (err) => {
  console.warn('⚠️ PostgreSQL Pool Error:', err.message);
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
      ALTER TABLE clubs ADD COLUMN IF NOT EXISTS mp_access_token TEXT;
      ALTER TABLE clubs ADD COLUMN IF NOT EXISTS mp_public_key TEXT;
      ALTER TABLE clubs ADD COLUMN IF NOT EXISTS custom_whatsapp_msg TEXT DEFAULT '¡Hola! Te damos la bienvenida a nuestro complejo.';
      ALTER TABLE clubs ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
      ALTER TABLE clubs ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'paid';
      ALTER TABLE clubs ADD COLUMN IF NOT EXISTS last_payment_date VARCHAR(50);
      ALTER TABLE clubs ADD COLUMN IF NOT EXISTS monthly_fee NUMERIC(10,2) DEFAULT 30000;
      ALTER TABLE reservations ADD COLUMN IF NOT EXISTS booking_type VARCHAR(50) DEFAULT 'casual';
      ALTER TABLE reservations ADD COLUMN IF NOT EXISTS day_of_week INT;
      ALTER TABLE reservations ALTER COLUMN date_str TYPE VARCHAR(100);
      ALTER TABLE reservations ALTER COLUMN time_slot TYPE VARCHAR(50);
      ALTER TABLE reservations ALTER COLUMN status TYPE VARCHAR(50);
      ALTER TABLE reservations ALTER COLUMN player_name TYPE VARCHAR(150);
      ALTER TABLE reservations ALTER COLUMN player_phone TYPE VARCHAR(50);
    `);
    console.log('✅ Verified club pricing, schedule, and payment columns in PostgreSQL!');

    client.release();
  } catch (e: any) {
    console.warn('⚠️ PostgreSQL initialization warning:', e.message);
  }
};
