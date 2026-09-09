// src/routes/clubs.ts
import { Router, Request, Response } from 'express';
import { pgPool } from '../db';

const router = Router();

// GET /api/clubs - list clubs (admin)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pgPool.query('SELECT * FROM clubs');
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

// POST /api/clubs - create a new club (admin)
router.post('/', async (req: Request, res: Response) => {
  const { name, owner_id, max_courts } = req.body;
  if (!name || !owner_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const result = await pgPool.query(
      'INSERT INTO clubs (id, name, owner_id, max_courts) VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *',
      [name, owner_id, max_courts || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create club' });
  }
});

export default router;
