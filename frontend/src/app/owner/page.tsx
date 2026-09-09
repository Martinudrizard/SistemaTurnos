"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Building2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Phone,
  Flame,
  Sparkles,
} from "lucide-react";

interface Court {
  id: string;
  name: string;
  surface: "Cristal Panorámico" | "Muro Tradicional" | "Césped Sintético Pro";
  indoor: boolean;
  isActive: boolean;
}

interface Booking {
  id: string;
  courtId: string;
  timeSlot: string;
  playerName: string;
  playerPhone: string;
  status: "confirmed" | "deposit_paid" | "blocked" | "completed";
  price: number;
  depositPaid: number;
  viaBot: boolean;
}

const INITIAL_COURTS: Court[] = [
  { id: "c1", name: "Cancha 1 (Central)", surface: "Cristal Panorámico", indoor: true, isActive: true },
  { id: "c2", name: "Cancha 2 (World Padel Tour)", surface: "Cristal Panorámico", indoor: true, isActive: true },
  { id: "c3", name: "Cancha 3", surface: "Césped Sintético Pro", indoor: false, isActive: true },
  { id: "c4", name: "Cancha 4", surface: "Césped Sintético Pro", indoor: false, isActive: true },
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

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: "b1",
    courtId: "c1",
    timeSlot: "18:30 - 20:00",
    playerName: "Lucas Martínez",
    playerPhone: "+54 9 343 456-7890",
    status: "deposit_paid",
    price: 16000,
    depositPaid: 8000,
    viaBot: true,
  },
  {
    id: "b2",
    courtId: "c2",
    timeSlot: "20:00 - 21:30",
    playerName: "Mariano Gómez",
    playerPhone: "+54 9 343 512-3456",
    status: "confirmed",
    price: 16000,
    depositPaid: 16000,
    viaBot: false,
  },
  {
    id: "b3",
    courtId: "c1",
    timeSlot: "20:00 - 21:30",
    playerName: "Torneo Interno",
    playerPhone: "-",
    status: "blocked",
    price: 0,
    depositPaid: 0,
    viaBot: false,
  },
];

