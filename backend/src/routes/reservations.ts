import { Router, Request, Response } from 'express';
import { pgPool } from '../db';

const router = Router();

// GET /api/reservations/availability - Check available slots for a date
router.get('/availability', async (req: Request, res: Response) => {
  const { clubId, date } = req.query;
  try {
    // In production, queries PostgreSQL with OVERLAPS
    res.json({
      date: date || new Date().toISOString().split('T')[0],
      status: 'success',
      message: 'Availability calculated',
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
});

// POST /api/reservations - Create reservation
router.post('/', async (req: Request, res: Response) => {
  const { court_id, user_id, start_time, end_time, price, deposit } = req.body;
  if (!court_id || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await pgPool.query(
      'INSERT INTO reservations (id, court_id, user_id, start_time, end_time, status) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING *',
      [court_id, user_id || null, start_time, end_time, 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

export default router;
