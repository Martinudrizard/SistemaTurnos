"use client";

import React, { useState } from "react";
import {
  Trophy,
  MapPin,
  Phone,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  ChevronRight,
  Info,
  Car,
  Wifi,
  Coffee,
  Sun,
  Share2,
  MessageCircle,
} from "lucide-react";

interface Slot {
  id: string;
  courtName: string;
  surface: string;
  indoor: boolean;
  timeSlot: string;
  startTime: string;
  price: number;
  deposit: number;
  isAvailable: boolean;
}

const DATES = [
  { dayName: "Hoy", dateStr: "Mié 9 Sep", fullDate: "2026-09-09" },
  { dayName: "Mañana", dateStr: "Jue 10 Sep", fullDate: "2026-09-10" },
  { dayName: "Viernes", dateStr: "11 Sep", fullDate: "2026-09-11" },
  { dayName: "Sábado", dateStr: "12 Sep", fullDate: "2026-09-12" },
  { dayName: "Domingo", dateStr: "13 Sep", fullDate: "2026-09-13" },
  { dayName: "Lunes", dateStr: "14 Sep", fullDate: "2026-09-14" },
  { dayName: "Martes", dateStr: "15 Sep", fullDate: "2026-09-15" },
];

const INITIAL_SLOTS: Slot[] = [
  {
    id: "s1",
    courtName: "Cancha 1 (Central)",
    surface: "Cristal Panorámico",
    indoor: true,
    timeSlot: "14:00 a 15:30",
    startTime: "14:00",
    price: 14000,
    deposit: 7000,
    isAvailable: true,
  },
  {
    id: "s2",
    courtName: "Cancha 2 (WPT)",
    surface: "Cristal Panorámico",
    indoor: true,
    timeSlot: "15:30 a 17:00",
    startTime: "15:30",
    price: 14000,
    deposit: 7000,
    isAvailable: true,
  },
  {
    id: "s3",
    courtName: "Cancha 1 (Central)",
    surface: "Cristal Panorámico",
    indoor: true,
    timeSlot: "17:00 a 18:30",
    startTime: "17:00",
    price: 16000,
    deposit: 8000,
    isAvailable: true,
  },
  {
    id: "s4",
    courtName: "Cancha 3 (Outdoor)",
    surface: "Césped Sintético Pro",
    indoor: false,
    timeSlot: "18:30 a 20:00",
    startTime: "18:30",
    price: 14000,
    deposit: 7000,
    isAvailable: true,
  },
  {
    id: "s5",
    courtName: "Cancha 2 (WPT)",
    surface: "Cristal Panorámico",
    indoor: true,
    timeSlot: "20:00 a 21:30",
    startTime: "20:00",
    price: 16000,
    deposit: 8000,
    isAvailable: true,
  },
  {
    id: "s6",
    courtName: "Cancha 4 (Outdoor)",
    surface: "Césped Sintético Pro",
    indoor: false,
    timeSlot: "21:30 a 23:00",
    startTime: "21:30",
    price: 14000,
    deposit: 7000,
    isAvailable: true,
  },
  {
    id: "s7",
    courtName: "Cancha 1 (Central)",
    surface: "Cristal Panorámico",
    indoor: true,
    timeSlot: "23:00 a 00:30",
    startTime: "23:00",
    price: 14000,
    deposit: 7000,
    isAvailable: true,
  },
];

