import { Pool } from 'pg';
import { createClient } from 'redis';
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
  console.warn('⚠️ PostgreSQL Client Pool Warning/Error (non-fatal):', err.message);
});

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  // Silent warning for Redis in development if not attached
  // console.warn('Redis Warning:', err.message);
});

export const initDb = async () => {
  try {
    if (process.env.DATABASE_URL) {
      await pgPool.connect();
      console.log('✅ PostgreSQL connected successfully');
    }
  } catch (e: any) {
    console.warn('⚠️ PostgreSQL could not connect on startup (continuing with mock data):', e.message);
  }

  try {
    if (process.env.REDIS_URL) {
      await redisClient.connect();
      console.log('✅ Redis connected successfully');
    }
  } catch (e: any) {
    console.warn('⚠️ Redis not available (continuing):', e.message);
  }
};
