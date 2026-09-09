import { Router, Request, Response } from 'express';
import { pgPool } from '../db';

const router = Router();

const MOCK_CLUBS = [
  {
    id: 'club-1',
    name: 'La Toska Pádel',
    slug: 'latoska-er',
    owner_name: 'Esteban Rossi',
    owner_email: 'esteban@latoska.com.ar',
    phone: '+54 9 343 555-1234',
    city: 'Paraná, Entre Ríos',
    max_courts: 4,
    plan: 'Pro',
    status: 'active',
    ai_bot_enabled: true,
  },
  {
    id: 'club-2',
    name: 'Smash Padel Club',
    slug: 'smash-padel',
    owner_name: 'Lucía Fernández',
    owner_email: 'lucia@smashpadel.com',
    phone: '+54 9 341 444-5678',
    city: 'Rosario, Santa Fe',
    max_courts: 8,
    plan: 'Enterprise',
    status: 'active',
    ai_bot_enabled: true,
  }
];

// GET /api/clubs
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pgPool.query('SELECT * FROM clubs ORDER BY created_at DESC');
    if (result.rows.length > 0) {
      return res.json(result.rows);
    }
    return res.json(MOCK_CLUBS);
  } catch (e) {
    console.warn('DB Query fallback to memory for /api/clubs');
    res.json(MOCK_CLUBS);
  }
});

// POST /api/clubs
router.post('/', async (req: Request, res: Response) => {
  const { name, owner_name, owner_email, phone, city, max_courts, plan } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  try {
    const result = await pgPool.query(
      `INSERT INTO clubs (name, slug, owner_name, owner_email, phone, city, max_courts, plan, status, ai_bot_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', true)
       RETURNING *`,
      [name, slug, owner_name || '', owner_email || '', phone || '', city || '', max_courts || 4, plan || 'Pro']
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    console.warn('DB insert fallback for /api/clubs');
    const newClub = {
      id: `club-${Date.now()}`,
      name,
      slug,
      owner_name,
      owner_email,
      phone,
      city,
      max_courts: max_courts || 4,
      plan: plan || 'Pro',
      status: 'active',
      ai_bot_enabled: true,
    };
    res.status(201).json(newClub);
  }
});

export default router;
