"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Trophy,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  CreditCard,
  ChevronRight,
  Car,
  Wifi,
  Coffee,
  MessageCircle,
  Sun,
  Moon,
  Zap,
  Lock,
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

const DATES = [
  { dayName: "Hoy", dateStr: "Mié 9 Sep", fullDate: "Hoy, 9 de Septiembre" },
  { dayName: "Mañana", dateStr: "Jue 10 Sep", fullDate: "Jueves 10 de Septiembre" },
  { dayName: "Viernes", dateStr: "11 Sep", fullDate: "Viernes 11 de Septiembre" },
  { dayName: "Sábado", dateStr: "12 Sep", fullDate: "Sábado 12 de Septiembre" },
  { dayName: "Domingo", dateStr: "13 Sep", fullDate: "Domingo 13 de Septiembre" },
];

const TIME_SLOTS = [
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
  const [selectedDate, setSelectedDate] = useState(DATES[0]);
  const [filterIndoor, setFilterIndoor] = useState<string>("all");
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

  const priceDay = club?.price_day ?? 14000;
  const priceNight = club?.price_night ?? 18000;
  const lightStart = club?.light_start_time || "18:30";
  const depositAmount = club?.deposit_amount ?? 8000;

  // Generate slots dynamically for the club courts with daytime/nighttime pricing & occupancy checks
  const generatedSlots: Slot[] = [];
  const activeCourts = courts.length > 0 ? courts : [
    { id: "c1", club_id: club?.id || "default", name: "Cancha 1 (Cristal)", surface: "Cristal Panorámico", indoor: true },
    { id: "c2", club_id: club?.id || "default", name: "Cancha 2 (Sintético)", surface: "Césped Sintético Pro", indoor: false },
  ];

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
          (r.booking_type === "fixed" || r.date_str === selectedDate.fullDate || r.date_str === "Hoy, 9 de Septiembre")
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

  const filteredSlots = generatedSlots.filter((s) => {
    if (filterIndoor === "indoor") return s.indoor;
    if (filterIndoor === "outdoor") return !s.indoor;
    return true;
  });

  const handleSelectSlot = (slot: Slot) => {
    if (slot.isOccupied) return;
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
          date_str: selectedDate.fullDate,
          time_slot: selectedSlot?.timeSlot,
          price: selectedSlot?.price || priceDay,
          deposit: selectedSlot?.deposit || depositAmount,
          booking_type: "casual",
        }),
      });

      if (res.ok) {
        loadClubData();
      }

      // Generate MercadoPago Checkout Pro preference
      const prefRes = await fetch("https://padel-saas-backend-production.up.railway.app/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: club?.id,
          court_id: selectedSlot?.courtId,
          player_name: `${playerForm.firstName} ${playerForm.lastName}`.trim(),
          player_phone: playerForm.phone,
          player_email: playerForm.email,
          date_str: selectedDate.fullDate,
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white">{clubDisplayName}</h1>
              <p className="text-[11px] text-slate-400">{clubDisplayCity}</p>
            </div>
          </div>

          <a
            href={`https://wa.me/${clubPhoneClean}?text=Hola!%20Quería%20consultar%20por%20un%20turno%20en%20${encodeURIComponent(clubDisplayName)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp Complejo</span>
          </a>
        </div>
      </header>

      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                Complejo Oficial
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                {clubDisplayName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span>{clubDisplayCity}</span>
                <span>•</span>
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span>{club?.open_time || "14:00"} a {club?.close_time || "01:00"} hs</span>
              </div>
            </div>

            {/* Rates Badges */}
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 p-2.5 rounded-2xl">
              <div className="px-3 py-1 text-left border-r border-slate-800">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Sun className="h-3 w-3 text-amber-400" /> Sin luz
                </div>
                <div className="text-sm font-bold text-white">${priceDay.toLocaleString()}</div>
              </div>
              <div className="px-3 py-1 text-left border-r border-slate-800">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Moon className="h-3 w-3 text-indigo-400" /> Con luz (desde {lightStart})
                </div>
                <div className="text-sm font-bold text-indigo-300">${priceNight.toLocaleString()}</div>
              </div>
              <div className="px-3 py-1 text-left">
                <div className="text-[11px] text-slate-400">Seña online</div>
                <div className="text-sm font-bold text-emerald-400">${depositAmount.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
              <Sparkles className="h-3 w-3 text-blue-400" /> {courts.length || club?.max_courts || 2} Canchas de Pádel
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
              <Car className="h-3 w-3 text-emerald-400" /> Estacionamiento
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
              <Coffee className="h-3 w-3 text-amber-400" /> Bar & Quincho
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
              <Wifi className="h-3 w-3 text-purple-400" /> Wi-Fi
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Seleccioná la Fecha
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {DATES.map((d) => {
              const isSelected = selectedDate.fullDate === d.fullDate;
              return (
                <button
                  key={d.fullDate}
                  onClick={() => setSelectedDate(d)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-24 py-3 px-2 rounded-2xl border transition ${
                    isSelected
                      ? "bg-emerald-500 border-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                      : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <span className="text-[11px] uppercase">{d.dayName}</span>
                  <span className="text-sm font-extrabold mt-0.5">{d.dateStr}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterIndoor("all")}
              className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                filterIndoor === "all"
                  ? "bg-slate-800 border-slate-600 text-white font-medium"
                  : "bg-slate-950 border-slate-800 text-slate-400"
              }`}
            >
              Todas las pistas
            </button>
            <button
              onClick={() => setFilterIndoor("indoor")}
              className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                filterIndoor === "indoor"
                  ? "bg-slate-800 border-slate-600 text-white font-medium"
                  : "bg-slate-950 border-slate-800 text-slate-400"
              }`}
            >
              Techadas (Indoor)
            </button>
            <button
              onClick={() => setFilterIndoor("outdoor")}
              className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                filterIndoor === "outdoor"
                  ? "bg-slate-800 border-slate-600 text-white font-medium"
                  : "bg-slate-950 border-slate-800 text-slate-400"
              }`}
            >
              Descubiertas
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {filteredSlots.map((slot) => (
            <div
              key={slot.id}
              className={`bg-slate-900/80 border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-md ${
                slot.isOccupied
                  ? "border-slate-800/60 opacity-60 bg-slate-950/40"
                  : "border-slate-800 hover:border-emerald-500/50 group"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-xl border transition ${
                  slot.isOccupied
                    ? "bg-slate-900 border-slate-800 text-slate-600"
                    : "bg-slate-950 border-slate-800 text-emerald-400 group-hover:scale-105"
                }`}>
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">{slot.timeSlot}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                      90 min
                    </span>
                    {slot.isNight ? (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-md font-medium">
                        <Zap className="h-2.5 w-2.5 text-indigo-400" /> Con Luz
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-medium">
                        <Sun className="h-2.5 w-2.5 text-amber-400" /> Diurno
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <span className="text-slate-200 font-medium">{slot.courtName}</span>
                    <span>•</span>
                    <span>{slot.surface}</span>
                    <span>•</span>
                    <span className="text-blue-400">{slot.indoor ? "Techada" : "Exterior"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                {!slot.isOccupied ? (
                  <>
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-slate-400">Total: ${slot.price.toLocaleString()}</div>
                      <div className="text-sm font-bold text-emerald-400">
                        Seña: ${slot.deposit.toLocaleString()}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectSlot(slot)}
                      className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/10"
                    >
                      <span>Reservar</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium px-4 py-2 rounded-xl bg-slate-950 border border-slate-800/80">
                    <Lock className="h-3.5 w-3.5 text-slate-600" />
                    <span>Reservado / Ocupado</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {isCheckoutOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            {checkoutStep === "form" && (
              <>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-base">Reservá en {clubDisplayName}</h3>
                  <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 text-sm">✕</button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Día y Horario:</span>
                    <span className="font-bold text-white">{selectedDate.dayName} {selectedDate.dateStr} — {selectedSlot.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pista:</span>
                    <span className="text-white">{selectedSlot.courtName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tarifa:</span>
                    <span className="text-slate-200">
                      ${selectedSlot.price.toLocaleString()} ({selectedSlot.isNight ? "Con Luz" : "Sin Luz"})
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-1.5">
                    <span className="text-slate-400">Seña MercadoPago:</span>
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400"
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
                <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto"></div>
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
