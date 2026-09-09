// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRouter from './routes/auth';
import clubsRouter from './routes/clubs';
import courtsRouter from './routes/courts';
import reservationsRouter from './routes/reservations';
import paymentsRouter from './routes/payments';
import aiRouter from './routes/ai';

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(morgan('dev'));

  // Routes
  app.use('/api/auth', authRouter);
  app.use('/api/clubs', clubsRouter);
  app.use('/api/courts', courtsRouter);
  app.use('/api/reservations', reservationsRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/ai', aiRouter);

  // Basic health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  });

  return app;
}