export default function ClubBookingPage() {
  const [selectedDate, setSelectedDate] = useState(DATES[0]);
  const [filterIndoor, setFilterIndoor] = useState<string>("all");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Form checkout state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"form" | "mercadopago" | "success">("form");
  const [playerForm, setPlayerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const filteredSlots = INITIAL_SLOTS.filter((s) => {
    if (filterIndoor === "indoor") return s.indoor;
    if (filterIndoor === "outdoor") return !s.indoor;
    return true;
  });

  const handleSelectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    setCheckoutStep("form");
    setIsCheckoutOpen(true);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep("mercadopago");
    // Simulating MercadoPago redirection / approved payment flow
    setTimeout(() => {
      setCheckoutStep("success");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white">La Toska Pádel</h1>
              <p className="text-[11px] text-slate-400">Paraná, Entre Ríos</p>
            </div>
          </div>

          <a
            href="https://wa.me/5493435551234?text=Hola!%20Quería%20consultar%20por%20un%20turno%20de%20pádel"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </header>

      {/* Hero Club Header */}
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                Complejo Verificado
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                La Toska Pádel Club
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span>Av. Ramírez 2450, Paraná, Entre Ríos</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Amenities Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
              <Sparkles className="h-3 w-3 text-blue-400" /> 4 Canchas Cristal
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

      {/* Main Booking Container */}
      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Date Selector Carousel */}
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

        {/* Filters Row */}
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

          <div className="text-xs text-slate-400 hidden sm:block">
            {filteredSlots.length} turnos disponibles
          </div>
        </div>

        {/* Slots List */}
        <div className="space-y-3">
          {filteredSlots.map((slot) => (
            <div
              key={slot.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-md group"
            >
              <div className="flex items-start gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 group-hover:scale-105 transition">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">{slot.timeSlot}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                      90 min
                    </span>
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
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* CHECKOUT / MERCADOPAGO MODAL */}
      {isCheckoutOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            {/* Step 1: Form */}
            {checkoutStep === "form" && (
              <>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-base">Completá tus datos para reservar</h3>
                  <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 text-sm">✕</button>
                </div>

                {/* Summary Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Día y Horario:</span>
                    <span className="font-bold text-white">{selectedDate.dayName} {selectedDate.dateStr} — {selectedSlot.timeSlot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pista:</span>
                    <span className="text-white">{selectedSlot.courtName}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-1.5">
                    <span className="text-slate-400">Seña requerida (MercadoPago):</span>
                    <span className="font-bold text-emerald-400 text-sm">${selectedSlot.deposit.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    El saldo restante (${(selectedSlot.price - selectedSlot.deposit).toLocaleString()}) se abona al llegar a la cancha.
                  </p>
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">WhatsApp (para enviarte la confirmación)</label>
                    <input
                      required
                      type="text"
                      placeholder="+54 9 343 555-0199"
                      value={playerForm.phone}
                      onChange={(e) => setPlayerForm({ ...playerForm, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                      <span>Pagar Seña con MercadoPago (${selectedSlot.deposit.toLocaleString()})</span>
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step 2: Processing Payment */}
            {checkoutStep === "mercadopago" && (
              <div className="py-12 text-center space-y-4">
                <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mx-auto"></div>
                <h4 className="text-base font-bold text-white">Conectando con MercadoPago...</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Procesando el pago de la seña por ${selectedSlot.deposit.toLocaleString()}.
                </p>
              </div>
            )}

            {/* Step 3: Success */}
            {checkoutStep === "success" && (
              <div className="text-center space-y-4 py-4">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-white">¡Reserva Confirmada!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Seña abonada con éxito por MercadoPago. Código: <span className="text-emerald-400 font-mono font-bold">#PDL-9842</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-left space-y-1">
                  <div><span className="text-slate-400">Pista:</span> <span className="text-white font-semibold">{selectedSlot.courtName}</span></div>
                  <div><span className="text-slate-400">Horario:</span> <span className="text-white font-semibold">{selectedDate.dayName} {selectedDate.dateStr} — {selectedSlot.timeSlot}</span></div>
                  <div><span className="text-slate-400">Titular:</span> <span className="text-white font-semibold">{playerForm.firstName} {playerForm.lastName}</span></div>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2 text-left">
                  <MessageCircle className="h-4 w-4 flex-shrink-0" />
                  <span>Te enviamos un mensaje de confirmación a tu WhatsApp ({playerForm.phone}).</span>
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
