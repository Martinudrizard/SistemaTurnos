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

    // 1. Create tables if they do not exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        display_name VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'owner',
        club_id INT,
        firebase_uid TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS clubs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        owner_id INT,
        owner_name VARCHAR(255),
        owner_email VARCHAR(255),
        phone VARCHAR(50),
        city VARCHAR(255),
        max_courts INT DEFAULT 4,
        plan VARCHAR(50) DEFAULT 'Pro',
        status VARCHAR(20) DEFAULT 'active',
        ai_bot_enabled BOOLEAN DEFAULT true,
        open_time VARCHAR(10) DEFAULT '14:00',
        close_time VARCHAR(10) DEFAULT '01:00',
        slot_duration_min INT DEFAULT 90,
        price_day NUMERIC(10,2) DEFAULT 14000,
        price_night NUMERIC(10,2) DEFAULT 18000,
        light_start_time VARCHAR(10) DEFAULT '18:30',
        mp_access_token TEXT,
        mp_public_key TEXT,
        custom_whatsapp_msg TEXT DEFAULT '¡Hola! Te damos la bienvenida a nuestro complejo.',
        payment_status VARCHAR(20) DEFAULT 'paid',
        last_payment_date VARCHAR(50),
        monthly_fee NUMERIC(10,2) DEFAULT 30000,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS courts (
        id SERIAL PRIMARY KEY,
        club_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        surface VARCHAR(100),
        indoor BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        club_id INT NOT NULL,
        court_id INT NOT NULL,
        player_name VARCHAR(150),
        player_phone VARCHAR(50),
        player_email VARCHAR(255),
        date_str VARCHAR(100),
        time_slot VARCHAR(50),
        price NUMERIC(10,2),
        deposit NUMERIC(10,2),
        status VARCHAR(50) DEFAULT 'confirmed',
        booking_type VARCHAR(50) DEFAULT 'casual',
        day_of_week INT,
        is_blocked BOOLEAN DEFAULT false,
        via_bot BOOLEAN DEFAULT false,
        payment_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Add any missing columns for backwards compatibility
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

    // 3. Seed default superadmin if not exists
    const adminEmail = 'admin@padelhub.com';
    const existingAdmin = await client.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [adminEmail]);
    if (existingAdmin.rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (email, password_hash, display_name, role) VALUES ($1, $2, $3, $4)',
        [adminEmail, hash, 'Super Admin', 'superadmin']
      );
      console.log('✅ Default superadmin created: admin@padelhub.com / admin123');
    }

    console.log('✅ Database schema and default accounts initialized!');
    client.release();
  } catch (e: any) {
    console.warn('⚠️ PostgreSQL initialization warning:', e.message);
  }
};
