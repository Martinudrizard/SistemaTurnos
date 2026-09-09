import dotenv from 'dotenv';
dotenv.config();

import { createServer } from './app';
import { initDb } from './db';

const PORT = Number(process.env.PORT) || 4000;

const server = createServer();

// Initialize DB connections gracefully
initDb().catch((err) => console.warn('DB Init Notice:', err.message));

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${PORT} (0.0.0.0:${PORT})`);
});
