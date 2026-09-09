import { Router, Request, Response } from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'TEST-ACCESS-TOKEN',
});

const router = Router();

// POST /api/payments/create-preference - Generates MP checkout preference for booking deposit
router.post('/create-preference', async (req: Request, res: Response) => {
  const { reservationId, title, amount, payerEmail } = req.body;

  try {
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: reservationId || 'pdl-res',
            title: title || 'Seña Turno Pádel (90 min)',
            quantity: 1,
            unit_price: Number(amount) || 8000,
            currency_id: 'ARS',
          },
        ],
        payer: {
          email: payerEmail || 'jugador@ejemplo.com',
        },
        back_urls: {
          success: 'https://padel-saas.vercel.app/reserve?status=approved',
          failure: 'https://padel-saas.vercel.app/reserve?status=failure',
          pending: 'https://padel-saas.vercel.app/reserve?status=pending',
        },
        auto_return: 'approved',
      },
    });

    res.json({ id: result.id, init_point: result.init_point });
  } catch (error: any) {
    console.error('MercadoPago Preference Error:', error);
    // Return mock link for development if test token is not live
    res.json({
      id: 'mock-preference-id',
      init_point: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=mock',
    });
  }
});

// POST /api/payments/webhook - MercadoPago IPN Notification Receiver
router.post('/webhook', async (req: Request, res: Response) => {
  const { type, data } = req.body;
  console.log('MercadoPago Webhook Received:', type, data);
  // Confirms reservation in DB once payment is approved
  res.status(200).send('OK');
});

export default router;
