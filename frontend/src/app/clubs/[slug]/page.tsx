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
  day_of_week?: number;
  status: string;
}

interface AvailableSlotGroup {
  id: string;
  timeSlot: string;
  startTime: string;
  isNight: boolean;
  price: number;
  deposit: number;
  availableCourts: Court[];
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
  const [selectedSlotGroup, setSelectedSlotGroup] = useState<AvailableSlotGroup | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string>("");
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

  // Generate available slot groups: a time slot is available if AT LEAST one court is free
  const currentDayOfWeek = dateObj.getDay();
  const availableSlotGroups: AvailableSlotGroup[] = [];

  TIME_SLOTS.forEach((ts, tIdx) => {
    const slotStartTime = ts.split(" - ")[0]; // e.g. "18:30"
    const isNight = slotStartTime >= lightStart;
    const slotPrice = isNight ? priceNight : priceDay;

    // Filter courts that are not occupied for this date & time slot
    const freeCourts = activeCourts.filter((court) => {
      const isOccupied = reservations.some((r) => {
        if (r.court_id !== court.id || r.time_slot !== ts || r.status === "canceled") {
          return false;
        }
        if (r.booking_type === "fixed") {
          return Number(r.day_of_week) === currentDayOfWeek;
        }
        return r.date_str === selectedDateIso;
      });
      return !isOccupied;
    });

    if (freeCourts.length > 0) {
      availableSlotGroups.push({
        id: `slot-group-${tIdx}`,
        timeSlot: ts,
        startTime: slotStartTime,
        price: slotPrice,
        deposit: depositAmount,
        isNight,
        availableCourts: freeCourts,
      });
    }
  });

  const handleSelectSlot = (group: AvailableSlotGroup) => {
    setSelectedSlotGroup(group);
    setSelectedCourtId(group.availableCourts[0]?.id || "");
    setCheckoutStep("form");
    setIsCheckoutOpen(true);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotGroup) return;

    const courtToBook =
      selectedSlotGroup.availableCourts.find((c) => c.id === selectedCourtId) ||
      selectedSlotGroup.availableCourts[0];
    if (!courtToBook) return;

    setCheckoutStep("mercadopago");

