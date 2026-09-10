import { Router, Request, Response } from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { pgPool } from '../db';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// POST /api/payments/create-preference - Generates MP checkout preference for booking deposit
router.post('/create-preference', async (req: Request, res: Response) => {
  const {
    club_id,
    court_id,
    player_name,
    player_phone,
    player_email,
    date_str,
    time_slot,
    price,
    amount,
  } = req.body;

  try {
    let accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
    let clubSlug = 'latoska-er';

    if (club_id) {
      const clubRes = await pgPool.query('SELECT slug, mp_access_token FROM clubs WHERE id::text = $1', [club_id]);
      if (clubRes.rows.length > 0) {
        clubSlug = clubRes.rows[0].slug || clubSlug;
        if (clubRes.rows[0].mp_access_token) {
          accessToken = clubRes.rows[0].mp_access_token.trim();
        }
      }
    }

    const depositAmount = Number(amount) || 8000;

    // If live access token is configured, create real MP Preference
    if (accessToken && accessToken.startsWith('APP_USR-') || accessToken.startsWith('TEST-')) {
      const mpClient = new MercadoPagoConfig({ accessToken });
      const preference = new Preference(mpClient);

      const result = await preference.create({
        body: {
          items: [
            {
              id: `${court_id || 'court'}-${time_slot || 'slot'}`,
              title: `Seña Turno Pádel (${time_slot || '90 min'}) - ${player_name || 'Jugador'}`,
              quantity: 1,
              unit_price: depositAmount,
              currency_id: 'ARS',
            },
          ],
          payer: {
            email: player_email || 'jugador@gmail.com',
            name: player_name || 'Jugador',
          },
          back_urls: {
            success: `https://sistema-turnos-gilt.vercel.app/clubs/${clubSlug}?status=approved`,
            failure: `https://sistema-turnos-gilt.vercel.app/clubs/${clubSlug}?status=failure`,
            pending: `https://sistema-turnos-gilt.vercel.app/clubs/${clubSlug}?status=pending`,
          },
          auto_return: 'approved',
          metadata: {
            club_id,
            court_id,
            player_name,
            player_phone,
            player_email,
            date_str,
            time_slot,
            price: Number(price) || 14000,
            deposit: depositAmount,
          },
        },
      });

      return res.json({
        id: result.id,
        init_point: result.init_point || result.sandbox_init_point,
      });
    }

    // Fallback: Simulation for development
    res.json({
      id: `sim-pref-${Date.now()}`,
      init_point: `https://sistema-turnos-gilt.vercel.app/clubs/${clubSlug}?status=approved&simulated=true`,
    });
  } catch (error: any) {
    console.error('MercadoPago Preference Error:', error);
    res.json({
      id: `fallback-pref-${Date.now()}`,
      init_point: `https://sistema-turnos-gilt.vercel.app/clubs/latoska-er?status=approved&simulated=true`,
    });
  }
});

// POST /api/payments/webhook - MercadoPago IPN Notification Receiver
router.post('/webhook', async (req: Request, res: Response) => {
  const { type, data } = req.body;
  console.log('MercadoPago Webhook Received:', type, data);
  res.status(200).send('OK');
});

export default router;
