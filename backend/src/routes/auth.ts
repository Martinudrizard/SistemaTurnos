import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pgPool } from '../db';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'padel-saas-super-secret-key-2026';

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña requeridos' });
  }

  try {
    const userRes = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash || '');
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // If club owner, get their club info
    let club = null;
    if (user.club_id) {
      const clubRes = await pgPool.query('SELECT * FROM clubs WHERE id = $1', [user.club_id]);
      if (clubRes.rows.length > 0) {
        club = clubRes.rows[0];
      }
    } else if (user.role === 'owner') {
      const clubRes = await pgPool.query('SELECT * FROM clubs WHERE owner_id = $1', [user.id]);
      if (clubRes.rows.length > 0) {
        club = clubRes.rows[0];
      }
    }

    if (user.role === 'owner' && club && club.status === 'inactive') {
      return res.status(403).json({
        error: 'Tu cuenta y complejo han sido deshabilitados o dados de baja por el administrador.',
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        clubId: club?.id || user.club_id || null,
        clubName: club?.name || null,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        role: user.role,
        clubId: club?.id || user.club_id || null,
        clubName: club?.name || null,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error en el servidor de autenticación' });
  }
});

// POST /api/auth/register-owner (Created by Super Admin)
router.post('/register-owner', async (req: Request, res: Response) => {
  const { clubName, ownerName, ownerEmail, password, phone, city, maxCourts, plan } = req.body;
  if (!clubName || !ownerEmail || !password) {
    return res.status(400).json({ error: 'Nombre de club, email y contraseña son obligatorios' });
  }

  try {
    // Check if user exists
    const existingUser = await pgPool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [ownerEmail.trim()]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con este correo electrónico' });
    }

    const hash = await bcrypt.hash(password, 10);
    const userRes = await pgPool.query(
      'INSERT INTO users (email, password_hash, display_name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [ownerEmail.trim().toLowerCase(), hash, ownerName || clubName, 'owner']
    );
    const ownerId = userRes.rows[0].id;

    const slug = clubName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const clubRes = await pgPool.query(
      `INSERT INTO clubs (name, slug, owner_id, owner_name, owner_email, phone, city, max_courts, plan, status, ai_bot_enabled)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', true)
       RETURNING *`,
      [clubName, slug, ownerId, ownerName || '', ownerEmail.trim().toLowerCase(), phone || '', city || '', Number(maxCourts) || 4, plan || 'Pro']
    );
    const newClub = clubRes.rows[0];

    // Link user to club
    await pgPool.query('UPDATE users SET club_id = $1 WHERE id = $2', [newClub.id, ownerId]);

    // Create 2 default courts
    await pgPool.query(
      `INSERT INTO courts (club_id, name, surface, indoor) VALUES
       ($1, 'Cancha 1 (Cristal)', 'Cristal Panorámico', true),
       ($1, 'Cancha 2 (Sintético)', 'Césped Sintético Pro', false)`,
      [newClub.id]
    );

    res.status(201).json({
      message: 'Complejo y usuario administrador creados con éxito',
      club: newClub,
      owner: { id: ownerId, email: ownerEmail },
    });
  } catch (error: any) {
    console.error('Register owner error:', error);
    res.status(500).json({ error: error.message || 'Error al crear complejo' });
  }
});

// GET /api/auth/me - Verify token
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
});

export default router;
