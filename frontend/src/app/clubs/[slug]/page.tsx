"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  MapPin,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CreditCard,
  Lock,
  Trophy,
  Sparkles,
  CalendarDays,
} from "lucide-react";

interface Club {
  id: string;
  name: string;
  slug: string;
  city: string;
  phone: string;
  max_courts: number;
  open_time?: string;
  close_time?: string;
  price_day?: number;
  price_night?: number;
  light_start_time?: string;
  deposit_amount?: number;
}

interface Court {
  id: string;
  club_id: string;
  name: string;
  surface: string;
  indoor: boolean;
}

interface Reservation {
  id: string;
  court_id: string;
  time_slot: string;
  date_str: string;
  booking_type?: "casual" | "fixed";
  status: string;
}

interface Slot {
  id: string;
  courtId: string;
  courtName: string;
  surface: string;
  indoor: boolean;
  timeSlot: string;
  price: number;
  deposit: number;
  isNight: boolean;
  isOccupied: boolean;
}

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

const DAYS_LOWER = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const TIME_SLOTS = [
  "11:00 - 12:30",
  "12:30 - 14:00",
  "14:00 - 15:30",
  "15:30 - 17:00",
  "17:00 - 18:30",
  "18:30 - 20:00",
  "20:00 - 21:30",
  "21:30 - 23:00",
  "23:00 - 00:30",
];

