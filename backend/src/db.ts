import { Pool } from 'pg';
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

const SCHEMA_SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    role VARCHAR(20) DEFAULT 'player',
    firebase_uid TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    owner_id UUID,
    owner_name TEXT,
    owner_email TEXT,
    phone TEXT,
    city TEXT,
    max_courts INT NOT NULL DEFAULT 4,
    plan VARCHAR(20) DEFAULT 'Pro',
    status VARCHAR(20) DEFAULT 'active',
    ai_bot_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    surface VARCHAR(50) DEFAULT 'Cristal Panorámico',
    indoor BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    court_id UUID REFERENCES courts(id) ON DELETE CASCADE,
    player_name TEXT NOT NULL,
    player_phone TEXT,
    player_email TEXT,
    date_str VARCHAR(20) NOT NULL,
    time_slot VARCHAR(30) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'confirmed',
    price NUMERIC(10,2) DEFAULT 16000,
    deposit_paid NUMERIC(10,2) DEFAULT 8000,
    via_bot BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
    mercado_id TEXT,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
`;

export const initDb = async () => {
  if (!process.env.DATABASE_URL) {
    console.log('⚠️ DATABASE_URL not set. Running in mock memory mode.');
    return;
  }

  try {
    const client = await pgPool.connect();
    console.log('✅ Connected to PostgreSQL database!');

    // Auto-migrate tables
    await client.query(SCHEMA_SQL);
    console.log('✅ Database schema verified / tables created automatically!');

    // Seed default club if empty
    const clubsCheck = await client.query('SELECT COUNT(*) FROM clubs');
    if (parseInt(clubsCheck.rows[0].count, 10) === 0) {
      const seedClub = await client.query(`
        INSERT INTO clubs (name, slug, owner_name, owner_email, phone, city, max_courts, plan, status, ai_bot_enabled)
        VALUES ('La Toska Pádel', 'latoska-er', 'Esteban Rossi', 'esteban@latoska.com.ar', '+54 9 343 555-1234', 'Paraná, Entre Ríos', 4, 'Pro', 'active', true)
        RETURNING id;
      `);
      const clubId = seedClub.rows[0].id;

      await client.query(`
        INSERT INTO courts (club_id, name, surface, indoor) VALUES
        ('${clubId}', 'Cancha 1 (Central)', 'Cristal Panorámico', true),
        ('${clubId}', 'Cancha 2 (WPT)', 'Cristal Panorámico', true),
        ('${clubId}', 'Cancha 3', 'Césped Sintético Pro', false),
        ('${clubId}', 'Cancha 4', 'Césped Sintético Pro', false);
      `);
      console.log('✅ Default club and courts seeded into database!');
    }

    client.release();
  } catch (e: any) {
    console.warn('⚠️ PostgreSQL initialization warning:', e.message);
  }
};
