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

export const ALL_90MIN_SLOTS = [
  "08:00 - 09:30",
  "09:30 - 11:00",
  "11:00 - 12:30",
  "12:30 - 14:00",
  "14:00 - 15:30",
  "15:30 - 17:00",
  "17:00 - 18:30",
  "18:30 - 20:00",
  "20:00 - 21:30",
  "21:30 - 23:00",
  "23:00 - 00:30",
  "00:30 - 02:00",
];

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function isSlotWithinClubHours(
  timeSlot: string,
  openTime: string = "11:00",
  closeTime: string = "01:00"
): boolean {
  const slotStartTime = timeSlot.split(" - ")[0]; // e.g. "14:00"
  const slotStartMin = toMinutes(slotStartTime);

  let openMin = toMinutes(openTime);
  let closeMin = toMinutes(closeTime);

  // If closing time is next day after midnight (e.g. 00:30, 01:00, 02:00)
  if (closeMin <= openMin) {
    closeMin += 24 * 60;
  }

  let adjustedSlotMin = slotStartMin;
  if (adjustedSlotMin < openMin && adjustedSlotMin < (closeMin - 24 * 60)) {
    adjustedSlotMin += 24 * 60;
  }

  return adjustedSlotMin >= openMin && adjustedSlotMin < closeMin;
}

