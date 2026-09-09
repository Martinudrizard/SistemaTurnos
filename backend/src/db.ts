// src/db.ts
import { Pool } from 'pg';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export const initDb = async () => {
  await pgPool.connect(); // ensures connection works
  await redisClient.connect();
};
