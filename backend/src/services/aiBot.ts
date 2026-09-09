import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-dev',
});

export interface BotContext {
  clubName: string;
  location: string;
  pricePerSlot: number;
  depositAmount: number;
  availableCourts: string[];
  publicUrl: string;
}

const DEFAULT_CONTEXT: BotContext = {
  clubName: 'La Toska Pádel',
  location: 'Av. Ramírez 2450, Paraná, Entre Ríos',
  pricePerSlot: 16000,
  depositAmount: 8000,
  availableCourts: ['Cancha 1 (Cristal Panorámico - Techada)', 'Cancha 2 (WPT - Techada)', 'Cancha 3 (Outdoor)'],
  publicUrl: 'https://padel-saas.vercel.app/reserve',
};

export async function processCustomerMessage(
  userMessage: string,
  customerPhone?: string,
  context: BotContext = DEFAULT_CONTEXT
): Promise<string> {
  const systemPrompt = `Sos el asistente virtual inteligente de "${context.clubName}", un club de pádel ubicado en ${context.location}.
Tu objetivo es atender a los jugadores por WhatsApp de forma cálida, ágil y profesional.

Información del club:
- Pistas disponibles: ${context.availableCourts.join(', ')}.
- Turnos: Franjas de 90 minutos de 14:00 a 00:30 hs.
- Precio por turno: $${context.pricePerSlot.toLocaleString('es-AR')}.
- Seña para confirmar la reserva: $${context.depositAmount.toLocaleString('es-AR')} abonada online vía MercadoPago.
- Servicios: Estacionamiento privado, Bar & Quincho, Vestuarios, Wi-Fi.
- Link directo para ver turnos libres y reservar online: ${context.publicUrl}

Reglas:
1. Sé conciso y claro.
2. Si preguntan por horarios o disponibilidad, enviales el link de reserva: ${context.publicUrl}.
3. Si preguntan por precios, informá el total y la seña necesaria.`;

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'TU_API_KEY' || process.env.OPENAI_API_KEY === 'dummy-key-for-dev') {
    const lower = userMessage.toLowerCase();
    if (lower.includes('precio') || lower.includes('cuanto') || lower.includes('costo') || lower.includes('vale')) {
      return `¡Hola! 🎾 El turno de 90 min cuesta $${context.pricePerSlot.toLocaleString('es-AR')}. La seña es de $${context.depositAmount.toLocaleString('es-AR')} por MercadoPago. Podés reservar acá: ${context.publicUrl}`;
    }
    if (lower.includes('horario') || lower.includes('turno') || lower.includes('disponible') || lower.includes('hoy') || lower.includes('mañana')) {
      return `¡Hola! 🎾 Podés consultar turnos disponibles en tiempo real y reservar al instante desde nuestra web: ${context.publicUrl}`;
    }
    if (lower.includes('donde') || lower.includes('ubicacion') || lower.includes('direccion')) {
      return `¡Hola! Estamos en ${context.location}. ¡Te esperamos!`;
    }
    return `¡Hola! Gracias por comunicarte con ${context.clubName} 🎾. Podés ver canchas libres y reservar tu turno directamente en: ${context.publicUrl}`;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });
    return response.choices[0]?.message?.content || `Podés ver la disponibilidad y reservar en: ${context.publicUrl}`;
  } catch (error) {
    console.error('OpenAI Error:', error);
    return `¡Hola! Podés ver la disponibilidad y reservar directamente en nuestra web: ${context.publicUrl}`;
  }
}
