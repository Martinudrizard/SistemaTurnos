import { Router, Request, Response } from 'express';
import { pgPool } from '../db';

const router = Router();

// GET /api/courts/:clubId - List courts for a club
router.get('/:clubId', async (req: Request, res: Response) => {
  const { clubId } = req.params;
  try {
    const result = await pgPool.query('SELECT * FROM courts WHERE club_id = $1 ORDER BY name ASC', [clubId]);
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch courts' });
  }
});

// POST /api/courts - Create new court (checks max_courts quota)
router.post('/', async (req: Request, res: Response) => {
  const { club_id, name, surface, indoor } = req.body;
  if (!club_id || !name) {
    return res.status(400).json({ error: 'club_id and name are required' });
  }
  try {
    const clubResult = await pgPool.query('SELECT max_courts FROM clubs WHERE id = $1', [club_id]);
    if (clubResult.rows.length === 0) {
      return res.status(404).json({ error: 'Club not found' });
    }
    const maxCourts = clubResult.rows[0].max_courts;

    const countResult = await pgPool.query('SELECT COUNT(*) FROM courts WHERE club_id = $1', [club_id]);
    const currentCount = parseInt(countResult.rows[0].count, 10);

    if (currentCount >= maxCourts) {
      return res.status(403).json({
        error: 'Court limit reached',
        maxCourts,
        currentCount,
        message: `Límite alcanzado (${currentCount}/${maxCourts} canchas). Contactá al Super Admin para ampliar el cupo.`,
      });
    }

    const insertResult = await pgPool.query(
      'INSERT INTO courts (club_id, name, surface, indoor) VALUES ($1, $2, $3, $4) RETURNING *',
      [club_id, name, surface || 'Cristal Panorámico', indoor ?? true]
    );
    res.status(201).json(insertResult.rows[0]);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message || 'Failed to create court' });
  }
});

export default router;