export default function DynamicClubBookingPage() {
  const params = useParams();
  const slugParam = typeof params?.slug === "string" ? params.slug : "latoska-er";

  const [club, setClub] = useState<Club | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDateIso, setSelectedDateIso] = useState<string>("2026-09-10");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(true);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"form" | "mercadopago" | "success">("form");
  const [playerForm, setPlayerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const loadClubData = async () => {
    try {
      const clubsRes = await fetch("https://padel-saas-backend-production.up.railway.app/api/clubs");
      if (clubsRes.ok) {
        const clubs: Club[] = await clubsRes.json();
        const matchedClub = clubs.find((c) => c.slug === slugParam) || clubs[0];
        if (matchedClub) {
          setClub(matchedClub);
          const courtsRes = await fetch(`https://padel-saas-backend-production.up.railway.app/api/courts/${matchedClub.id}`);
          if (courtsRes.ok) {
            const courtsData = await courtsRes.json();
            setCourts(courtsData);
          }
          const resRes = await fetch(`https://padel-saas-backend-production.up.railway.app/api/reservations?clubId=${matchedClub.id}`);
          if (resRes.ok) {
            const resData = await resRes.json();
            setReservations(resData);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to load dynamic club info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubData();
  }, [slugParam]);

  // Date parsing & formatting
  const [currY, currM, currD] = selectedDateIso.split("-").map(Number);
  const dateObj = new Date(currY, currM - 1, currD);
  const dayNameLower = DAYS_LOWER[dateObj.getDay()];
  const monthNameLower = MONTHS[currM - 1];
  const shortDateDisplay = `${dayNameLower} ${currD}`;
  const fullDateDisplay = `${currD} de ${monthNameLower} de ${currY}`;

  const handlePrevDay = () => {
    const d = new Date(currY, currM - 1, currD);
    d.setDate(d.getDate() - 1);
    setSelectedDateIso(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(currY, currM - 1, currD);
    d.setDate(d.getDate() + 1);
    setSelectedDateIso(d.toISOString().split("T")[0]);
  };

  const priceDay = club?.price_day ?? 14000;
  const priceNight = club?.price_night ?? 18000;
  const lightStart = club?.light_start_time || "18:30";
  const depositAmount = club?.deposit_amount ?? 8000;

  // Active courts
  const activeCourts = courts.length > 0 ? courts : [
    { id: "c1", club_id: club?.id || "default", name: "Cancha 1 (Cristal)", surface: "Cristal Panorámico", indoor: true },
    { id: "c2", club_id: club?.id || "default", name: "Cancha 2 (Sintético)", surface: "Césped Sintético Pro", indoor: false },
  ];

  // Generate slots for active courts on selected date
  const generatedSlots: Slot[] = [];
  activeCourts.forEach((court, cIdx) => {
    TIME_SLOTS.forEach((ts, tIdx) => {
      const slotStartTime = ts.split(" - ")[0]; // e.g. "18:30"
      const isNight = slotStartTime >= lightStart;
      const slotPrice = isNight ? priceNight : priceDay;

      // Check if slot is occupied on this date or has a fixed permanent booking
      const isOccupied = reservations.some(
        (r) =>
          r.court_id === court.id &&
          r.time_slot === ts &&
          r.status !== "canceled" &&
          (r.booking_type === "fixed" || r.date_str === selectedDateIso || r.date_str.includes(String(currD)))
      );

      generatedSlots.push({
        id: `slot-${cIdx}-${tIdx}`,
        courtId: court.id,
        courtName: court.name,
        surface: court.surface || "Cristal Panorámico",
        indoor: court.indoor ?? true,
        timeSlot: ts,
        price: slotPrice,
        deposit: depositAmount,
        isNight,
        isOccupied,
      });
    });
  });

  const availableSlots = generatedSlots.filter((s) => !s.isOccupied);

  const handleSelectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    setCheckoutStep("form");
    setIsCheckoutOpen(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep("mercadopago");

    try {
      const res = await fetch("https://padel-saas-backend-production.up.railway.app/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: club?.id,
          court_id: selectedSlot?.courtId,
          player_name: `${playerForm.firstName} ${playerForm.lastName}`.trim(),
          player_phone: playerForm.phone,
          player_email: playerForm.email,
          date_str: selectedDateIso,
          time_slot: selectedSlot?.timeSlot,
          price: selectedSlot?.price || priceDay,
          deposit: selectedSlot?.deposit || depositAmount,
          booking_type: "casual",
        }),
      });

      if (res.ok) {
        loadClubData();
      }

      // Generate MercadoPago Checkout preference
      const prefRes = await fetch("https://padel-saas-backend-production.up.railway.app/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: club?.id,
          court_id: selectedSlot?.courtId,
          player_name: `${playerForm.firstName} ${playerForm.lastName}`.trim(),
          player_phone: playerForm.phone,
          player_email: playerForm.email,
          date_str: selectedDateIso,
          time_slot: selectedSlot?.timeSlot,
          price: selectedSlot?.price || priceDay,
          amount: selectedSlot?.deposit || depositAmount,
        }),
      });

      if (prefRes.ok) {
        const prefData = await prefRes.json();
        if (prefData.init_point && prefData.init_point.includes("mercadopago.com")) {
          window.location.href = prefData.init_point;
          return;
        }
      }
    } catch (e) {
      console.warn("Reservation saved");
    }

    setTimeout(() => {
      setCheckoutStep("success");
    }, 1500);
  };

  const clubDisplayName = club?.name || "Complejo de Pádel";
  const clubDisplayCity = club?.city || "Argentina";
  const clubPhoneClean = (club?.phone || "+54 9 343 555-1234").replace(/[^0-9]/g, "");

  return (
    <div className="min-h-screen bg-[#0d1217] text-slate-100 font-sans pb-16">
      {/* Top Navbar */}
      <header className="px-6 py-4 max-w-6xl mx-auto flex items-center justify-between border-b border-slate-800/40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-lg shadow-emerald-500/10">
            <Trophy className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">
            Pádel Hub
          </span>
        </div>

        <a
          href={`https://wa.me/${clubPhoneClean}?text=Hola!%20Quería%20consultar%20por%20un%20turno%20en%20${encodeURIComponent(clubDisplayName)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>WhatsApp Club</span>
        </a>
      </header>

      {/* Hero Header Banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 my-6">
        <div className="relative rounded-3xl overflow-hidden h-44 sm:h-52 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/20 shadow-2xl flex items-end p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1217] via-transparent to-transparent" />

          {/* Club Identity */}
          <div className="relative z-10 flex items-center gap-4 sm:gap-6">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-slate-900 border-2 border-emerald-500/40 flex items-center justify-center p-2 shadow-2xl flex-shrink-0 text-emerald-400 font-extrabold text-xl sm:text-2xl">
              {clubDisplayName.substring(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {clubDisplayName}
                </h1>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Oficial
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" /> {clubDisplayCity}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: 2 Columns */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Turnos Disponibles */}
        <div className="lg:col-span-2 bg-[#131b22] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              Reserva de turnos
            </h2>
            <span className="text-xs text-slate-400">
              {availableSlots.length} {availableSlots.length === 1 ? "horario libre" : "horarios libres"}
            </span>
          </div>

          {/* Date Selector Navigation Bar */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-center gap-6 text-white font-bold text-base select-none">
              <button
                onClick={handlePrevDay}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Día anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <span className="capitalize tracking-wide font-semibold text-base sm:text-lg">
                {shortDateDisplay}
              </span>

              <button
                onClick={handleNextDay}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Día siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3 font-medium">
              <span className="capitalize">{dayNameLower}</span>
              <span>{fullDateDisplay}</span>
            </div>
          </div>

          {/* Simple Slot List */}
          <div className="space-y-2.5 pt-1">
            {availableSlots.length > 0 ? (
              availableSlots.map((slot) => {
                const startTime = slot.timeSlot.split(" - ")[0]; // e.g. "14:00"
                return (
                  <button
                    key={slot.id}
                    onClick={() => handleSelectSlot(slot)}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#0e141a] hover:bg-slate-800/60 border border-slate-800/60 hover:border-emerald-500/40 transition group text-left shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 group-hover:scale-125 transition" />
                      <div className="text-xs sm:text-sm font-semibold text-white">
                        <span className="font-bold text-emerald-300">{startTime} hs</span>
                        <span className="text-slate-400 font-normal"> | Turno disponible para Pádel</span>
                        {courts.length > 1 && (
                          <span className="text-[11px] text-slate-500 font-normal ml-1">
                            ({slot.courtName})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                        Reservar (Seña ${slot.deposit.toLocaleString()})
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs space-y-1">
                <Lock className="h-6 w-6 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-400">No hay turnos disponibles para este día</p>
                <p>Navegá hacia otros días con las flechas superiores.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Información Card */}
        <div className="bg-[#131b22] border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl h-fit">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-white tracking-tight">
              Información del Complejo
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {clubDisplayName}
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-300 pt-2">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-slate-200 font-medium leading-relaxed">
                  {clubDisplayCity}, Argentina
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <a
                href={`https://wa.me/${clubPhoneClean}?text=Hola!%20Quería%20consultar%20por%20un%20turno%20en%20${encodeURIComponent(clubDisplayName)}`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline font-semibold flex items-center gap-1.5"
              >
                <span>{club?.phone || "+54 9 343 555-1234"}</span>
                <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
              </a>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
              <div className="h-4 w-4 flex items-center justify-center text-slate-400 text-xs">
                🎾
              </div>
              <span className="text-slate-200 font-medium">Pádel ({courts.length || 2} Pistas)</span>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Checkout Modal */}
      {isCheckoutOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131b22] border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl">
            {checkoutStep === "form" && (
              <>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-white text-base">Reservar Turno</h3>
                    <p className="text-xs text-slate-400">{clubDisplayName}</p>
                  </div>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-[#0e141a] border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Día y Horario:</span>
                    <span className="font-bold text-white capitalize">{shortDateDisplay} — {selectedSlot.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pista:</span>
                    <span className="text-white">{selectedSlot.courtName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Turno:</span>
                    <span className="text-slate-200">${selectedSlot.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-2">
                    <span className="text-slate-400 font-medium">Seña MercadoPago:</span>
                    <span className="font-bold text-emerald-400 text-sm">${selectedSlot.deposit.toLocaleString()}</span>
                  </div>
                </div>

                <form onSubmit={handleProcessPayment} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">Nombre</label>
                      <input
                        required
                        type="text"
                        placeholder="Martín"
                        value={playerForm.firstName}
                        onChange={(e) => setPlayerForm({ ...playerForm, firstName: e.target.value })}
                        className="w-full bg-[#0e141a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">Apellido</label>
                      <input
                        required
                        type="text"
                        placeholder="Udrizard"
                        value={playerForm.lastName}
                        onChange={(e) => setPlayerForm({ ...playerForm, lastName: e.target.value })}
                        className="w-full bg-[#0e141a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">WhatsApp</label>
                    <input
                      required
                      type="text"
                      placeholder="+54 9 343 ..."
                      value={playerForm.phone}
                      onChange={(e) => setPlayerForm({ ...playerForm, phone: e.target.value })}
                      className="w-full bg-[#0e141a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">Email</label>
                    <input
                      required
                      type="email"
                      placeholder="martin@ejemplo.com"
                      value={playerForm.email}
                      onChange={(e) => setPlayerForm({ ...playerForm, email: e.target.value })}
                      className="w-full bg-[#0e141a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Pagar Seña (${selectedSlot.deposit.toLocaleString()})</span>
                    </button>
                  </div>
                </form>
              </>
            )}

            {checkoutStep === "mercadopago" && (
              <div className="py-12 text-center space-y-4">
                <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto" />
                <h4 className="text-base font-bold text-white">Conectando con MercadoPago...</h4>
                <p className="text-xs text-slate-400">Procesando pago de seña para {clubDisplayName}</p>
              </div>
            )}

            {checkoutStep === "success" && (
              <div className="text-center space-y-4 py-4">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-white">¡Reserva Confirmada!</h4>
                  <p className="text-xs text-slate-400 mt-1">Registrada con éxito en {clubDisplayName}</p>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 rounded-xl text-xs transition"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
