import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { pgPool } from '../db';
import { sendOwnerCredentialsEmail } from '../services/emailService';

const router = Router();

// GET /api/clubs - List all clubs
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pgPool.query('SELECT * FROM clubs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (e: any) {
    console.error('Error fetching clubs:', e);
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
});

// GET /api/clubs/debug/schema
router.get('/debug/schema', async (_req: Request, res: Response) => {
  try {
    const clubsCols = await pgPool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clubs'"
    );
    const usersCols = await pgPool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'"
    );
    const courtsCols = await pgPool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courts'"
    );
    res.json({
      clubs: clubsCols.rows,
      users: usersCols.rows,
      courts: courtsCols.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clubs/:idOrSlug - Get single club
router.get('/:idOrSlug', async (req: Request, res: Response) => {
  const { idOrSlug } = req.params;
  try {
    const result = await pgPool.query(
      'SELECT * FROM clubs WHERE id::text = $1 OR slug = $1',
      [idOrSlug]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Club no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (e: any) {
    console.error('Error fetching club:', e);
    res.status(500).json({ error: 'Failed to fetch club' });
  }
});

// PUT /api/clubs/:id - Update club customization (hours, pricing, light, status, payments)
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    open_time,
    close_time,
    slot_duration_min,
    price_day,
    price_night,
    light_start_time,
    deposit_amount,
    phone,
    city,
    mp_access_token,
    mp_public_key,
    custom_whatsapp_msg,
    ai_bot_enabled,
    status,
    payment_status,
    last_payment_date,
    monthly_fee,
  } = req.body;

  try {
    const result = await pgPool.query(
      `UPDATE clubs
       SET open_time = COALESCE($1, open_time),
           close_time = COALESCE($2, close_time),
           slot_duration_min = COALESCE($3, slot_duration_min),
           price_day = COALESCE($4, price_day),
           price_night = COALESCE($5, price_night),
           light_start_time = COALESCE($6, light_start_time),
           deposit_amount = COALESCE($7, deposit_amount),
           phone = COALESCE($8, phone),
           city = COALESCE($9, city),
           mp_access_token = COALESCE($10, mp_access_token),
           mp_public_key = COALESCE($11, mp_public_key),
           custom_whatsapp_msg = COALESCE($12, custom_whatsapp_msg),
           ai_bot_enabled = COALESCE($13, ai_bot_enabled),
           status = COALESCE($14, status),
           payment_status = COALESCE($15, payment_status),
           last_payment_date = COALESCE($16, last_payment_date),
           monthly_fee = COALESCE($17, monthly_fee)
       WHERE id::text = $18 OR slug = $18
       RETURNING *`,
      [
        open_time,
        close_time,
        slot_duration_min ? Number(slot_duration_min) : null,
        price_day ? Number(price_day) : null,
        price_night ? Number(price_night) : null,
        light_start_time,
        deposit_amount ? Number(deposit_amount) : null,
        phone,
        city,
        mp_access_token,
        mp_public_key,
        custom_whatsapp_msg,
        ai_bot_enabled,
        status,
        payment_status,
        last_payment_date,
        monthly_fee ? Number(monthly_fee) : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Club no encontrado' });
    }

    res.json({ message: 'Configuración actualizada con éxito', club: result.rows[0] });
  } catch (e: any) {
    console.error('Error updating club:', e);
    res.status(500).json({ error: e.message || 'Error al actualizar configuración' });
  }
});

// POST /api/clubs - Create new club
router.post('/', async (req: Request, res: Response) => {
  const { name, clubName, ownerName, owner_name, ownerEmail, owner_email, password, phone, city, maxCourts, max_courts, plan } = req.body;
  const finalName = name || clubName;
  const finalOwnerEmail = ownerEmail || owner_email || '';
  const finalOwnerName = ownerName || owner_name || '';
  const finalMaxCourts = Number(maxCourts || max_courts || 4);

  if (!finalName) {
    return res.status(400).json({ error: 'Nombre del club es requerido' });
  }

  let baseSlug = finalName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'club';
  let slug = baseSlug;

  try {
    // Ensure unique slug
    let counter = 1;
    while (true) {
      const slugCheck = await pgPool.query('SELECT id FROM clubs WHERE slug = $1', [slug]);
      if (slugCheck.rows.length === 0) break;
      counter++;
      slug = `${baseSlug}-${counter}`;
    }

    let ownerId = null;

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
      `INSERT INTO clubs (name, slug, owner_id, owner_name, owner_email, phone, city, max_courts, plan, status, ai_bot_enabled, open_time, close_time, price_day, price_night, light_start_time, deposit_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', true, '14:00', '01:00', 14000, 18000, '18:30', 8000)
       RETURNING *`,
      [finalName, slug, ownerId, finalOwnerName, finalOwnerEmail, phone || '', city || '', finalMaxCourts, plan || 'Pro']
    );
    const newClub = clubRes.rows[0];

    if (ownerId) {
      await pgPool.query('UPDATE users SET club_id = $1 WHERE id = $2', [newClub.id, ownerId]);
    }

    await pgPool.query(
      `INSERT INTO courts (club_id, name, surface, indoor) VALUES
       ($1, 'Cancha 1 (Cristal)', 'Cristal Panorámico', true),
       ($1, 'Cancha 2 (Sintético)', 'Césped Sintético Pro', false)`,
      [newClub.id]
    );

    // Send welcome email with credentials asynchronously in background
    if (finalOwnerEmail) {
      sendOwnerCredentialsEmail({
        toEmail: finalOwnerEmail.trim(),
        ownerName: finalOwnerName || finalName,
        clubName: finalName,
        password: password || 'padel123',
        publicClubUrl: `https://sistema-turnos-gilt.vercel.app/clubs/${slug}`,
      }).catch((err) => {
        console.error('[EmailService] Error en background enviando credenciales:', err);
      });
    }

    res.status(201).json(newClub);
  } catch (e: any) {
    const errorDetails = e.detail ? `${e.message} - ${e.detail}` : (e.message || String(e));
    console.error('Error creating club:', errorDetails, e);
    res.status(500).json({ error: errorDetails });
  }
});

// GET /api/clubs/debug/schema
router.get('/debug/schema', async (_req: Request, res: Response) => {
  try {
    const clubsCols = await pgPool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clubs'"
    );
    const usersCols = await pgPool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'"
    );
    res.json({
      clubs: clubsCols.rows,
      users: usersCols.rows,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clubs/test-email - Test SMTP email delivery directly
router.post('/test-email', async (req: Request, res: Response) => {
  const { toEmail } = req.body;
  const target = toEmail || process.env.SMTP_USER || 'marudri58@gmail.com';

  const result = await sendOwnerCredentialsEmail({
    toEmail: target,
    ownerName: 'Admin de Prueba',
    clubName: 'Club de Prueba PadelHub',
    password: 'passwordTest123',
    publicClubUrl: 'https://sistema-turnos-gilt.vercel.app/clubs/latoska-er',
  });

  res.json({
    message: result.success ? 'Email de prueba enviado con éxito' : 'Error al enviar email de prueba',
    result,
  });
});

// DELETE /api/clubs/:id - Delete club and all associated records
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Delete reservations related to the club
    await pgPool.query('DELETE FROM reservations WHERE club_id::text = $1', [id]);

    // Delete courts related to the club
    await pgPool.query('DELETE FROM courts WHERE club_id::text = $1', [id]);

    // Unlink users associated with this club
    await pgPool.query('UPDATE users SET club_id = NULL WHERE club_id::text = $1', [id]);

    // Delete the club itself
    const deleteRes = await pgPool.query(
      'DELETE FROM clubs WHERE id::text = $1 OR slug = $1 RETURNING *',
      [id]
    );

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Club no encontrado' });
    }

    res.json({ message: 'Complejo eliminado con éxito', deletedClub: deleteRes.rows[0] });
  } catch (e: any) {
    console.error('Error deleting club:', e);
    res.status(500).json({ error: e.message || 'Error al eliminar complejo' });
  }
});

export default router;
