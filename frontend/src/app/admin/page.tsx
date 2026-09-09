"use client";

import React, { useState, useEffect } from "react";
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
  ShieldCheck,
  Zap,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Key,
  LogOut,
} from "lucide-react";

interface Club {
  id: string;
  name: string;
  slug: string;
  owner_name: string;
  owner_email: string;
  phone: string;
  city: string;
  max_courts: number;
  plan: string;
  status: string;
  ai_bot_enabled: boolean;
}

export default function SuperAdminPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [formData, setFormData] = useState({
    clubName: "",
    ownerName: "",
    ownerEmail: "",
    password: "",
    phone: "",
    city: "",
    maxCourts: 4,
    plan: "Pro",
  });

  const loadClubs = async () => {
    try {
      const res = await fetch("https://padel-saas-backend-production.up.railway.app/api/clubs");
      if (res.ok) {
        const data = await res.json();
        setClubs(data);
      }
    } catch (e) {
      console.warn("Failed to load clubs from API");
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("https://padel-saas-backend-production.up.railway.app/api/auth/register-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Error al crear complejo");
      }

      setMsg(`¡Complejo "${formData.clubName}" y usuario creados con éxito!`);
      setIsCreateModalOpen(false);
      setFormData({
        clubName: "",
        ownerName: "",
        ownerEmail: "",
        password: "",
        phone: "",
        city: "",
        maxCourts: 4,
        plan: "Pro",
      });
      loadClubs();
    } catch (err: any) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredClubs = clubs.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.city || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.owner_email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCourtsAllowed = clubs.reduce((acc, c) => acc + (c.max_courts || 4), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
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
                  Super Admin (PostgreSQL)
                </span>
              </div>
              <p className="text-xs text-slate-400">Control maestro de complejos y credenciales</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4" />
              Nuevo Complejo & Dueño
            </button>
            <a
              href="/login"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition text-xs flex items-center gap-1"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {msg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            {msg}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-medium text-slate-400">Complejos en PostgreSQL</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{clubs.length}</h3>
            <p className="text-xs text-emerald-400 mt-2">Guardados en base de datos real</p>
          </div>
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-medium text-slate-400">Cupo Canchas Autorizadas</p>
            <h3 className="text-3xl font-bold mt-1 text-white">{totalCourtsAllowed}</h3>
            <p className="text-xs text-slate-400 mt-2">Límite global asignado</p>
          </div>
          <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
            <p className="text-xs font-medium text-slate-400">Motor IA WhatsApp</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-bold text-white">Online 24/7 (OpenAI)</span>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-base font-bold text-white">Complejos de Pádel Registrados</h2>
            <div className="relative w-64">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar club, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Complejo</th>
                  <th className="px-4 py-3">Dueño & Login Email</th>
                  <th className="px-4 py-3">Cupo Canchas</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">IA WhatsApp</th>
                  <th className="px-4 py-3 text-right">Web Pública</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredClubs.map((club) => (
                  <tr key={club.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-white text-sm">{club.name}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-500" /> {club.city || "Argentina"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-slate-200 font-medium">{club.owner_name}</div>
                      <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-slate-500" /> {club.owner_email}
                      </div>
                    </td>
                    <td className="px-4 py-4 font-bold text-white">
                      {club.max_courts || 4} pistas
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] border border-blue-500/30">
                        {club.plan || "Pro"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-emerald-400 flex items-center gap-1 text-xs">
                        <Bot className="h-3.5 w-3.5" /> Activo
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <a
                        href={`/clubs/${club.slug || "latoska-er"}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:underline"
                      >
                        Ver Link <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Crear Complejo & Usuario Administrador</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Nombre del Complejo</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: Smash Pádel"
                    value={formData.clubName}
                    onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Ciudad</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: Rosario, Santa Fe"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Nombre de tu Amigo (Dueño)</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Email de Login para tu Amigo</label>
                  <input
                    required
                    type="email"
                    placeholder="juan@smashpadel.com"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Contraseña Inicial para tu Amigo</label>
                  <input
                    required
                    type="text"
                    placeholder="password123"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Cupo Máximo de Canchas</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxCourts}
                    onChange={(e) => setFormData({ ...formData, maxCourts: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
                >
                  {loading ? "Creando en PostgreSQL..." : "Crear Club & Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
