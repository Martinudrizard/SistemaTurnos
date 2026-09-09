import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pgPool } from '../db';

const router = Router();

// GET /api/clubs
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pgPool.query('SELECT * FROM clubs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (e: any) {
    console.error('Error fetching clubs:', e);
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

// POST /api/clubs
router.post('/', async (req: Request, res: Response) => {
  const { name, clubName, ownerName, owner_name, ownerEmail, owner_email, password, phone, city, maxCourts, max_courts, plan } = req.body;
  const finalName = name || clubName;
  const finalOwnerEmail = ownerEmail || owner_email || '';
  const finalOwnerName = ownerName || owner_name || '';
  const finalMaxCourts = Number(maxCourts || max_courts || 4);

  if (!finalName) {
    return res.status(400).json({ error: 'Nombre del club es requerido' });
  }

  const slug = finalName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  try {
    let ownerId = null;

    // If owner email provided, create or link user
    if (finalOwnerEmail) {
      const userCheck = await pgPool.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [finalOwnerEmail.trim()]);
      if (userCheck.rows.length > 0) {
        ownerId = userCheck.rows[0].id;
      } else {
        const hash = await bcrypt.hash(password || 'padel123', 10);
        const newUser = await pgPool.query(
          'INSERT INTO users (email, password_hash, display_name, role) VALUES ($1, $2, $3, $4) RETURNING id',
          [finalOwnerEmail.trim().toLowerCase(), hash, finalOwnerName || finalName, 'owner']
        );
        ownerId = newUser.rows[0].id;
      }
    }

    const clubRes = await pgPool.query(
      `INSERT INTO clubs (name, slug, owner_id, owner_name, owner_email, phone, city, max_courts, plan, status, ai_bot_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', true)
       RETURNING *`,
      [finalName, slug, ownerId, finalOwnerName, finalOwnerEmail, phone || '', city || '', finalMaxCourts, plan || 'Pro']
    );
    const newClub = clubRes.rows[0];

    if (ownerId) {
      await pgPool.query('UPDATE users SET club_id = $1 WHERE id = $2', [newClub.id, ownerId]);
    }

    // Auto-create default courts
    await pgPool.query(
      `INSERT INTO courts (club_id, name, surface, indoor) VALUES
       ($1, 'Cancha 1 (Cristal)', 'Cristal Panorámico', true),
       ($1, 'Cancha 2 (Sintético)', 'Césped Sintético Pro', false)`,
      [newClub.id]
    );

    res.status(201).json(newClub);
  } catch (e: any) {
    console.error('Error creating club:', e);
    res.status(500).json({ error: e.message || 'Failed to create club' });
  }
});

export default router;
