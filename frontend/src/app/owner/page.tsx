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
  Copy,
  ExternalLink,
  CreditCard,
  Key,
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
  day_of_week?: number;
  via_bot: boolean;
}

interface ClubSettings {
  id: string;
  name: string;
  slug: string;
  phone: string;
  city: string;
  open_time: string;
  close_time: string;
  price_day: number;
  price_night: number;
  light_start_time: string;
  deposit_amount: number;
  mp_access_token?: string;
  mp_public_key?: string;
  custom_whatsapp_msg?: string;
  ai_bot_enabled?: boolean;
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

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
  
  const [currentDateIso, setCurrentDateIso] = useState<string>("2026-09-10");
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [courts, setCourts] = useState<Court[]>([
    { id: "c1", club_id: "default", name: "Cancha 1 (Cristal)", surface: "Cristal Panorámico", indoor: true, is_active: true },
    { id: "c2", club_id: "default", name: "Cancha 2 (Sintético)", surface: "Césped Sintético Pro", indoor: false, is_active: true },
  ]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clubSettings, setClubSettings] = useState<ClubSettings>({
    id: "",
    name: "Mi Complejo",
    slug: "roca",
    phone: "+54 9 343 555-1234",
    city: "Argentina",
    open_time: "11:00",
    close_time: "01:00",
    price_day: 14000,
    price_night: 18000,
    light_start_time: "18:30",
    deposit_amount: 8000,
    mp_access_token: "",
    mp_public_key: "",
    custom_whatsapp_msg: "¡Hola! Te damos la bienvenida a nuestro complejo. ¿En qué podemos ayudarte?",
    ai_bot_enabled: true,
  });
  const [saveMsg, setSaveMsg] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

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
      const clubRes = await fetch(`https://padel-saas-backend-production-a91f.up.railway.app/api/clubs/${targetId}`);
      if (clubRes.ok) {
        const data = await clubRes.json();
        setClubSettings({
          id: data.id,
          name: data.name,
          slug: data.slug || "roca",
          phone: data.phone || "+54 9 343 555-1234",
          city: data.city || "Argentina",
          open_time: data.open_time || "11:00",
          close_time: data.close_time || "01:00",
          price_day: Number(data.price_day) || 14000,
          price_night: Number(data.price_night) || 18000,
          light_start_time: data.light_start_time || "18:30",
          deposit_amount: Number(data.deposit_amount) || 8000,
          mp_access_token: data.mp_access_token || "",
          mp_public_key: data.mp_public_key || "",
          custom_whatsapp_msg: data.custom_whatsapp_msg || "¡Hola! Te damos la bienvenida a nuestro complejo.",
          ai_bot_enabled: data.ai_bot_enabled ?? true,
        });
      }

      const courtsRes = await fetch(`https://padel-saas-backend-production-a91f.up.railway.app/api/courts/${targetId}`);
      if (courtsRes.ok) {
        const courtsData = await courtsRes.json();
        if (courtsData.length > 0) setCourts(courtsData);
      }

