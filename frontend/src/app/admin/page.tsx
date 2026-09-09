"use client";

import React, { useState } from "react";
import {
  Building2,
  Trophy,
  Users,
  Bot,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Settings,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface Club {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  city: string;
  activeCourts: number;
  maxCourts: number;
  plan: "Starter" | "Pro" | "Enterprise";
  status: "active" | "suspended" | "pending";
  aiBotEnabled: boolean;
  totalBookingsMonth: number;
  monthlyRevenue: number;
  createdAt: string;
}

const INITIAL_CLUBS: Club[] = [
  {
    id: "club-1",
    name: "La Toska Pádel",
    slug: "latoska-er",
    ownerName: "Esteban Rossi",
    ownerEmail: "esteban@latoska.com.ar",
    phone: "+54 9 343 555-1234",
    city: "Paraná, Entre Ríos",
    activeCourts: 4,
    maxCourts: 4,
    plan: "Pro",
    status: "active",
    aiBotEnabled: true,
    totalBookingsMonth: 680,
    monthlyRevenue: 2720000,
    createdAt: "2026-01-15",
  },
  {
    id: "club-2",
    name: "Smash Padel Club",
    slug: "smash-padel",
    ownerName: "Lucía Fernández",
    ownerEmail: "lucia@smashpadel.com",
    phone: "+54 9 341 444-5678",
    city: "Rosario, Santa Fe",
    activeCourts: 6,
    maxCourts: 8,
    plan: "Enterprise",
    status: "active",
    aiBotEnabled: true,
    totalBookingsMonth: 940,
    monthlyRevenue: 3760000,
    createdAt: "2026-02-01",
  },
  {
    id: "club-3",
    name: "Set Point Padel",
    slug: "setpoint",
    ownerName: "Gonzalo Peralta",
    ownerEmail: "gonzalo@setpoint.com",
    phone: "+54 9 11 6543-9876",
    city: "Palermo, Buenos Aires",
    activeCourts: 2,
    maxCourts: 2,
    plan: "Starter",
    status: "pending",
    aiBotEnabled: false,
    totalBookingsMonth: 120,
    monthlyRevenue: 480000,
    createdAt: "2026-03-02",
  },
];

export default function SuperAdminPage() {
  const [clubs, setClubs] = useState<Club[]>(INITIAL_CLUBS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClubForEdit, setSelectedClubForEdit] = useState<Club | null>(null);

  // Form state for creating club
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    ownerName: "",
    ownerEmail: "",
    phone: "",
    city: "",
    maxCourts: 4,
    plan: "Pro" as "Starter" | "Pro" | "Enterprise",
    aiBotEnabled: true,
  });

  const totalCourtsAllowed = clubs.reduce((acc, c) => acc + c.maxCourts, 0);
  const totalActiveClubs = clubs.filter((c) => c.status === "active").length;
  const totalBookings = clubs.reduce((acc, c) => acc + c.totalBookingsMonth, 0);
  const totalAiActive = clubs.filter((c) => c.aiBotEnabled).length;

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || club.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    const newClub: Club = {
      id: `club-${Date.now()}`,
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
      ownerName: formData.ownerName,
      ownerEmail: formData.ownerEmail,
      phone: formData.phone,
      city: formData.city,
      activeCourts: 0,
      maxCourts: Number(formData.maxCourts),
      plan: formData.plan,
      status: "active",
      aiBotEnabled: formData.aiBotEnabled,
      totalBookingsMonth: 0,
      monthlyRevenue: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setClubs([newClub, ...clubs]);
    setIsCreateModalOpen(false);
    setFormData({
      name: "",
      slug: "",
      ownerName: "",
      ownerEmail: "",
      phone: "",
      city: "",
      maxCourts: 4,
      plan: "Pro",
      aiBotEnabled: true,
    });
  };

  const handleUpdateCourts = (clubId: string, newMax: number) => {
    setClubs(
      clubs.map((c) => (c.id === clubId ? { ...c, maxCourts: Math.max(1, newMax) } : c))
    );
    setSelectedClubForEdit(null);
  };

  const toggleStatus = (clubId: string) => {
    setClubs(
      clubs.map((c) =>
        c.id === clubId
          ? {
              ...c,
              status: c.status === "active" ? "suspended" : "active",
            }
          : c
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header / Topbar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-white">PadelSaaS Core</h1>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">Control maestro de complejos y cuotas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300">Motor IA WhatsApp: Online</span>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4" />
              Nuevo Complejo
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Metric Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">Complejos Activos</p>
                <h3 className="text-3xl font-bold mt-1 text-white">{totalActiveClubs}</h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3" /> 100% operatividad
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">Canchas Autorizadas</p>
                <h3 className="text-3xl font-bold mt-1 text-white">{totalCourtsAllowed}</h3>
                <p className="text-xs text-slate-400 mt-2">Límite global asignado</p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">Turnos este Mes</p>
                <h3 className="text-3xl font-bold mt-1 text-white">{totalBookings.toLocaleString()}</h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                  <Activity className="h-3 w-3" /> +18.4% vs mes ant.
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
                <Zap className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400">IA Bots en WhatsApp</p>
                <h3 className="text-3xl font-bold mt-1 text-white">{totalAiActive}</h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                  <Bot className="h-3 w-3" /> Respuestas inmediatas
                </p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                <Bot className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* Complexes Table & Management */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Complejos de Pádel Registrados</h2>
              <p className="text-xs text-slate-400">
                Administrá las licencias, cuota de pistas y estado de cada club.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por club, ciudad, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="suspended">Suspendidos</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Complejo / Club</th>
                  <th className="px-4 py-3">Dueño & Contacto</th>
                  <th className="px-4 py-3">Cupo Canchas (Max)</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">IA WhatsApp</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredClubs.map((club) => (
                  <tr key={club.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                        {club.name}
                        <a
                          href={`/clubs/${club.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-emerald-400 transition"
                          title="Ver web pública del club"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="text-slate-400 flex items-center gap-1 text-[11px] mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-500" /> {club.city}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-slate-200 font-medium">{club.ownerName}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-slate-500" /> {club.ownerEmail}
                      </div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3 text-slate-500" /> {club.phone}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {club.activeCourts} / {club.maxCourts}
                        </span>
                        <button
                          onClick={() => setSelectedClubForEdit(club)}
                          className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-700 transition"
                        >
                          Modificar cupo
                        </button>
                      </div>
                      <div className="w-24 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              (club.activeCourts / club.maxCourts) * 100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-semibold border ${
                          club.plan === "Enterprise"
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                            : club.plan === "Pro"
                            ? "bg-blue-500/10 text-blue-300 border-blue-500/30"
                            : "bg-slate-800 text-slate-300 border-slate-700"
                        }`}
                      >
                        {club.plan}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      {club.aiBotEnabled ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md font-medium">
                          <Bot className="h-3.5 w-3.5" /> Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 text-xs bg-slate-800/60 border border-slate-700 px-2 py-1 rounded-md">
                          Inactivo
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {club.status === "active" && (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Habilitado
                        </span>
                      )}
                      {club.status === "suspended" && (
                        <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                          <XCircle className="h-3.5 w-3.5" /> Suspendido
                        </span>
                      )}
                      {club.status === "pending" && (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                          <Clock className="h-3.5 w-3.5" /> Pendiente
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(club.id)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                            club.status === "active"
                              ? "bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20"
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20"
                          }`}
                        >
                          {club.status === "active" ? "Suspender" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* MODAL: Create New Club */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Habilitar Nuevo Complejo</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Nombre del Complejo</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: Pádel Point"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Ciudad / Provincia</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: Paraná, Entre Ríos"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Nombre del Propietario</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Email de acceso</label>
                  <input
                    required
                    type="email"
                    placeholder="juan@padelpoint.com"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Teléfono (WhatsApp)</label>
                  <input
                    required
                    type="text"
                    placeholder="+54 9 343 ..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Cupo de Canchas Permitidas</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxCourts}
                    onChange={(e) =>
                      setFormData({ ...formData, maxCourts: Number(e.target.value) })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e: any) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Starter">Starter (Hasta 2 canchas)</option>
                    <option value="Pro">Pro (Hasta 6 canchas)</option>
                    <option value="Enterprise">Enterprise (Ilimitadas)</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="aiBot"
                    checked={formData.aiBotEnabled}
                    onChange={(e) =>
                      setFormData({ ...formData, aiBotEnabled: e.target.checked })
                    }
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <label htmlFor="aiBot" className="text-xs text-slate-300 cursor-pointer">
                    Habilitar IA WhatsApp
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
                >
                  Dar de Alta Complejo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Modify Max Courts */}
      {selectedClubForEdit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">
              Modificar cupo para {selectedClubForEdit.name}
            </h3>
            <p className="text-xs text-slate-400">
              Establecé la cantidad máxima de pistas que este complejo puede crear en su panel.
            </p>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Cantidad máxima de canchas</label>
              <input
                type="number"
                min="1"
                max="50"
                defaultValue={selectedClubForEdit.maxCourts}
                id="editCourtInput"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setSelectedClubForEdit(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById("editCourtInput") as HTMLInputElement;
                  if (input) {
                    handleUpdateCourts(selectedClubForEdit.id, Number(input.value));
                  }
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Guardar Cupo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