export default function OwnerDashboard() {
  const [activeTab, setActiveTab] = useState<"grid" | "courts" | "pricing">("grid");
  const [selectedDate, setSelectedDate] = useState("Hoy, 9 de Septiembre");
  const [courts, setCourts] = useState<Court[]>(INITIAL_COURTS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const maxAllowedCourts = 4;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ courtId: string; timeSlot: string } | null>(null);
  const [bookingFormData, setBookingFormData] = useState({
    playerName: "",
    playerPhone: "",
    price: 16000,
    depositPaid: 8000,
    isBlocked: false,
  });

  const [activeBookingDetails, setActiveBookingDetails] = useState<Booking | null>(null);
  const [isAddCourtModalOpen, setIsAddCourtModalOpen] = useState(false);
  const [newCourtData, setNewCourtData] = useState({
    name: "",
    surface: "Cristal Panorámico" as "Cristal Panorámico" | "Muro Tradicional" | "Césped Sintético Pro",
    indoor: true,
  });

  const getBookingForSlot = (courtId: string, timeSlot: string) => {
    return bookings.find((b) => b.courtId === courtId && b.timeSlot === timeSlot);
  };

  const handleOpenSlot = (courtId: string, timeSlot: string) => {
    const existing = getBookingForSlot(courtId, timeSlot);
    if (existing) {
      setActiveBookingDetails(existing);
    } else {
      setSelectedSlot({ courtId, timeSlot });
      setIsModalOpen(true);
    }
  };

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      courtId: selectedSlot.courtId,
      timeSlot: selectedSlot.timeSlot,
      playerName: bookingFormData.isBlocked ? "Horario Bloqueado" : bookingFormData.playerName,
      playerPhone: bookingFormData.isBlocked ? "-" : bookingFormData.playerPhone,
      status: bookingFormData.isBlocked ? "blocked" : "deposit_paid",
      price: bookingFormData.isBlocked ? 0 : Number(bookingFormData.price),
      depositPaid: bookingFormData.isBlocked ? 0 : Number(bookingFormData.depositPaid),
      viaBot: false,
    };

    setBookings([...bookings, newBooking]);
    setIsModalOpen(false);
    setBookingFormData({
      playerName: "",
      playerPhone: "",
      price: 16000,
      depositPaid: 8000,
      isBlocked: false,
    });
  };

  const handleAddCourt = (e: React.FormEvent) => {
    e.preventDefault();
    if (courts.length >= maxAllowedCourts) return;

    const newCourt: Court = {
      id: `c-${Date.now()}`,
      name: newCourtData.name,
      surface: newCourtData.surface,
      indoor: newCourtData.indoor,
      isActive: true,
    };

    setCourts([...courts, newCourt]);
    setIsAddCourtModalOpen(false);
    setNewCourtData({
      name: "",
      surface: "Cristal Panorámico",
      indoor: true,
    });
  };

  const totalSlotsCount = courts.length * TIME_SLOTS.length;
  const occupiedSlotsCount = bookings.filter((b) => b.status !== "blocked").length;
  const occupationRate = Math.round((occupiedSlotsCount / totalSlotsCount) * 100) || 0;
  const totalIncomeToday = bookings.reduce((sum, b) => sum + b.depositPaid, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white">La Toska Pádel</h1>
                <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Panel Complejo
                </span>
              </div>
              <p className="text-xs text-slate-400">Paraná, Entre Ríos • 4 Pistas activas</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "grid" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Grilla de Turnos
            </button>
            <button
              onClick={() => setActiveTab("courts")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "courts" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Mis Canchas ({courts.length}/{maxAllowedCourts})
            </button>
            <button
              onClick={() => setActiveTab("pricing")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "pricing" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              Tarifas & Señas
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Metrics Row */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-medium text-slate-400">Ocupación Hoy</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{occupationRate}%</h3>
            <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
              <Flame className="h-3.5 w-3.5" /> {occupiedSlotsCount} de {totalSlotsCount} turnos
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-medium text-slate-400">Señas Cobradas (MP)</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-400">
              ${totalIncomeToday.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Directo a tu cuenta MercadoPago</p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-medium text-slate-400">Cupo de Canchas</p>
            <h3 className="text-2xl font-bold mt-1 text-white">
              {courts.length} / {maxAllowedCourts}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Autorizado por Super Admin</p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-medium text-slate-400">Bot IA WhatsApp</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-bold text-white">Atendiendo 24/7</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Responde dudas y confirma turnos</p>
          </div>
        </section>

        {/* Tab 1: Grid */}
        {activeTab === "grid" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-semibold text-sm">
                  <CalendarIcon className="h-4 w-4 text-blue-400" />
                  <span>{selectedDate}</span>
                </div>
                <button className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-slate-950 border border-slate-800"></span>
                  <span className="text-slate-400">Libre</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-emerald-500/20 border border-emerald-500/50"></span>
                  <span className="text-slate-300">Señado / Confirmado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-md bg-red-500/20 border border-red-500/50"></span>
                  <span className="text-slate-400">Bloqueado</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 text-xs border-b border-slate-800">
                      <th className="p-4 w-36 font-semibold border-r border-slate-800/80">Horario</th>
                      {courts.map((court) => (
                        <th key={court.id} className="p-4 font-semibold border-r border-slate-800/80 min-w-[200px]">
                          <div className="text-white text-sm">{court.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{court.surface}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {TIME_SLOTS.map((slot) => (
                      <tr key={slot} className="hover:bg-slate-800/20 transition">
                        <td className="p-4 font-semibold text-slate-300 border-r border-slate-800/80 bg-slate-950/30 flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          {slot}
                        </td>
                        {courts.map((court) => {
                          const booking = getBookingForSlot(court.id, slot);
                          return (
                            <td key={court.id} className="p-2 border-r border-slate-800/80">
                              {booking ? (
                                <button
                                  onClick={() => handleOpenSlot(court.id, slot)}
                                  className={`w-full text-left p-3 rounded-xl border transition group ${
                                    booking.status === "blocked"
                                      ? "bg-red-500/10 border-red-500/30 hover:border-red-500/50"
                                      : "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50"
                                  }`}
                                >
                                  <div className="flex justify-between items-start">
                                    <span
                                      className={`font-semibold text-xs ${
                                        booking.status === "blocked" ? "text-red-300" : "text-emerald-300"
                                      }`}
                                    >
                                      {booking.playerName}
                                    </span>
                                    {booking.viaBot && (
                                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        <Sparkles className="h-2.5 w-2.5" /> Bot
                                      </span>
                                    )}
                                  </div>
                                  {booking.status !== "blocked" && (
                                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                                      <span>Seña: ${booking.depositPaid.toLocaleString()}</span>
                                      <span className="text-emerald-400 font-medium">Pagado</span>
                                    </div>
                                  )}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenSlot(court.id, slot)}
                                  className="w-full text-center py-4 rounded-xl border border-dashed border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 text-slate-500 hover:text-blue-400 transition text-xs font-medium"
                                >
                                  + Libre
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Courts */}
        {activeTab === "courts" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">Gestión de Pistas</h2>
                <p className="text-xs text-slate-400">
                  Tenés {courts.length} de {maxAllowedCourts} canchas habilitadas por tu plan.
                </p>
              </div>

              {courts.length < maxAllowedCourts ? (
                <button
                  onClick={() => setIsAddCourtModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-xs transition"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Cancha
                </button>
              ) : (
                <div className="flex items-center gap-2 text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Límite de cupo alcanzado (Contactá a soporte para ampliar)</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courts.map((court) => (
                <div
                  key={court.id}
                  className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-base">{court.name}</h3>
                      <p className="text-xs text-slate-400">{court.surface}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                      Activa
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
                    <span>{court.indoor ? "Techada (Indoor)" : "Descubierta (Outdoor)"}</span>
                    <span className="text-blue-400">Turnos de 90 min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Pricing */}
        {activeTab === "pricing" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-2xl">
            <div>
              <h2 className="text-lg font-bold text-white">Tarifas y Política de Seña</h2>
              <p className="text-xs text-slate-400">
                Configurá el precio de los turnos y el monto que el jugador debe pagar por MercadoPago para confirmar.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Precio Turno Estándar (90 min)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    defaultValue={16000}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Monto de Seña para Reservar (MercadoPago)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input
                    type="number"
                    defaultValue={8000}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  El jugador pagará este monto con tarjeta/transferencia al reservar; el resto lo abona en recepción.
                </p>
              </div>

              <div className="pt-4">
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition">
                  Guardar Configuración
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Booking / Block */}
      {isModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Cargar Reserva Manual</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 text-sm">✕</button>
            </div>

            <form onSubmit={handleSaveBooking} className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                <div className="text-slate-400">Horario: <span className="text-white font-semibold">{selectedSlot.timeSlot}</span></div>
                <div className="text-slate-400">Pista: <span className="text-white font-semibold">{courts.find(c => c.id === selectedSlot.courtId)?.name}</span></div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="blockCheck"
                  checked={bookingFormData.isBlocked}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, isBlocked: e.target.checked })}
                  className="rounded border-slate-700 text-red-500"
                />
                <label htmlFor="blockCheck" className="text-xs text-slate-300 cursor-pointer">
                  Bloquear horario (Mantenimiento / Torneo interno)
                </label>
              </div>

              {!bookingFormData.isBlocked && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">Nombre del Jugador</label>
                    <input
                      required
                      type="text"
                      placeholder="Ej: Martín Udrizard"
                      value={bookingFormData.playerName}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, playerName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">Teléfono (WhatsApp)</label>
                    <input
                      required
                      type="text"
                      placeholder="+54 9 343 ..."
                      value={bookingFormData.playerPhone}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, playerPhone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">Total Turno ($)</label>
                      <input
                        type="number"
                        value={bookingFormData.price}
                        onChange={(e) => setBookingFormData({ ...bookingFormData, price: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">Seña Abonada ($)</label>
                      <input
                        type="number"
                        value={bookingFormData.depositPaid}
                        onChange={(e) => setBookingFormData({ ...bookingFormData, depositPaid: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Details */}
      {activeBookingDetails && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Detalle de Reserva</h3>
              <button onClick={() => setActiveBookingDetails(null)} className="text-slate-400 text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Jugador:</span>
                  <span className="font-semibold text-white">{activeBookingDetails.playerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">WhatsApp:</span>
                  <span className="text-white">{activeBookingDetails.playerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Horario:</span>
                  <span className="text-white">{activeBookingDetails.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Seña pagada:</span>
                  <span className="text-emerald-400 font-bold">${activeBookingDetails.depositPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Saldo pendiente en cancha:</span>
                  <span className="text-amber-400 font-bold">
                    ${(activeBookingDetails.price - activeBookingDetails.depositPaid).toLocaleString()}
                  </span>
                </div>
              </div>

              {activeBookingDetails.playerPhone !== "-" && (
                <a
                  href={`https://wa.me/${activeBookingDetails.playerPhone.replace(/[^0-9]/g, "")}?text=Hola%20${activeBookingDetails.playerName},%20te%20contactamos%20de%20La%20Toska%20Pádel%20por%20tu%20turno.`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-xl transition"
                >
                  <Phone className="h-4 w-4" /> Enviar WhatsApp al Jugador
                </a>
              )}

              <button
                onClick={() => {
                  setBookings(bookings.filter((b) => b.id !== activeBookingDetails.id));
                  setActiveBookingDetails(null);
                }}
                className="w-full bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-300 py-2 rounded-xl transition"
              >
                Cancelar y Liberar Turno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Court */}
      {isAddCourtModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Crear Nueva Cancha</h3>
              <button onClick={() => setIsAddCourtModalOpen(false)} className="text-slate-400 text-sm">✕</button>
            </div>

            <form onSubmit={handleAddCourt} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Nombre de la Cancha</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Cancha 5 - Cristal"
                  value={newCourtData.name}
                  onChange={(e) => setNewCourtData({ ...newCourtData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Tipo de Superficie / Estructura</label>
                <select
                  value={newCourtData.surface}
                  onChange={(e: any) => setNewCourtData({ ...newCourtData, surface: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Cristal Panorámico">Cristal Panorámico</option>
                  <option value="Césped Sintético Pro">Césped Sintético Pro</option>
                  <option value="Muro Tradicional">Muro Tradicional</option>
                </select>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="indoorCheck"
                  checked={newCourtData.indoor}
                  onChange={(e) => setNewCourtData({ ...newCourtData, indoor: e.target.checked })}
                  className="rounded border-slate-700 text-blue-500"
                />
                <label htmlFor="indoorCheck" className="text-xs text-slate-300 cursor-pointer">
                  Cancha Techada (Indoor)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCourtModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                >
                  Crear Cancha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