      const bookingsRes = await fetch(`https://padel-saas-backend-production-a91f.up.railway.app/api/reservations?clubId=${targetId}`);
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
      const res = await fetch(`https://padel-saas-backend-production-a91f.up.railway.app/api/clubs/${targetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clubSettings),
      });
      if (res.ok) {
        setSaveMsg("¡Configuración de complejo, WhatsApp y MercadoPago guardada con éxito!");
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
    setCurrentDateIso("2026-09-10");
  };

  const publicUrl = `https://sistema-turnos-gilt.vercel.app/clubs/${clubSettings.slug || "roca"}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const readableDate = formatDateReadable(currentDateIso);

  // Day of week calculation for current date
  const [currY, currM, currD] = currentDateIso.split("-").map(Number);
  const currentDayOfWeek = new Date(currY, currM - 1, currD).getDay();
  const currentDayName = DAYS[currentDayOfWeek];

  const getBookingForSlot = (courtId: string, timeSlot: string) => {
    return bookings.find((b) => {
      if (b.court_id !== courtId || b.time_slot !== timeSlot || b.status === "canceled") return false;
      
      // Weekly recurring fixed match: only matches if day_of_week matches current day of week!
      if (b.booking_type === "fixed") {
        if (b.day_of_week !== undefined && b.day_of_week !== null) {
          return Number(b.day_of_week) === currentDayOfWeek;
        }
        return true;
      }

      // Casual match: matches exact date
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
      const res = await fetch("https://padel-saas-backend-production-a91f.up.railway.app/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: targetClubId,
          court_id: selectedSlot.courtId,
          player_name: bookingFormData.isBlocked ? "Horario Bloqueado" : bookingFormData.playerName,
          player_phone: bookingFormData.isBlocked ? "-" : bookingFormData.playerPhone,
          date_str: currentDateIso,
          day_of_week: currentDayOfWeek,
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
      const res = await fetch(`https://padel-saas-backend-production-a91f.up.railway.app/api/reservations/${bookingId}`, {
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
    if (b.booking_type === "fixed") {
      return Number(b.day_of_week) === currentDayOfWeek;
    }
    if (b.date_str === currentDateIso || b.date_str === readableDate) return true;
    if (currentDateIso === "2026-09-09" && (b.date_str === "Hoy, 9 de Septiembre" || b.date_str === "Hoy")) return true;
    return false;
  });

  const activeTimeSlots = ALL_90MIN_SLOTS.filter((ts) =>
    isSlotWithinClubHours(ts, clubSettings.open_time || "11:00", clubSettings.close_time || "01:00")
  );

  const totalSlotsCount = (courts.length || 1) * (activeTimeSlots.length || 1);
  const occupiedSlotsCount = activeDayBookings.filter((b) => b.status !== "blocked").length;
  const occupationRate = Math.round((occupiedSlotsCount / totalSlotsCount) * 100) || 0;
  const totalIncomeSelectedDay = activeDayBookings.reduce((sum, b) => sum + (Number(b.deposit_paid) || 0), 0);

  return (
    <div className="min-h-screen bg-[#06100E] text-[#F1F5F3] font-sans">
      <header className="border-b border-[#16272a] bg-[#0C1517]/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#00D084]/10 border border-[#00D084]/30 flex items-center justify-center text-[#00D084] shadow-lg shadow-[#00D084]/10">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-[#F1F5F3]">{clubSettings.name}</h1>
                <span className="text-xs bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/30 px-2 py-0.5 rounded-full font-semibold">
                  Panel Dueño ({user?.displayName || "Administrador"})
                </span>
              </div>
              <p className="text-xs text-[#8A9B95]">{courts.length} {courts.length === 1 ? "cancha habilitada" : "canchas habilitadas"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#06100E] border border-[#16272a] p-1 rounded-xl">
              <button
                onClick={() => setActiveTab("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "grid" ? "bg-[#00D084] text-[#06100E] font-bold shadow" : "text-[#8A9B95] hover:text-[#F1F5F3]"
                }`}
              >
                Grilla de Turnos
              </button>
              <button
                onClick={() => setActiveTab("courts")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "courts" ? "bg-[#00D084] text-[#06100E] font-bold shadow" : "text-[#8A9B95] hover:text-[#F1F5F3]"
                }`}
              >
                Mis Canchas ({courts.length})
              </button>
              <button
                onClick={() => setActiveTab("pricing")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === "pricing" ? "bg-[#00D084] text-[#06100E] font-bold shadow" : "text-[#8A9B95] hover:text-[#F1F5F3]"
                }`}
              >
                Ajustes & MercadoPago
              </button>
            </div>
            <a
              href="/login"
              onClick={() => localStorage.removeItem("padel_user")}
              className="p-2 rounded-xl bg-[#0C1517] border border-[#16272a] text-[#8A9B95] hover:text-[#F1F5F3] transition text-xs flex items-center gap-1"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Banner: Tu Link Público para Jugadores */}
        <div className="bg-gradient-to-r from-[#00D084]/15 via-[#0C1517] to-[#06100E] border border-[#00D084]/30 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-left w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/30 px-2 py-0.5 rounded font-bold">
                Link Público de Reservas
              </span>
              <span className="text-xs text-[#8A9B95]">Pegalo en Instagram o WhatsApp</span>
            </div>
            <div className="text-xs font-mono text-[#00D084] break-all">{publicUrl}</div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 bg-[#00D084] hover:bg-[#4ADE80] text-[#06100E] font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-md shadow-[#00D084]/20"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{copiedLink ? "¡Copiado!" : "Copiar Link"}</span>
            </button>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-[#0C1517] hover:bg-[#16272a] text-[#F1F5F3] border border-[#16272a] px-3.5 py-2 rounded-xl text-xs font-semibold transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Probar</span>
            </a>
          </div>
        </div>

        {activeTab === "grid" && (
          <div className="space-y-4">
            {/* Navegador del Calendario */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0C1517] border border-[#16272a] p-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePrevDay}
                  className="p-2 rounded-xl bg-[#06100E] border border-[#16272a] hover:border-[#00D084]/40 text-[#8A9B95] hover:text-[#F1F5F3] transition"
                  title="Día anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div
                  onClick={() => dateInputRef.current?.showPicker()}
                  className="flex-1 sm:flex-initial flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#06100E] border border-[#16272a] hover:border-[#00D084]/50 cursor-pointer transition shadow-inner group"
                >
                  <CalendarDays className="h-4 w-4 text-[#00D084] group-hover:scale-110 transition" />
                  <span className="text-sm font-bold text-[#F1F5F3]">{readableDate}</span>
                  <span className="text-[10px] text-[#00D084] bg-[#00D084]/10 border border-[#00D084]/20 px-2 py-0.5 rounded-md font-medium ml-1">
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
                  className="p-2 rounded-xl bg-[#06100E] border border-[#16272a] hover:border-[#00D084]/40 text-[#8A9B95] hover:text-[#F1F5F3] transition"
                  title="Día siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={handleToday}
                  className="px-3 py-2 rounded-xl bg-[#0C1517] hover:bg-[#16272a] border border-[#16272a] text-xs font-semibold text-[#8A9B95] hover:text-[#F1F5F3] transition"
                >
                  Hoy
                </button>
              </div>

              <div className="text-xs text-[#8A9B95]">
                Los turnos fijos se repiten semanalmente cada <span className="font-bold text-[#F1F5F3]">{currentDayName}</span>
              </div>
            </div>

            <div className="bg-[#0C1517] border border-[#16272a] rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#06100E] text-[#8A9B95] text-xs border-b border-[#16272a]">
                      <th className="p-4 w-36 font-semibold border-r border-[#16272a]">Horario</th>
                      {courts.map((court) => (
                        <th key={court.id} className="p-4 font-semibold border-r border-[#16272a] min-w-[220px]">
                          <div className="text-[#F1F5F3] text-sm">{court.name}</div>
                          <div className="text-[11px] text-[#8A9B95] font-normal">{court.surface}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#16272a] text-xs">
                    {ALL_90MIN_SLOTS.filter((ts) =>
                      isSlotWithinClubHours(ts, clubSettings.open_time || "11:00", clubSettings.close_time || "01:00")
                    ).map((slot) => {
                      const isNightSlot = slot >= clubSettings.light_start_time;
                      const defaultSlotPrice = isNightSlot ? clubSettings.price_night : clubSettings.price_day;

                      return (
                        <tr key={slot} className="hover:bg-[#16272a]/30 transition">
                          <td className="p-4 font-semibold text-[#F1F5F3] border-r border-[#16272a] bg-[#06100E]/40 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-[#8A9B95]" /> {slot}
                            </div>
                            {isNightSlot ? (
                              <span className="text-[10px] text-amber-400 flex items-center gap-0.5 font-bold" title="Tarifa con luz">💡 Luz</span>
                            ) : (
                              <span className="text-[10px] text-[#00D084] flex items-center gap-0.5 font-bold" title="Tarifa sin luz">☀️ Día</span>
                            )}
                          </td>
                          {courts.map((court) => {
                            const booking = getBookingForSlot(court.id, slot);
                            const slotPrice = booking ? (Number(booking.price) || defaultSlotPrice) : defaultSlotPrice;
                            const depositNum = booking ? (Number(booking.deposit_paid) || 0) : 0;
                            const remainingBalance = Math.max(0, slotPrice - depositNum);

                            return (
                              <td key={court.id} className="p-2 border-r border-[#16272a]">
                                {booking ? (
                                  <button
                                    onClick={() => handleOpenSlot(court.id, slot)}
                                    className={`w-full text-left p-3 rounded-xl border transition ${
                                      booking.status === "blocked"
                                        ? "bg-red-500/10 border-red-500/30 text-red-300 hover:border-red-500/50"
                                        : "bg-[#00D084]/10 border-[#00D084]/30 text-[#00D084] hover:border-[#00D084]/50"
                                    }`}
                                  >
                                    <div className="font-semibold flex items-center justify-between">
                                      <span className="truncate text-[#F1F5F3]">{booking.player_name}</span>
                                      {booking.booking_type === "fixed" && (
                                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/40 px-1.5 py-0.2 rounded font-bold ml-1 flex-shrink-0" title={`Turno Fijo Semanal (${currentDayName})`}>
                                          <Repeat className="h-2.5 w-2.5" /> Fijo {currentDayName.substring(0, 3)}
                                        </span>
                                      )}
                                      {booking.status === "blocked" && <Lock className="h-3 w-3 text-red-400 ml-1 flex-shrink-0" />}
                                    </div>

                                    {booking.status !== "blocked" && (
                                      <div className="text-[11px] mt-1 space-y-0.5">
                                        <div className="flex justify-between items-center text-[#8A9B95]">
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
                                    className="w-full text-center py-4 rounded-xl border border-dashed border-[#16272a] hover:border-[#00D084]/50 hover:bg-[#00D084]/5 text-[#8A9B95] hover:text-[#00D084] transition text-xs font-medium"
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
          <div className="space-y-6 max-w-4xl">
            {saveMsg && (
              <div className="p-3.5 rounded-xl bg-[#00D084]/10 border border-[#00D084]/30 text-[#00D084] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>{saveMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Sección 1: Información del Complejo & WhatsApp */}
              <div className="bg-[#0C1517] border border-[#16272a] rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-[#00D084]" />
                  <div>
                    <h2 className="text-base font-bold text-[#F1F5F3]">WhatsApp & Contacto Oficial</h2>
                    <p className="text-xs text-[#8A9B95]">Configurá el número al que te escribirán los jugadores y responderá el Bot IA</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs text-[#8A9B95] font-medium">Número de WhatsApp (con código de país y área)</label>
                    <input
                      type="text"
                      placeholder="+54 9 343 456-7890"
                      value={clubSettings.phone}
                      onChange={(e) => setClubSettings({ ...clubSettings, phone: e.target.value })}
                      className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8A9B95] font-medium">Ciudad / Ubicación</label>
                    <input
                      type="text"
                      placeholder="Ej: Colón, Entre Ríos"
                      value={clubSettings.city}
                      onChange={(e) => setClubSettings({ ...clubSettings, city: e.target.value })}
                      className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[#8A9B95] font-medium">Mensaje de bienvenida para WhatsApp</label>
                  <input
                    type="text"
                    placeholder="¡Hola! Te damos la bienvenida a nuestro complejo. ¿En qué podemos ayudarte?"
                    value={clubSettings.custom_whatsapp_msg || ""}
                    onChange={(e) => setClubSettings({ ...clubSettings, custom_whatsapp_msg: e.target.value })}
                    className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                  />
                </div>
              </div>

              {/* Sección 2: Tarifas & Horarios */}
              <div className="bg-[#0C1517] border border-[#16272a] rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-amber-400" />
                  <div>
                    <h2 className="text-base font-bold text-[#F1F5F3]">Tarifas, Iluminación & Horarios</h2>
                    <p className="text-xs text-[#8A9B95]">Precios por turno de 90 minutos y horario de luz</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs text-[#8A9B95] font-medium flex items-center gap-1.5">
                      <Sun className="h-3.5 w-3.5 text-amber-400" /> Precio Turno Sin Luz (Diurno)
                    </label>
                    <input
                      type="number"
                      value={clubSettings.price_day}
                      onChange={(e) => setClubSettings({ ...clubSettings, price_day: Number(e.target.value) })}
                      className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8A9B95] font-medium flex items-center gap-1.5">
                      <Moon className="h-3.5 w-3.5 text-[#00D084]" /> Precio Turno Con Luz (Nocturno)
                    </label>
                    <input
                      type="number"
                      value={clubSettings.price_night}
                      onChange={(e) => setClubSettings({ ...clubSettings, price_night: Number(e.target.value) })}
                      className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[#8A9B95] font-medium">Hora de inicio de luz artificial</label>
                    <input
                      type="text"
                      placeholder="18:30"
                      value={clubSettings.light_start_time}
                      onChange={(e) => setClubSettings({ ...clubSettings, light_start_time: e.target.value })}
                      className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8A9B95] font-medium">Monto de Seña para Jugadores Online ($)</label>
                    <input
                      type="number"
                      value={clubSettings.deposit_amount}
                      onChange={(e) => setClubSettings({ ...clubSettings, deposit_amount: Number(e.target.value) })}
                      className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[#8A9B95] font-medium">Horario de Apertura</label>
                    <select
                      value={clubSettings.open_time || "11:00"}
                      onChange={(e) => setClubSettings({ ...clubSettings, open_time: e.target.value })}
                      className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3] outline-none cursor-pointer"
                    >
                      {["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((t) => (
                        <option key={t} value={t} className="bg-[#0C1517] text-[#F1F5F3]">{t} hs</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-[#8A9B95]">Primer horario disponible para turnos</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8A9B95] font-medium">Horario de Cierre</label>
                    <select
                      value={clubSettings.close_time || "01:00"}
                      onChange={(e) => setClubSettings({ ...clubSettings, close_time: e.target.value })}
                      className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3] outline-none cursor-pointer"
                    >
                      {["21:30", "22:00", "23:00", "23:30", "00:00", "00:30", "01:00", "01:30", "02:00", "02:30", "03:00"].map((t) => (
                        <option key={t} value={t} className="bg-[#0C1517] text-[#F1F5F3]">{t} hs</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-[#8A9B95]">Hora límite de finalización</p>
                  </div>
                </div>
              </div>

              {/* Sección 3: Cuenta de MercadoPago Propia */}
              <div className="bg-[#0C1517] border border-[#16272a] rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#00D084]" />
                  <div>
                    <h2 className="text-base font-bold text-[#F1F5F3]">Cobros con MercadoPago</h2>
                    <p className="text-xs text-[#8A9B95]">Pegá tus credenciales de MercadoPago para que las señas vayan directo a tu cuenta bancaria</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs text-[#8A9B95] font-medium flex items-center gap-1">
                      <Key className="h-3 w-3 text-amber-400" /> Access Token de MercadoPago (Producción)
                    </label>
                    <input
                      type="password"
                      placeholder="APP_USR-..."
                      value={clubSettings.mp_access_token || ""}
                      onChange={(e) => setClubSettings({ ...clubSettings, mp_access_token: e.target.value })}
                      className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3] font-mono"
                    />
                    <p className="text-[10px] text-[#8A9B95]">Obtenelo en mercadopago.com.ar/developers/panel</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#00D084] hover:bg-[#4ADE80] text-[#06100E] font-extrabold px-8 py-3 rounded-xl text-xs transition shadow-lg shadow-[#00D084]/20"
                >
                  Guardar Todos los Ajustes
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "courts" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#F1F5F3]">Canchas del Complejo</h2>
                <p className="text-xs text-[#8A9B95]">Tenés {courts.length} canchas activas asignadas a tu complejo.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#8A9B95] bg-[#0C1517] border border-[#16272a] px-3.5 py-2 rounded-xl">
                <ShieldCheck className="h-4 w-4 text-[#00D084]" />
                <span>Gestión de altas administrada por el Sistema</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courts.map((court) => (
                <div key={court.id} className="bg-[#0C1517] border border-[#16272a] p-5 rounded-2xl space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-[#F1F5F3] text-base">{court.name}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-[#00D084]/10 border border-[#00D084]/30 text-[#00D084] font-medium">Activa</span>
                  </div>
                  <p className="text-xs text-[#8A9B95]">{court.surface} • {court.indoor ? "Techada" : "Descubierta"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal: Crear Reserva Manual (Casual o Fijo Semanal) */}
      {isModalOpen && selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C1517] border border-[#16272a] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#16272a] pb-3">
              <h3 className="font-bold text-[#F1F5F3] text-base">Cargar Reserva Manual</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8A9B95] hover:text-[#F1F5F3]">✕</button>
            </div>
            <form onSubmit={handleSaveBooking} className="space-y-3">
              <div className="p-3 bg-[#06100E] border border-[#16272a] rounded-xl text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[#8A9B95]">Fecha seleccionada:</span>
                  <span className="text-[#F1F5F3] font-semibold">{readableDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8A9B95]">Horario:</span>
                  <span className="text-[#F1F5F3] font-bold">{selectedSlot.timeSlot}</span>
                </div>
              </div>

              {/* Selector de Tipo de Turno: Casual vs Fijo Semanal */}
              <div className="space-y-1.5">
                <label className="text-xs text-[#8A9B95] font-medium">Modalidad del Turno</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingFormData({ ...bookingFormData, bookingType: "casual" })}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                      bookingFormData.bookingType === "casual"
                        ? "bg-[#00D084]/20 border-[#00D084] text-[#F1F5F3]"
                        : "bg-[#06100E] border-[#16272a] text-[#8A9B95] hover:border-[#00D084]/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Zap className="h-3.5 w-3.5 text-[#00D084]" />
                      <span>Turno Casual</span>
                    </div>
                    <span className="text-[10px] text-[#8A9B95]">Solo {currentDayName} {currD}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingFormData({ ...bookingFormData, bookingType: "fixed" })}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-0.5 ${
                      bookingFormData.bookingType === "fixed"
                        ? "bg-[#4ADE80]/20 border-[#4ADE80] text-[#F1F5F3]"
                        : "bg-[#06100E] border-[#16272a] text-[#8A9B95] hover:border-[#00D084]/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <Repeat className="h-3.5 w-3.5 text-[#4ADE80]" />
                      <span>Fijo Semanal</span>
                    </div>
                    <span className="text-[10px] text-[#8A9B95]">Todos los {currentDayName}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-[#06100E] border border-[#16272a] rounded-xl">
                <input
                  type="checkbox"
                  id="isBlocked"
                  checked={bookingFormData.isBlocked}
                  onChange={(e) => setBookingFormData({ ...bookingFormData, isBlocked: e.target.checked })}
                  className="rounded text-[#00D084] focus:ring-0 accent-[#00D084]"
                />
                <label htmlFor="isBlocked" className="text-xs text-[#F1F5F3] font-medium cursor-pointer">
                  Bloquear este horario (Mantenimiento / Fijo sin jugador)
                </label>
              </div>

              {!bookingFormData.isBlocked && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs text-[#8A9B95] font-medium">Nombre del Jugador</label>
                    <input
                      required
                      type="text"
                      placeholder="Ej: Pedro González"
                      value={bookingFormData.playerName}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, playerName: e.target.value })}
                      className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[#8A9B95] font-medium">WhatsApp del Jugador (Opcional)</label>
                    <input
                      type="text"
                      placeholder="+54 9 343 ..."
                      value={bookingFormData.playerPhone}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, playerPhone: e.target.value })}
                      className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-[#8A9B95] font-medium">Precio Total ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={bookingFormData.price}
                        onChange={(e) => setBookingFormData({ ...bookingFormData, price: Number(e.target.value) })}
                        className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs text-[#8A9B95] font-medium">Seña ($)</label>
                        <button
                          type="button"
                          onClick={() => setBookingFormData({ ...bookingFormData, depositPaid: 0 })}
                          className="text-[10px] text-[#00D084] hover:underline"
                        >
                          $0
                        </button>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={bookingFormData.depositPaid}
                        onChange={(e) => setBookingFormData({ ...bookingFormData, depositPaid: Number(e.target.value) })}
                        className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                      />
                    </div>
                  </div>

                  {/* Diferencia calculada en vivo */}
                  <div className="p-2.5 rounded-xl bg-[#06100E] border border-[#16272a] text-xs flex justify-between items-center">
                    <span className="text-[#8A9B95]">Resta cobrar en el club:</span>
                    <span className="font-bold text-amber-400 text-sm">
                      ${Math.max(0, bookingFormData.price - bookingFormData.depositPaid).toLocaleString()}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#16272a]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs text-[#8A9B95] hover:text-[#F1F5F3]">Cancelar</button>
                <button type="submit" className="bg-[#00D084] hover:bg-[#4ADE80] text-[#06100E] font-extrabold px-4 py-2 rounded-xl text-xs">Guardar Reserva</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalles de Reserva & Liberar Pista */}
      {activeBookingDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C1517] border border-[#16272a] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#16272a] pb-3">
              <h3 className="font-bold text-[#F1F5F3] text-base">Detalle del Turno</h3>
              <button onClick={() => setActiveBookingDetails(null)} className="text-[#8A9B95] hover:text-[#F1F5F3]">✕</button>
            </div>

            <div className="bg-[#06100E] border border-[#16272a] rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#8A9B95]">Modalidad:</span>
                {activeBookingDetails.booking_type === "fixed" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/40 px-2 py-0.5 rounded-md font-bold">
                    <Repeat className="h-3 w-3" /> Fijo Semanal ({activeBookingDetails.day_of_week !== undefined && activeBookingDetails.day_of_week !== null ? DAYS[activeBookingDetails.day_of_week] : currentDayName})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/40 px-2 py-0.5 rounded-md font-bold">
                    <Zap className="h-3 w-3" /> Turno Casual
                  </span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-[#8A9B95]">Jugador / Titular:</span>
                <span className="text-[#F1F5F3] font-bold">{activeBookingDetails.player_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A9B95]">Horario:</span>
                <span className="text-[#F1F5F3] font-semibold">{activeBookingDetails.time_slot}</span>
              </div>
              {activeBookingDetails.player_phone && activeBookingDetails.player_phone !== "-" && (
                <div className="flex justify-between items-center">
                  <span className="text-[#8A9B95]">WhatsApp:</span>
                  <a
                    href={`https://wa.me/${activeBookingDetails.player_phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#00D084] font-semibold hover:underline"
                  >
                    <MessageCircle className="h-3 w-3" /> {activeBookingDetails.player_phone}
                  </a>
                </div>
              )}
              <div className="flex justify-between border-t border-[#16272a] pt-2">
                <span className="text-[#8A9B95]">Precio Total:</span>
                <span className="font-semibold text-[#F1F5F3]">${(Number(activeBookingDetails.price) || 14000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8A9B95]">Seña Abonada:</span>
                <span className="font-semibold text-[#00D084]">${(Number(activeBookingDetails.deposit_paid) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-[#16272a] pt-2">
                <span className="text-[#8A9B95] font-medium">Resta Cobrar (Debe):</span>
                <span className="font-bold text-amber-400 text-sm">
                  ${Math.max(0, (Number(activeBookingDetails.price) || 14000) - (Number(activeBookingDetails.deposit_paid) || 0)).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#16272a] flex justify-between gap-2">
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
                className="px-4 py-2 rounded-xl text-xs text-[#8A9B95] hover:text-[#F1F5F3] bg-[#06100E] border border-[#16272a] font-medium"
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
