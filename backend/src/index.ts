// src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import { createServer } from './app';

const PORT = process.env.PORT || 4000;

const server = createServer();

server.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