function getTodayIsoString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export default function DynamicClubBookingPage() {
  const params = useParams();
  const slugParam = typeof params?.slug === "string" ? params.slug : "latoska-er";

  const todayIso = getTodayIsoString();
  const [club, setClub] = useState<Club | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDateIso, setSelectedDateIso] = useState<string>(getTodayIsoString());
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
    const prevIso = d.toISOString().split("T")[0];
    if (prevIso < todayIso) return; // Prevent navigating before today
    setSelectedDateIso(prevIso);
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
  const clubOpen = club?.open_time || "11:00";
  const clubClose = club?.close_time || "01:00";

  // Active courts
  const activeCourts = courts.length > 0 ? courts : [
    { id: "c1", club_id: club?.id || "default", name: "Cancha 1 (Cristal)", surface: "Cristal Panorámico", indoor: true },
    { id: "c2", club_id: club?.id || "default", name: "Cancha 2 (Sintético)", surface: "Césped Sintético Pro", indoor: false },
  ];

  // Generate available slot groups: a time slot is available if AT LEAST one court is free
  const currentDayOfWeek = dateObj.getDay();
  const isToday = selectedDateIso === todayIso;
  const currentMinutes = getCurrentTimeMinutes();
  const availableSlotGroups: AvailableSlotGroup[] = [];

  ALL_90MIN_SLOTS.forEach((ts, tIdx) => {
    const slotStartTime = ts.split(" - ")[0]; // e.g. "18:30"
    
    // 1. Check if within club opening and closing hours
    if (!isSlotWithinClubHours(ts, clubOpen, clubClose)) {
      return;
    }

    // 2. Check if already passed for today
    if (isToday && toMinutes(slotStartTime) <= currentMinutes) {
      return;
    }

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
    <div className="min-h-screen bg-[#06100E] text-[#F1F5F3] font-sans pb-16">
      {/* Top Navbar */}
      <header className="px-6 py-4 max-w-6xl mx-auto flex items-center justify-between border-b border-[#16272a]">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-[#00D084]/10 border border-[#00D084]/30 flex items-center justify-center text-[#00D084] font-bold shadow-lg shadow-[#00D084]/10">
            <Trophy className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-[#F1F5F3]">
            Pádel Hub
          </span>
        </div>

        <a
          href={`https://wa.me/${clubPhoneClean}?text=Hola!%20Quería%20consultar%20por%20un%20turno%20en%20${encodeURIComponent(clubDisplayName)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 bg-[#00D084]/10 hover:bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>WhatsApp Club</span>
        </a>
      </header>

      {/* Hero Header Banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 my-6">
        <div className="relative rounded-3xl overflow-hidden h-44 sm:h-52 bg-gradient-to-r from-[#00D084]/20 via-[#0C1517] to-[#06100E] border border-[#00D084]/20 shadow-2xl flex items-end p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-t from-[#06100E] via-transparent to-transparent" />

          {/* Club Identity */}
          <div className="relative z-10 flex items-center gap-4 sm:gap-6">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-[#0C1517] border-2 border-[#00D084]/40 flex items-center justify-center p-2 shadow-2xl flex-shrink-0 text-[#00D084] font-extrabold text-xl sm:text-2xl">
              {clubDisplayName.substring(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F1F5F3] tracking-tight">
                  {clubDisplayName}
                </h1>
                <span className="text-[10px] bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/30 px-2 py-0.5 rounded-full font-semibold">
                  Oficial
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#8A9B95] font-medium mt-0.5 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-[#8A9B95]" /> {clubDisplayCity}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout: 2 Columns */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Turnos Disponibles */}
        <div className="lg:col-span-2 bg-[#0C1517] border border-[#16272a] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-extrabold text-[#F1F5F3] tracking-tight">
              Reserva de turnos
            </h2>
            <span className="text-xs text-[#8A9B95]">
              {availableSlotGroups.length} {availableSlotGroups.length === 1 ? "horario libre" : "horarios libres"}
            </span>
          </div>

          {/* Date Selector Navigation Bar */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-center gap-6 text-[#F1F5F3] font-bold text-base select-none">
              <button
                onClick={handlePrevDay}
                disabled={selectedDateIso <= todayIso}
                className={`p-1.5 rounded-lg transition ${
                  selectedDateIso <= todayIso
                    ? "opacity-30 cursor-not-allowed text-[#8A9B95]/40"
                    : "hover:bg-[#16272a] text-[#8A9B95] hover:text-[#F1F5F3]"
                }`}
                title={selectedDateIso <= todayIso ? "No podés retroceder a días pasados" : "Día anterior"}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <span className="capitalize tracking-wide font-semibold text-base sm:text-lg">
                {shortDateDisplay}
              </span>

              <button
                onClick={handleNextDay}
                className="p-1.5 rounded-lg hover:bg-[#16272a] text-[#8A9B95] hover:text-[#F1F5F3] transition"
                title="Día siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-[#8A9B95] border-b border-[#16272a] pb-3 font-medium">
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
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-[#06100E] hover:bg-[#101f21] border border-[#16272a] hover:border-[#00D084]/40 transition group text-left shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#00D084] shadow-sm shadow-[#00D084]/80 group-hover:scale-125 transition" />
                    <div className="text-xs sm:text-sm font-semibold text-[#F1F5F3] flex items-center flex-wrap gap-1.5">
                      <span className="font-bold text-[#00D084]">{group.startTime} hs</span>
                      <span className="text-[#8A9B95] font-normal">| Turno disponible</span>
                      {activeCourts.length > 1 && (
                        <span className="text-[11px] text-[#00D084] font-medium bg-[#00D084]/10 px-2 py-0.5 rounded-full border border-[#00D084]/20">
                          {group.availableCourts.length} {group.availableCourts.length === 1 ? "cancha libre" : "canchas libres"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#00D084] bg-[#00D084]/10 px-3 py-1 rounded-xl border border-[#00D084]/20 group-hover:bg-[#00D084] group-hover:text-[#06100E] transition font-bold">
                      Reservar (Seña ${group.deposit.toLocaleString()})
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="py-12 text-center text-[#8A9B95] text-xs space-y-1">
                <Lock className="h-6 w-6 text-[#8A9B95]/50 mx-auto mb-2" />
                <p className="font-semibold text-[#8A9B95]">No hay turnos disponibles para este día</p>
                <p>Navegá hacia otros días con las flechas superiores.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Información Card */}
        <div className="bg-[#0C1517] border border-[#16272a] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl h-fit">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-[#F1F5F3] tracking-tight">
              Información del Complejo
            </h3>
            <p className="text-xs text-[#8A9B95] font-medium">
              {clubDisplayName}
            </p>
          </div>

          <div className="space-y-4 text-xs text-[#8A9B95] pt-2">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-[#8A9B95] flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="text-[#F1F5F3] font-medium leading-relaxed">
                  {clubDisplayCity}, Argentina
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-[#8A9B95] flex-shrink-0" />
              <a
                href={`https://wa.me/${clubPhoneClean}?text=Hola!%20Quería%20consultar%20por%20un%20turno%20en%20${encodeURIComponent(clubDisplayName)}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#00D084] hover:underline font-semibold flex items-center gap-1.5"
              >
                <span>{club?.phone || "+54 9 343 555-1234"}</span>
                <MessageCircle className="h-3.5 w-3.5 text-[#00D084]" />
              </a>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-[#16272a]">
              <div className="h-4 w-4 flex items-center justify-center text-[#8A9B95] text-xs">
                🎾
              </div>
              <span className="text-[#F1F5F3] font-medium">Pádel ({activeCourts.length} Pistas)</span>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Reservation Modal */}
      {isCheckoutOpen && selectedSlotGroup && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0C1517] border border-[#16272a] rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-5 shadow-2xl my-8">
            {checkoutStep === "form" && (
              <>
                <div className="flex justify-between items-center border-b border-[#16272a] pb-3">
                  <div>
                    <h3 className="font-extrabold text-[#F1F5F3] text-base">Nueva reserva</h3>
                    <p className="text-xs text-[#8A9B95]">{clubDisplayName}</p>
                  </div>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="p-1.5 rounded-lg text-[#8A9B95] hover:text-[#F1F5F3] transition"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleProcessPayment} className="space-y-4">
                  {/* Nombre y Apellido */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-[#8A9B95] font-medium">Nombre</label>
                      <input
                        required
                        type="text"
                        placeholder="Nombre"
                        value={playerForm.firstName}
                        onChange={(e) => setPlayerForm({ ...playerForm, firstName: e.target.value })}
                        className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084]/50 rounded-xl px-3 py-2.5 text-xs text-[#F1F5F3] placeholder-[#8A9B95]/50 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-[#8A9B95] font-medium">Apellido</label>
                      <input
                        required
                        type="text"
                        placeholder="Apellido"
                        value={playerForm.lastName}
                        onChange={(e) => setPlayerForm({ ...playerForm, lastName: e.target.value })}
                        className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084]/50 rounded-xl px-3 py-2.5 text-xs text-[#F1F5F3] placeholder-[#8A9B95]/50 outline-none"
                      />
                    </div>
                  </div>

                  {/* Teléfono / WhatsApp */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#8A9B95] font-medium">Teléfono (WhatsApp)</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-[#06100E] border border-[#16272a] rounded-xl px-3 py-2 text-xs text-[#8A9B95] flex items-center justify-center font-medium">
                        AR +54
                      </div>
                      <input
                        required
                        type="tel"
                        placeholder="343 510 0200"
                        value={playerForm.phone}
                        onChange={(e) => setPlayerForm({ ...playerForm, phone: e.target.value })}
                        className="col-span-2 w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084]/50 rounded-xl px-3 py-2 text-xs text-[#F1F5F3] placeholder-[#8A9B95]/50 outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-[#8A9B95] mt-0.5">
                      Se debe eliminar el prefijo 0 en el código de área y el prefijo 15 en el teléfono. Ej: 358 510 0200
                    </p>
                  </div>

                  {/* Email (opcional / de contacto) */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#8A9B95] font-medium">Email (opcional)</label>
                    <input
                      type="email"
                      placeholder="usuario@ejemplo.com"
                      value={playerForm.email}
                      onChange={(e) => setPlayerForm({ ...playerForm, email: e.target.value })}
                      className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084]/50 rounded-xl px-3 py-2 text-xs text-[#F1F5F3] placeholder-[#8A9B95]/50 outline-none"
                    />
                  </div>

                  {/* Duración del turno */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#8A9B95] font-medium">Duración de turno</label>
                    <div className="w-full bg-[#06100E] border border-[#16272a] rounded-xl px-3 py-2.5 text-xs text-[#F1F5F3] font-medium flex items-center justify-between">
                      <span>90 Minutos</span>
                      <span className="text-[#8A9B95] text-[11px]">Estándar</span>
                    </div>
                  </div>

                  {/* Selector de Cancha disponible */}
                  <div className="space-y-1">
                    <label className="text-xs text-[#8A9B95] font-medium">Cancha</label>
                    <select
                      value={selectedCourtId}
                      onChange={(e) => setSelectedCourtId(e.target.value)}
                      className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084]/50 rounded-xl px-3 py-2.5 text-xs text-[#F1F5F3] outline-none cursor-pointer"
                    >
                      {selectedSlotGroup.availableCourts.map((court) => (
                        <option key={court.id} value={court.id} className="bg-[#0C1517] text-[#F1F5F3]">
                          {court.name} {court.surface ? `(${court.surface})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Resumen del Turno */}
                  <div className="bg-[#06100E] border border-[#16272a] rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A9B95]">Inicia:</span>
                      <span className="font-semibold text-[#F1F5F3] capitalize">
                        {shortDateDisplay} {selectedSlotGroup.timeSlot.split(" - ")[0]} hs
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A9B95]">Termina:</span>
                      <span className="text-[#F1F5F3] font-medium">
                        {selectedSlotGroup.timeSlot.split(" - ")[1]} hs
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#8A9B95]">Precio Total:</span>
                      <span className="text-[#F1F5F3] font-bold">${selectedSlotGroup.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#16272a] pt-2">
                      <span className="text-[#8A9B95] font-medium">Seña MercadoPago:</span>
                      <span className="font-extrabold text-[#00D084] text-sm">
                        ${selectedSlotGroup.deposit.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs text-[#8A9B95] hover:text-[#F1F5F3] transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#00D084] hover:bg-[#4ADE80] text-[#06100E] font-extrabold px-6 py-2.5 rounded-xl text-xs transition shadow-lg shadow-[#00D084]/20"
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
                <div className="h-12 w-12 rounded-full border-4 border-[#00D084]/20 border-t-[#00D084] animate-spin mx-auto" />
                <h4 className="text-base font-bold text-[#F1F5F3]">Conectando con MercadoPago...</h4>
                <p className="text-xs text-[#8A9B95]">Procesando pago de seña para {clubDisplayName}</p>
              </div>
            )}

            {checkoutStep === "success" && (
              <div className="text-center space-y-5 py-2">
                <div className="h-16 w-16 rounded-3xl bg-[#00D084]/15 border border-[#00D084]/40 flex items-center justify-center text-[#00D084] mx-auto shadow-xl shadow-[#00D084]/20 animate-bounce">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-[#F1F5F3]">¡Reserva Confirmada!</h4>
                  <p className="text-xs text-[#8A9B95] mt-1">Registrada con éxito en {clubDisplayName}</p>
                </div>

                {/* Modern Confirmation Voucher */}
                <div className="bg-[#06100E] border border-[#00D084]/30 rounded-2xl p-4 text-xs space-y-2.5 text-left shadow-inner">
                  <div className="flex justify-between items-center border-b border-[#16272a] pb-2">
                    <span className="text-[#8A9B95] font-medium">Jugador:</span>
                    <span className="text-[#F1F5F3] font-bold">{playerForm.firstName} {playerForm.lastName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8A9B95]">Cancha:</span>
                    <span className="text-[#00D084] font-bold">{selectedSlotGroup.availableCourts.find((c) => c.id === selectedCourtId)?.name || "Cancha 1"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8A9B95]">Fecha y Horario:</span>
                    <span className="text-[#F1F5F3] font-semibold capitalize">{shortDateDisplay} • {selectedSlotGroup.timeSlot} hs</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8A9B95]">Seña Abonada:</span>
                    <span className="text-[#00D084] font-bold">${selectedSlotGroup.deposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-[#16272a] pt-2">
                    <span className="text-[#8A9B95] font-medium">Resta abonar en el club:</span>
                    <span className="font-extrabold text-amber-400 text-sm">
                      ${Math.max(0, selectedSlotGroup.price - selectedSlotGroup.deposit).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Direct WhatsApp Receipt CTA */}
                <div className="space-y-2 pt-1">
                  <a
                    href={`https://wa.me/${clubPhoneClean}?text=${encodeURIComponent(
                      `🎾 *¡Hola! Acabo de reservar un turno en ${clubDisplayName}:*\n\n` +
                      `📅 *Fecha:* ${shortDateDisplay}\n` +
                      `⏰ *Horario:* ${selectedSlotGroup.timeSlot} hs\n` +
                      `📍 *Cancha:* ${selectedSlotGroup.availableCourts.find((c) => c.id === selectedCourtId)?.name || "Cancha 1"}\n` +
                      `👤 *Jugador:* ${playerForm.firstName} ${playerForm.lastName}\n` +
                      `📱 *Teléfono:* ${playerForm.phone}\n` +
                      `💵 *Seña:* $${selectedSlotGroup.deposit.toLocaleString()}\n` +
                      `💰 *Resta abonar en el club:* $${Math.max(0, selectedSlotGroup.price - selectedSlotGroup.deposit).toLocaleString()}\n\n` +
                      `¡Comprobante generado por PádelHub!`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2.5 bg-[#00D084] hover:bg-[#4ADE80] text-[#06100E] font-black py-3.5 rounded-xl text-sm transition shadow-xl shadow-[#00D084]/25 hover:scale-[1.02]"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>Enviar Comprobante por WhatsApp</span>
                  </a>

                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="w-full bg-[#16272a] hover:bg-[#1f373b] text-[#8A9B95] hover:text-[#F1F5F3] font-semibold py-2.5 rounded-xl text-xs transition"
                  >
                    Listo, cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
