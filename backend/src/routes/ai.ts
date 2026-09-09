import { Router, Request, Response } from 'express';
import { processCustomerMessage } from '../services/aiBot';
import twilio from 'twilio';

const router = Router();
const MessagingResponse = twilio.twiml.MessagingResponse;

// POST /api/ai/chat - Test endpoint for frontend or REST clients
router.post('/chat', async (req: Request, res: Response) => {
  const { message, phone, clubName } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const reply = await processCustomerMessage(message, phone);
    res.json({ reply, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process AI message' });
  }
});

// POST /api/ai/whatsapp - Twilio Webhook Receiver
router.post('/whatsapp', async (req: Request, res: Response) => {
  const incomingMsg = req.body.Body || req.body.body || '';
  const fromPhone = req.body.From || req.body.from || '';

  const twiml = new MessagingResponse();

  try {
    const aiResponse = await processCustomerMessage(incomingMsg, fromPhone);
    twiml.message(aiResponse);

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  } catch (error) {
    console.error('WhatsApp Webhook Error:', error);
    twiml.message('¡Hola! Podés ver la disponibilidad y reservar online en: https://padel-saas.vercel.app/reserve');
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
  }
});

export default router;
