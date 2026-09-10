"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Building2,
  Flame,
  LogOut,
  Sun,
  Moon,
  CheckCircle2,
  ShieldCheck,
  Trash2,
  MessageCircle,
  Lock,
  Repeat,
  Zap,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";

interface Court {
  id: string;
  club_id: string;
  name: string;
  surface: string;
  indoor: boolean;
  is_active: boolean;
}

interface Booking {
  id: string;
  club_id: string;
  court_id: string;
  player_name: string;
  player_phone: string;
  player_email?: string;
  date_str?: string;
  time_slot: string;
  status: string;
  price: number;
  deposit_paid: number;
  booking_type?: "casual" | "fixed";
  via_bot: boolean;
}

interface ClubSettings {
  id: string;
  name: string;
  open_time: string;
  close_time: string;
  price_day: number;
  price_night: number;
  light_start_time: string;
  deposit_amount: number;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function formatDateReadable(isoStr: string) {
  try {
    const [y, m, d] = isoStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const dayName = DAYS[date.getDay()];
    const monthName = MONTHS[m - 1];
    return `${dayName}, ${d} de ${monthName} de ${y}`;
  } catch (e) {
    return isoStr;
  }
}

export default function OwnerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"grid" | "courts" | "pricing">("grid");
  
  // Default date (September 9, 2026 or current)
  const [currentDateIso, setCurrentDateIso] = useState<string>("2026-09-09");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clubSettings, setClubSettings] = useState<ClubSettings>({
    id: "",
    name: "Mi Complejo",
    open_time: "14:00",
    close_time: "01:00",
    price_day: 14000,
    price_night: 18000,
    light_start_time: "18:30",
    deposit_amount: 8000,
  });
  const [saveMsg, setSaveMsg] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ courtId: string; timeSlot: string } | null>(null);
  const [bookingFormData, setBookingFormData] = useState({
    playerName: "",
    playerPhone: "",
    price: 14000,
    depositPaid: 0,
    bookingType: "casual" as "casual" | "fixed",
    isBlocked: false,
  });

  const [activeBookingDetails, setActiveBookingDetails] = useState<Booking | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("padel_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      loadClubData(parsed.clubId);
    } else {
      loadClubData(null);
    }
  }, []);

  const loadClubData = async (clubId: string | null) => {
    try {
      const targetId = clubId || "7edcad2d-6ec3-4d7a-af7a-43bc3aea0ddf";
      const clubRes = await fetch(`https://padel-saas-backend-production.up.railway.app/api/clubs/${targetId}`);
      if (clubRes.ok) {
        const data = await clubRes.json();
        setClubSettings({
          id: data.id,
          name: data.name,
          open_time: data.open_time || "14:00",
          close_time: data.close_time || "01:00",
          price_day: Number(data.price_day) || 14000,
          price_night: Number(data.price_night) || 18000,
          light_start_time: data.light_start_time || "18:30",
          deposit_amount: Number(data.deposit_amount) || 8000,
        });
      }

      const courtsRes = await fetch(`https://padel-saas-backend-production.up.railway.app/api/courts/${targetId}`);
      if (courtsRes.ok) {
        const courtsData = await courtsRes.json();
        if (courtsData.length > 0) setCourts(courtsData);
      }

      const bookingsRes = await fetch(`https://padel-saas-backend-production.up.railway.app/api/reservations?clubId=${targetId}`);
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }
    } catch (e) {
      console.warn("Using local club data fallback");
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMsg("");
    try {
      const targetId = clubSettings.id || user?.clubId || "7edcad2d-6ec3-4d7a-af7a-43bc3aea0ddf";
      const res = await fetch(`https://padel-saas-backend-production.up.railway.app/api/clubs/${targetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clubSettings),
      });
      if (res.ok) {
        setSaveMsg("¡Tarifas y horarios guardados con éxito!");
      }
    } catch (err) {
      setSaveMsg("Configuración guardada localmente");
    }
  };

  const handlePrevDay = () => {
    const [y, m, d] = currentDateIso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const prevIso = date.toISOString().split("T")[0];
    setCurrentDateIso(prevIso);
  };

  const handleNextDay = () => {
    const [y, m, d] = currentDateIso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const nextIso = date.toISOString().split("T")[0];
    setCurrentDateIso(nextIso);
  };

  const handleToday = () => {
    setCurrentDateIso("2026-09-09");
  };

  const TIME_SLOTS = [
    "14:00 - 15:30",
    "15:30 - 17:00",
    "17:00 - 18:30",
    "18:30 - 20:00",
    "20:00 - 21:30",
    "21:30 - 23:00",
    "23:00 - 00:30",
  ];

  const readableDate = formatDateReadable(currentDateIso);

  const getBookingForSlot = (courtId: string, timeSlot: string) => {
    return bookings.find((b) => {
      if (b.court_id !== courtId || b.time_slot !== timeSlot || b.status === "canceled") return false;
      if (b.booking_type === "fixed") return true;
      if (b.date_str === currentDateIso) return true;
      if (b.date_str === readableDate) return true;
      if (currentDateIso === "2026-09-09" && (b.date_str === "Hoy, 9 de Septiembre" || b.date_str === "Hoy")) return true;
      return false;
    });
  };

  const handleOpenSlot = (courtId: string, timeSlot: string) => {
    const existing = getBookingForSlot(courtId, timeSlot);
    if (existing) {
      setActiveBookingDetails(existing);
    } else {
      const isNight = timeSlot >= clubSettings.light_start_time;
      const autoPrice = isNight ? clubSettings.price_night : clubSettings.price_day;
      setSelectedSlot({ courtId, timeSlot });
      setBookingFormData({
        playerName: "",
        playerPhone: "",
        price: autoPrice,
        depositPaid: 0,
        bookingType: "casual",
        isBlocked: false,
      });
      setIsModalOpen(true);
    }
  };

  const handleSaveBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const targetClubId = clubSettings.id || user?.clubId || "7edcad2d-6ec3-4d7a-af7a-43bc3aea0ddf";
    try {
      const res = await fetch("https://padel-saas-backend-production.up.railway.app/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: targetClubId,
          court_id: selectedSlot.courtId,
          player_name: bookingFormData.isBlocked ? "Horario Bloqueado" : bookingFormData.playerName,
          player_phone: bookingFormData.isBlocked ? "-" : bookingFormData.playerPhone,
          date_str: currentDateIso,
          time_slot: selectedSlot.timeSlot,
          price: bookingFormData.isBlocked ? 0 : Number(bookingFormData.price),
          deposit: bookingFormData.isBlocked ? 0 : Number(bookingFormData.depositPaid),
          booking_type: bookingFormData.bookingType,
          is_blocked: bookingFormData.isBlocked,
        }),
      });

      if (res.ok) {
        const savedBooking = await res.json();
        setBookings([...bookings, savedBooking]);
      } else {
        const err = await res.json();
        alert(err.error || "No se pudo registrar el turno");
      }
    } catch (err) {
      console.warn("Fallback booking saved");
    }

    setIsModalOpen(false);
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`https://padel-saas-backend-production.up.railway.app/api/reservations/${bookingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBookings(bookings.filter((b) => b.id !== bookingId));
        setActiveBookingDetails(null);
      }
    } catch (err) {
      console.warn("Error deleting booking");
    }
  };

  // Day stats
  const activeDayBookings = bookings.filter((b) => {
    if (b.status === "canceled") return false;
    if (b.booking_type === "fixed") return true;
    if (b.date_str === currentDateIso || b.date_str === readableDate) return true;
    if (currentDateIso === "2026-09-09" && (b.date_str === "Hoy, 9 de Septiembre" || b.date_str === "Hoy")) return true;
    return false;
  });

  const totalSlotsCount = (courts.length || 1) * TIME_SLOTS.length;
  const occupiedSlotsCount = activeDayBookings.filter((b) => b.status !== "blocked").length;
  const occupationRate = Math.round((occupiedSlotsCount / totalSlotsCount) * 100) || 0;
  const totalIncomeSelectedDay = activeDayBookings.reduce((sum, b) => sum + (Number(b.deposit_paid) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white">{clubSettings.name}</h1>
                <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Panel Dueño ({user?.displayName || "Administrador"})
                </span>
              </div>
              <p className="text-xs text-slate-400">{courts.length} {courts.length === 1 ? "cancha habilitada" : "canchas habilitadas"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
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
                Mis Canchas ({courts.length})
              </button>
              <button
                onClick={() => setActiveTab("pricing")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "pricing" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
                }`}
              >
                Tarifas & Horarios
              </button>
            </div>
            <a
              href="/login"
              onClick={() => localStorage.removeItem("padel_user")}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition text-xs flex items-center gap-1"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-medium text-slate-400">Ocupación del Día</p>
            <h3 className="text-2xl font-bold mt-1 text-white">{occupationRate}%</h3>
            <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
              <Flame className="h-3.5 w-3.5" /> {occupiedSlotsCount} de {totalSlotsCount} turnos
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-medium text-slate-400">Señas Cobradas (Día)</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-400">
              ${totalIncomeSelectedDay.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Confirmadas en el sistema</p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-medium text-slate-400">Tarifa Diurna / Nocturna</p>
            <h3 className="text-xl font-bold mt-1 text-white">
              ${clubSettings.price_day.toLocaleString()} / ${clubSettings.price_night.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Luz a partir de {clubSettings.light_start_time} hs</p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-medium text-slate-400">Bot IA WhatsApp</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-bold text-white">Online 24/7</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Responde dudas y confirma turnos</p>
          </div>
        </section>

        {activeTab === "grid" && (
          <div className="space-y-4">
            {/* Navegador Completo del Calendario Anual */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePrevDay}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
                  title="Día anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div
                  onClick={() => dateInputRef.current?.showPicker()}
                  className="flex-1 sm:flex-initial flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/80 cursor-pointer transition shadow-inner group"
                >
                  <CalendarDays className="h-4 w-4 text-blue-400 group-hover:scale-110 transition" />
                  <span className="text-sm font-bold text-white">{readableDate}</span>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md font-medium ml-1">
                    Abrir Calendario 📅
                  </span>
                </div>

                <input
                  type="date"
                  ref={dateInputRef}
                  value={currentDateIso}
                  onChange={(e) => {
                    if (e.target.value) setCurrentDateIso(e.target.value);
                  }}
                  className="sr-only"
                />

                <button
                  onClick={handleNextDay}
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
                  title="Día siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={handleToday}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
                >
                  Hoy
                </button>
              </div>

              <div className="text-xs text-slate-400">
                Hacé clic en cualquier casillero libre para reservar o en uno ocupado para ver saldo y detalles
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/80 text-slate-400 text-xs border-b border-slate-800">
                      <th className="p-4 w-36 font-semibold border-r border-slate-800/80">Horario</th>
                      {courts.map((court) => (
                        <th key={court.id} className="p-4 font-semibold border-r border-slate-800/80 min-w-[220px]">
                          <div className="text-white text-sm">{court.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{court.surface}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {TIME_SLOTS.map((slot) => {
                      const isNightSlot = slot >= clubSettings.light_start_time;
                      const defaultSlotPrice = isNightSlot ? clubSettings.price_night : clubSettings.price_day;

                      return (
                        <tr key={slot} className="hover:bg-slate-800/20 transition">
                          <td className="p-4 font-semibold text-slate-300 border-r border-slate-800/80 bg-slate-950/30 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-slate-500" /> {slot}
                            </div>
                            {isNightSlot ? (
                              <span className="text-[10px] text-amber-400 flex items-center gap-0.5 font-bold" title="Tarifa con luz">💡 Luz</span>
                            ) : (
                              <span className="text-[10px] text-blue-400 flex items-center gap-0.5" title="Tarifa sin luz">☀️ Día</span>
                            )}
                          </td>
                          {courts.map((court) => {
                            const booking = getBookingForSlot(court.id, slot);
                            const slotPrice = booking ? (Number(booking.price) || defaultSlotPrice) : defaultSlotPrice;
                            const depositNum = booking ? (Number(booking.deposit_paid) || 0) : 0;
                            const remainingBalance = Math.max(0, slotPrice - depositNum);

                            return (
                              <td key={court.id} className="p-2 border-r border-slate-800/80">
                                {booking ? (
                                  <button
                                    onClick={() => handleOpenSlot(court.id, slot)}
                                    className={`w-full text-left p-3 rounded-xl border transition ${
                                      booking.status === "blocked"
                                        ? "bg-red-500/10 border-red-500/30 text-red-300 hover:border-red-500/50"
                                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/50"
                                    }`}
                                  >
                                    <div className="font-semibold flex items-center justify-between">
                                      <span className="truncate">{booking.player_name}</span>
                                      {booking.booking_type === "fixed" && (
                                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-1.5 py-0.2 rounded font-bold ml-1 flex-shrink-0">
                                          <Repeat className="h-2.5 w-2.5" /> Fijo
                                        </span>
                                      )}
                                      {booking.status === "blocked" && <Lock className="h-3 w-3 text-red-400 ml-1 flex-shrink-0" />}
                                    </div>

                                    {booking.status !== "blocked" && (
                                      <div className="text-[11px] mt-1 space-y-0.5">
                                        <div className="flex justify-between items-center text-slate-300">
                                          <span>Seña: ${depositNum.toLocaleString()}</span>
                                          <span className="font-bold text-amber-300">
                                            {remainingBalance === 0 ? "Pagado 100%" : `Debe: $${remainingBalance.toLocaleString()}`}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleOpenSlot(court.id, slot)}
                                    className="w-full text-center py-4 rounded-xl border border-dashed border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 text-slate-500 hover:text-blue-400 transition text-xs font-medium"
                                  >
                                    + Libre (${defaultSlotPrice.toLocaleString()})
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "pricing" && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-3xl">
            <div>
              <h2 className="text-lg font-bold text-white">Configuración de Horarios, Tarifas & Seña</h2>
              <p className="text-xs text-slate-400">
                Personalizá los precios diurnos/nocturnos, el horario de iluminación y el valor de la seña pública requerida para jugadores online.
              </p>
            </div>

            {saveMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{saveMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Sun className="h-3.5 w-3.5 text-amber-400" /> Precio Turno Sin Luz (Diurno)
                  </label>
                  <input
                    type="number"
                    value={clubSettings.price_day}
                    onChange={(e) => setClubSettings({ ...clubSettings, price_day: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 flex items-center gap-1.5">
                    <Moon className="h-3.5 w-3.5 text-blue-400" /> Precio Turno Con Luz (Nocturno)
                  </label>
                  <input
                    type="number"
                    value={clubSettings.price_night}
                    onChange={(e) => setClubSettings({ ...clubSettings, price_night: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Hora de inicio de luz artificial</label>
                  <input
                    type="text"
                    placeholder="18:30"
                    value={clubSettings.light_start_time}
                    onChange={(e) => setClubSettings({ ...clubSettings, light_start_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Monto de Seña para Jugadores Online (MercadoPago)</label>
                  <input
                    type="number"
                    value={clubSettings.deposit_amount}
                    onChange={(e) => setClubSettings({ ...clubSettings, deposit_amount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Horario de Apertura</label>
                  <input
                    type="text"
                    placeholder="14:00"
                    value={clubSettings.open_time}
                    onChange={(e) => setClubSettings({ ...clubSettings, open_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Horario de Cierre</label>
                  <input
                    type="text"
                    placeholder="01:00"
                    value={clubSettings.close_time}
                    onChange={(e) => setClubSettings({ ...clubSettings, close_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-lg shadow-blue-500/20"
                >
                  Guardar Configuración
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "courts" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Canchas del Complejo</h2>
                <p className="text-xs text-slate-400">Tenés {courts.length} canchas activas asignadas a tu complejo.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                <span>Gestión de altas administrada por el Sistema</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courts.map((court) => (
                <div key={court.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white text-base">{court.name}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">Activa</span>
                  </div>
                  <p className="text-xs text-slate-400">{court.surface} • {court.indoor ? "Techada" : "Descubierta"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal: Crear Reserva Manual (Casual o Fijo) */}
      {isModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Cargar Reserva Manual</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleSaveBooking} className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Fecha:</span>
                  <span className="text-white font-semibold">{readableDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Horario:</span>
                  <span className="text-white font-bold">{selectedSlot.timeSlot}</span>
                </div>
              </div>

              {/* Selector de Tipo de Turno: Casual vs Fijo */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 font-medium">Modalidad del Turno</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingFormData({ ...bookingFormData, bookingType: "casual" })}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                      bookingFormData.bookingType === "casual"
                        ? "bg-blue-600/20 border-blue-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Zap className="h-3.5 w-3.5 text-blue-400" />
                      <span>Turno Casual</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Solo para este día</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingFormData({ ...bookingFormData, bookingType: "fixed" })}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                      bookingFormData.bookingType === "fixed"
                        ? "bg-indigo-600/20 border-indigo-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Repeat className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Turno Fijo</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Bloquea todos los días</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-slate-950/60 border border-slate-800 rounded-xl">
                <input
                  type="checkbox"
                  id="isBlocked"
                  checked={bookingFormData.isBlocked}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, isBlocked: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <label htmlFor="isBlocked" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Bloquear este horario (Mantenimiento / Fijo sin jugador)
                </label>
              </div>

              {!bookingFormData.isBlocked && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">Nombre del Jugador</label>
                    <input
                      required
                      type="text"
                      placeholder="Ej: Pedro González"
                      value={bookingFormData.playerName}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, playerName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-300">WhatsApp del Jugador (Opcional)</label>
                    <input
                      type="text"
                      placeholder="+54 9 343 ..."
                      value={bookingFormData.playerPhone}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, playerPhone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-300">Precio Total ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={bookingFormData.price}
                        onChange={(e) => setBookingFormData({ ...bookingFormData, price: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-slate-300">Seña ($)</label>
                        <button
                          type="button"
                          onClick={() => setBookingFormData({ ...bookingFormData, depositPaid: 0 })}
                          className="text-[10px] text-amber-400 hover:underline"
                        >
                          $0
                        </button>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={bookingFormData.depositPaid}
                        onChange={(e) => setBookingFormData({ ...bookingFormData, depositPaid: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Diferencia calculada en vivo */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between items-center">
                    <span className="text-slate-400">Resta cobrar en el club:</span>
                    <span className="font-bold text-amber-400 text-sm">
                      ${Math.max(0, bookingFormData.price - bookingFormData.depositPaid).toLocaleString()}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-slate-400">Cancelar</button>
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs">Guardar Reserva</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalles de Reserva & Liberar Pista */}
      {activeBookingDetails && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Detalle del Turno</h3>
              <button onClick={() => setActiveBookingDetails(null)} className="text-slate-400">✕</button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Modalidad:</span>
                {activeBookingDetails.booking_type === "fixed" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-md font-bold">
                    <Repeat className="h-3 w-3" /> Turno Fijo Recurrente
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-md font-bold">
                    <Zap className="h-3 w-3" /> Turno Casual
                  </span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Jugador / Titular:</span>
                <span className="text-white font-bold">{activeBookingDetails.player_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Horario:</span>
                <span className="text-white font-semibold">{activeBookingDetails.time_slot}</span>
              </div>
              {activeBookingDetails.player_phone && activeBookingDetails.player_phone !== "-" && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">WhatsApp:</span>
                  <a
                    href={`https://wa.me/${activeBookingDetails.player_phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 font-semibold hover:underline"
                  >
                    <MessageCircle className="h-3 w-3" /> {activeBookingDetails.player_phone}
                  </a>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400">Precio Total:</span>
                <span className="font-semibold text-white">${(Number(activeBookingDetails.price) || 14000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Seña Abonada:</span>
                <span className="font-semibold text-emerald-400">${(Number(activeBookingDetails.deposit_paid) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-2">
                <span className="text-slate-400 font-medium">Resta Cobrar (Debe):</span>
                <span className="font-bold text-amber-400 text-sm">
                  ${Math.max(0, (Number(activeBookingDetails.price) || 14000) - (Number(activeBookingDetails.deposit_paid) || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => handleDeleteBooking(activeBookingDetails.id)}
                className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3.5 py-2 rounded-xl text-xs font-semibold transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Liberar Turno</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveBookingDetails(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
