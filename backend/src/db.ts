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

const SCHEMA_SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    display_name TEXT,
    role VARCHAR(20) DEFAULT 'player',
    club_id UUID,
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
    console.log('⚠️ DATABASE_URL not set. Running in mock mode.');
    return;
  }

  try {
    const client = await pgPool.connect();
    console.log('✅ Connected to PostgreSQL database!');

    await client.query(SCHEMA_SQL);

    // Make sure column password_hash exists on existing tables
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS club_id UUID;');

    // Seed default SuperAdmin user if not exists
    const superAdminEmail = 'admin@padelsaas.com';
    const checkSuperAdmin = await client.query('SELECT * FROM users WHERE email = $1', [superAdminEmail]);
    if (checkSuperAdmin.rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await client.query(
        'INSERT INTO users (email, password_hash, display_name, role) VALUES ($1, $2, $3, $4)',
        [superAdminEmail, hash, 'Super Admin', 'superadmin']
      );
      console.log('✅ Seeded default Super Admin user (admin@padelsaas.com / admin123)');
    }

    // Seed default Club Owner if empty
    const clubsCheck = await client.query('SELECT COUNT(*) FROM clubs');
    if (parseInt(clubsCheck.rows[0].count, 10) === 0) {
      const ownerEmail = 'esteban@latoska.com.ar';
      const ownerHash = await bcrypt.hash('padel123', 10);
      
      const userRes = await client.query(
        'INSERT INTO users (email, password_hash, display_name, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [ownerEmail, ownerHash, 'Esteban Rossi', 'owner']
      );
      const ownerUserId = userRes.rows[0].id;

      const seedClub = await client.query(`
        INSERT INTO clubs (name, slug, owner_id, owner_name, owner_email, phone, city, max_courts, plan, status, ai_bot_enabled)
        VALUES ('La Toska Pádel', 'latoska-er', '${ownerUserId}', 'Esteban Rossi', '${ownerEmail}', '+54 9 343 555-1234', 'Paraná, Entre Ríos', 4, 'Pro', 'active', true)
        RETURNING id;
      `);
      const clubId = seedClub.rows[0].id;

      await client.query('UPDATE users SET club_id = $1 WHERE id = $2', [clubId, ownerUserId]);

      await client.query(`
        INSERT INTO courts (club_id, name, surface, indoor) VALUES
        ('${clubId}', 'Cancha 1 (Central)', 'Cristal Panorámico', true),
        ('${clubId}', 'Cancha 2 (WPT)', 'Cristal Panorámico', true),
        ('${clubId}', 'Cancha 3', 'Césped Sintético Pro', false),
        ('${clubId}', 'Cancha 4', 'Césped Sintético Pro', false);
      `);
      console.log('✅ Seeded default Club Owner (esteban@latoska.com.ar / padel123)');
    }

    client.release();
  } catch (e: any) {
    console.warn('⚠️ PostgreSQL initialization warning:', e.message);
  }
};
