import { Router, Request, Response } from 'express';
import { pgPool } from '../db';

const router = Router();

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// GET /api/reservations - Get reservations for a club
router.get('/', async (req: Request, res: Response) => {
  const { clubId } = req.query;
  try {
    let query = 'SELECT * FROM reservations WHERE 1=1';
    const params: any[] = [];

    if (clubId) {
      params.push(clubId);
      query += ` AND club_id = $${params.length}`;
    }

    query += ' ORDER BY time_slot ASC';
    const result = await pgPool.query(query, params);
    res.json(result.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// POST /api/reservations - Create reservation (casual or weekly fixed)
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
    day_of_week,
    via_bot
  } = req.body;

  if (!club_id || !court_id || !time_slot) {
    return res.status(400).json({ error: 'club_id, court_id and time_slot are required' });
  }

  // Calculate day of week (0 = Dom, 1 = Lun, 2 = Mar, 3 = Mié, 4 = Jue, 5 = Vie, 6 = Sáb)
  let calculatedDayOfWeek: number | null = null;
  if (day_of_week !== undefined && day_of_week !== null) {
    calculatedDayOfWeek = Number(day_of_week);
  } else if (date_str && date_str.includes('-')) {
    const [y, m, d] = date_str.split('-').map(Number);
    calculatedDayOfWeek = new Date(y, m - 1, d).getDay();
  } else {
    calculatedDayOfWeek = new Date().getDay();
  }

  const finalBookingType = booking_type === 'fixed' ? 'fixed' : 'casual';
  const dayName = calculatedDayOfWeek !== null && DAYS[calculatedDayOfWeek] ? DAYS[calculatedDayOfWeek] : 'Día';
  const finalDate = finalBookingType === 'fixed' ? `Fijo (Todos los ${dayName})` : (date_str || 'Hoy');

  try {
    // Check if slot is already occupied:
    // 1. Same court, same time, not canceled
    // 2. Either exact date match (for casual) OR matching day_of_week (for fixed weekly)
    const checkExisting = await pgPool.query(
      `SELECT id, player_name, booking_type, day_of_week, date_str FROM reservations
       WHERE court_id = $1
         AND time_slot = $2
         AND status != 'canceled'
         AND (
           (date_str = $3)
           OR (booking_type = 'fixed' AND day_of_week = $4)
           OR ($5 = 'fixed' AND (day_of_week = $4 OR date_str = $3))
         )`,
      [court_id, time_slot, date_str || 'Hoy', calculatedDayOfWeek, finalBookingType]
    );

    if (checkExisting.rows.length > 0) {
      const existing = checkExisting.rows[0];
      const conflictMsg = existing.booking_type === 'fixed'
        ? `Este horario ya está reservado con turno fijo semanal para ${existing.player_name}`
        : `Este horario ya se encuentra reservado para ${existing.player_name} en esta fecha`;
      return res.status(409).json({ error: conflictMsg });
    }

    const status = is_blocked ? 'blocked' : 'deposit_paid';
    const result = await pgPool.query(
      `INSERT INTO reservations (club_id, court_id, player_name, player_phone, player_email, date_str, time_slot, status, price, deposit_paid, booking_type, day_of_week, via_bot)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
        calculatedDayOfWeek,
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