    try {
      const formattedPhone = playerForm.phone.startsWith("+54") ? playerForm.phone : `+54 9 ${playerForm.phone}`;
      const res = await fetch("https://padel-saas-backend-production.up.railway.app/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: club?.id,
          court_id: courtToBook.id,
          player_name: `${playerForm.firstName} ${playerForm.lastName}`.trim(),
          player_phone: formattedPhone,
          player_email: playerForm.email || "reserva@padel.app",
          date_str: selectedDateIso,
          time_slot: selectedSlotGroup.timeSlot,
          price: selectedSlotGroup.price,
          deposit: selectedSlotGroup.deposit,
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
          court_id: courtToBook.id,
          player_name: `${playerForm.firstName} ${playerForm.lastName}`.trim(),
          player_phone: formattedPhone,
          player_email: playerForm.email || "reserva@padel.app",
          date_str: selectedDateIso,
          time_slot: selectedSlotGroup.timeSlot,
          price: selectedSlotGroup.price,
          amount: selectedSlotGroup.deposit,
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
              {availableSlotGroups.length} {availableSlotGroups.length === 1 ? "horario libre" : "horarios libres"}
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

          {/* Dynamic Available Slot Groups */}
          <div className="space-y-2.5 pt-1">
            {availableSlotGroups.length > 0 ? (
              availableSlotGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleSelectSlot(group)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#0e141a] hover:bg-slate-800/60 border border-slate-800/60 hover:border-emerald-500/40 transition group text-left shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/80 group-hover:scale-125 transition" />
                    <div className="text-xs sm:text-sm font-semibold text-white flex items-center flex-wrap gap-1.5">
                      <span className="font-bold text-emerald-300">{group.startTime} hs</span>
                      <span className="text-slate-400 font-normal">| Turno disponible</span>
                      {activeCourts.length > 1 && (
                        <span className="text-[11px] text-emerald-400/90 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {group.availableCourts.length} {group.availableCourts.length === 1 ? "cancha libre" : "canchas libres"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950 transition">
                      Reservar (Seña ${group.deposit.toLocaleString()})
                    </span>
                  </div>
                </button>
              ))
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
              <span className="text-slate-200 font-medium">Pádel ({activeCourts.length} Pistas)</span>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Reservation Modal */}
      {isCheckoutOpen && selectedSlotGroup && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#131b22] border border-slate-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            {checkoutStep === "form" && (
              <>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-white text-base">Nueva reserva</h3>
                    <p className="text-xs text-slate-400">{clubDisplayName}</p>
                  </div>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleProcessPayment} className="space-y-4">
                  {/* Nombre y Apellido */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">Nombre</label>
                      <input
                        required
                        type="text"
                        placeholder="Nombre"
                        value={playerForm.firstName}
                        onChange={(e) => setPlayerForm({ ...playerForm, firstName: e.target.value })}
                        className="w-full bg-[#0e141a] border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300 font-medium">Apellido</label>
                      <input
                        required
                        type="text"
                        placeholder="Apellido"
                        value={playerForm.lastName}
                        onChange={(e) => setPlayerForm({ ...playerForm, lastName: e.target.value })}
                        className="w-full bg-[#0e141a] border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none"
                      />
                    </div>
                  </div>

                  {/* Teléfono / WhatsApp */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Teléfono (WhatsApp)</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#0e141a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 flex items-center justify-center font-medium">
                        AR +54
                      </div>
                      <input
                        required
                        type="tel"
                        placeholder="343 510 0200"
                        value={playerForm.phone}
                        onChange={(e) => setPlayerForm({ ...playerForm, phone: e.target.value })}
                        className="col-span-2 w-full bg-[#0e141a] border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Se debe eliminar el prefijo 0 en el código de área y el prefijo 15 en el teléfono. Ej: 358 510 0200
                    </p>
                  </div>

                  {/* Email (opcional / de contacto) */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Email (opcional)</label>
                    <input
                      type="email"
                      placeholder="usuario@ejemplo.com"
                      value={playerForm.email}
                      onChange={(e) => setPlayerForm({ ...playerForm, email: e.target.value })}
                      className="w-full bg-[#0e141a] border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 outline-none"
                    />
                  </div>

                  {/* Duración del turno */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Duración de turno</label>
                    <div className="w-full bg-[#0e141a] border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 font-medium flex items-center justify-between">
                      <span>90 Minutos</span>
                      <span className="text-slate-500 text-[11px]">Estándar</span>
                    </div>
                  </div>

                  {/* Selector de Cancha disponible */}
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300 font-medium">Cancha</label>
                    <select
                      value={selectedCourtId}
                      onChange={(e) => setSelectedCourtId(e.target.value)}
                      className="w-full bg-[#0e141a] border border-slate-800 focus:border-emerald-500/50 rounded-xl px-3 py-2.5 text-xs text-white outline-none cursor-pointer"
                    >
                      {selectedSlotGroup.availableCourts.map((court) => (
                        <option key={court.id} value={court.id} className="bg-[#131b22] text-white">
                          {court.name} {court.surface ? `(${court.surface})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Resumen del Turno */}
                  <div className="bg-[#0e141a] border border-slate-800/80 rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Inicia:</span>
                      <span className="font-semibold text-white capitalize">
                        {shortDateDisplay} {selectedSlotGroup.timeSlot.split(" - ")[0]} hs
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Termina:</span>
                      <span className="text-slate-300 font-medium">
                        {selectedSlotGroup.timeSlot.split(" - ")[1]} hs
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Precio Total:</span>
                      <span className="text-slate-200 font-bold">${selectedSlotGroup.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-800/80 pt-2">
                      <span className="text-slate-300 font-medium">Seña MercadoPago:</span>
                      <span className="font-extrabold text-emerald-400 text-sm">
                        ${selectedSlotGroup.deposit.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Reservar (Pagar Seña ${selectedSlotGroup.deposit.toLocaleString()})</span>
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
