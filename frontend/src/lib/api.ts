const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://padel-saas-backend-production-a91f.up.railway.app';

export interface CreateClubDTO {
  name: string;
  slug?: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  city: string;
  maxCourts: number;
  plan: string;
  aiBotEnabled: boolean;
}

export interface CreateBookingDTO {
  clubId: string;
  courtId: string;
  playerName: string;
  playerPhone: string;
  playerEmail?: string;
  dateStr: string;
  timeSlot: string;
  price: number;
  depositPaid: number;
}

export const api = {
  // CLUBS
  async getClubs() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/clubs`);
      if (!res.ok) throw new Error('Failed to fetch clubs');
      return await res.json();
    } catch (e) {
      console.warn('API getClubs fallback to local:', e);
      return null;
    }
  },

  async createClub(data: CreateClubDTO) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/clubs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create club');
      return await res.json();
    } catch (e) {
      console.warn('API createClub fallback:', e);
      return null;
    }
  },

  // COURTS
  async getCourts(clubId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courts/${clubId}`);
      if (!res.ok) throw new Error('Failed to fetch courts');
      return await res.json();
    } catch (e) {
      console.warn('API getCourts fallback:', e);
      return null;
    }
  },

  async createCourt(clubId: string, name: string, surface: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ club_id: clubId, name, surface }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al crear cancha');
      }
      return await res.json();
    } catch (e: any) {
      console.warn('API createCourt error:', e.message);
      throw e;
    }
  },

  // RESERVATIONS & AVAILABILITY
  async getAvailability(clubId: string, date: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservations/availability?clubId=${clubId}&date=${date}`);
      if (!res.ok) throw new Error('Failed to fetch availability');
      return await res.json();
    } catch (e) {
      console.warn('API getAvailability fallback:', e);
      return null;
    }
  },

  async createReservation(data: CreateBookingDTO) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          club_id: data.clubId,
          court_id: data.courtId,
          player_name: data.playerName,
          player_phone: data.playerPhone,
          player_email: data.playerEmail,
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          price: data.price,
          deposit: data.depositPaid,
        }),
      });
      if (!res.ok) throw new Error('Failed to create reservation');
      return await res.json();
    } catch (e) {
      console.warn('API createReservation fallback:', e);
      return null;
    }
  },

  // MERCADOPAGO PREFERENCE
  async createMercadoPagoPreference(reservationId: string, amount: number, payerEmail: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/create-preference`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId,
          title: 'Seña Turno Pádel (90 min)',
          amount,
          payerEmail,
        }),
      });
      if (!res.ok) throw new Error('Failed to create MP preference');
      return await res.json();
    } catch (e) {
      console.warn('API MP preference fallback:', e);
      return {
        id: 'mock-pref',
        init_point: 'https://www.mercadopago.com.ar',
      };
    }
  },

  // AI CHAT BOT
  async askAi(message: string, phone?: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, phone }),
      });
      if (!res.ok) throw new Error('Failed to ask AI');
      return await res.json();
    } catch (e) {
      console.warn('API askAi fallback:', e);
      return { reply: '¡Hola! Podés consultar turnos y reservar en nuestra web.' };
    }
  },
};
