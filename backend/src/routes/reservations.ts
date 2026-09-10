import { Router, Request, Response } from 'express';
import { pgPool } from '../db';

const router = Router();

// GET /api/reservations - Get reservations for a club and date (including fixed recurring slots)
router.get('/', async (req: Request, res: Response) => {
  const { clubId, date } = req.query;
  try {
    let query = 'SELECT * FROM reservations WHERE 1=1';
    const params: any[] = [];

    if (clubId) {
      params.push(clubId);
      query += ` AND club_id = $${params.length}`;
    }
    if (date) {
      params.push(date);
      query += ` AND (date_str = $${params.length} OR booking_type = 'fixed')`;
    }

    query += ' ORDER BY time_slot ASC';
    const result = await pgPool.query(query, params);
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// POST /api/reservations - Create reservation (casual or fixed)
router.post('/', async (req: Request, res: Response) => {
  const {
    club_id,
    court_id,
    player_name,
    player_phone,
    player_email,
    date_str,
    time_slot,
    price,
    deposit,
    is_blocked,
    booking_type,
    via_bot
  } = req.body;

  if (!club_id || !court_id || !time_slot) {
    return res.status(400).json({ error: 'club_id, court_id and time_slot are required' });
  }

  const finalBookingType = booking_type === 'fixed' ? 'fixed' : 'casual';
  const finalDate = finalBookingType === 'fixed' ? 'Todos los días (Fijo)' : (date_str || 'Hoy');

  try {
    // Check if slot is already occupied (either by exact date or by a permanent fixed booking)
    const checkExisting = await pgPool.query(
      `SELECT id FROM reservations
       WHERE court_id = $1
         AND time_slot = $2
         AND status != 'canceled'
         AND (date_str = $3 OR booking_type = 'fixed' OR $4 = 'fixed')`,
      [court_id, time_slot, date_str || 'Hoy', finalBookingType]
    );

    if (checkExisting.rows.length > 0) {
      return res.status(409).json({ error: 'Este horario ya se encuentra reservado u ocupado por un turno fijo' });
    }

    const status = is_blocked ? 'blocked' : 'deposit_paid';
    const result = await pgPool.query(
      `INSERT INTO reservations (club_id, court_id, player_name, player_phone, player_email, date_str, time_slot, status, price, deposit_paid, booking_type, via_bot)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        club_id,
        court_id,
        player_name || 'Reserva Manual',
        player_phone || '',
        player_email || '',
        finalDate,
        time_slot,
        status,
        price !== undefined && price !== null ? Number(price) : 14000,
        deposit !== undefined && deposit !== null ? Number(deposit) : (is_blocked ? 0 : 0),
        finalBookingType,
        via_bot || false,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (e: any) {
    console.error('Error creating reservation:', e);
    res.status(500).json({ error: e.message || 'Failed to create reservation' });
  }
});

// DELETE /api/reservations/:id - Cancel reservation
router.delete('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await pgPool.query('DELETE FROM reservations WHERE id = $1', [id]);
    res.json({ success: true, message: 'Reserva eliminada con éxito' });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
});

export default router;
