"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Trophy,
  Bot,
  Plus,
  Search,
  CheckCircle2,
  Mail,
  MapPin,
  ExternalLink,
  LogOut,
  Layers,
  Power,
  DollarSign,
  AlertCircle,
  Clock,
  Trash2,
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
  payment_status?: string;
  last_payment_date?: string;
  monthly_fee?: number;
  ai_bot_enabled: boolean;
}

export default function SuperAdminPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const [isAddCourtModalOpen, setIsAddCourtModalOpen] = useState(false);
  const [selectedClubForCourt, setSelectedClubForCourt] = useState<Club | null>(null);
  const [newCourtData, setNewCourtData] = useState({
    name: "",
    surface: "Cristal Panorámico",
    indoor: true,
  });

  const [formData, setFormData] = useState({
    name: "",
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

  const handleToggleStatus = async (club: Club) => {
    const newStatus = club.status === "inactive" ? "active" : "inactive";
    try {
      const res = await fetch(`https://padel-saas-backend-production.up.railway.app/api/clubs/${club.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setMsg(
          newStatus === "active"
            ? `¡Complejo "${club.name}" reactivado con éxito!`
            : `Complejo "${club.name}" deshabilitado. Se dio de baja el acceso al mail asociado.`
        );
        loadClubs();
      } else {
        alert("Error al actualizar el estado del complejo");
      }
    } catch (err) {
      alert("Error de conexión al cambiar estado");
    }
  };

  const handleTogglePayment = async (club: Club) => {
    const isPaid = club.payment_status === "paid" || !club.payment_status;
    const newPaymentStatus = isPaid ? "pending" : "paid";
    const todayStr = new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    try {
      const res = await fetch(`https://padel-saas-backend-production.up.railway.app/api/clubs/${club.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_status: newPaymentStatus,
          last_payment_date: newPaymentStatus === "paid" ? todayStr : club.last_payment_date || null,
        }),
      });

      if (res.ok) {
        setMsg(
          newPaymentStatus === "paid"
            ? `¡Pago mensual registrado para "${club.name}"! Estado: Al Día.`
            : `Complejo "${club.name}" marcado con pago mensual pendiente.`
        );
        loadClubs();
      } else {
        alert("Error al actualizar estado de pago");
      }
    } catch (err) {
      alert("Error de conexión al registrar pago");
    }
  };

  const handleDeleteClub = async (club: Club) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseás ELIMINAR PERMANENTEMENTE el complejo "${club.name}"?\nEsta acción borrará todas sus canchas, reservas y accesos asociados.`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`https://padel-saas-backend-production.up.railway.app/api/clubs/${club.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMsg(`¡Complejo "${club.name}" eliminado correctamente!`);
        loadClubs();
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar complejo");
      }
    } catch (err) {
      alert("Error de conexión al eliminar complejo");
    }
  };

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("https://padel-saas-backend-production.up.railway.app/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          owner_name: formData.ownerName,
          owner_email: formData.ownerEmail,
          password: formData.password,
          phone: formData.phone,
          city: formData.city,
          max_courts: formData.maxCourts,
          plan: formData.plan,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Error al crear complejo");
      }

      setMsg(`¡Complejo "${formData.name}" creado con éxito! Se enviaron las credenciales a ${formData.ownerEmail}.`);
      setIsCreateModalOpen(false);
      setFormData({
        name: "",
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

  const handleAddCourtToClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClubForCourt) return;

    try {
      const res = await fetch("https://padel-saas-backend-production.up.railway.app/api/courts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: selectedClubForCourt.id,
          name: newCourtData.name,
          surface: newCourtData.surface,
          indoor: newCourtData.indoor,
        }),
      });

      if (res.ok) {
        setMsg(`¡Cancha "${newCourtData.name}" agregada exitosamente a ${selectedClubForCourt.name}!`);
        setIsAddCourtModalOpen(false);
        setNewCourtData({ name: "", surface: "Cristal Panorámico", indoor: true });
      } else {
        const errorData = await res.json();
        alert(errorData.message || "No se pudo agregar la cancha");
      }
    } catch (err) {
      alert("Error de conexión al agregar cancha");
    }
  };

  const filteredClubs = clubs.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.city || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.owner_email || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "active") return matchesSearch && c.status !== "inactive";
    if (statusFilter === "inactive") return matchesSearch && c.status === "inactive";
    if (statusFilter === "paid") return matchesSearch && (c.payment_status === "paid" || !c.payment_status);
    if (statusFilter === "pending") return matchesSearch && c.payment_status === "pending";
    return matchesSearch;
  });

  const activeClubsCount = clubs.filter((c) => c.status !== "inactive").length;
  const inactiveClubsCount = clubs.filter((c) => c.status === "inactive").length;
  const paidClubsCount = clubs.filter((c) => c.payment_status === "paid" || !c.payment_status).length;
  const pendingClubsCount = clubs.filter((c) => c.payment_status === "pending").length;
  const totalCourtsAllowed = clubs.reduce((acc, c) => acc + (Number(c.max_courts) || 4), 0);
  const estimatedMonthlyRevenue = clubs
    .filter((c) => c.payment_status === "paid" || !c.payment_status)
    .reduce((acc, c) => acc + (Number(c.max_courts) || 4) * 15000, 0);

  return (
    <div className="min-h-screen bg-[#06100E] text-[#F1F5F3] font-sans">
      <header className="border-b border-[#16272a] bg-[#0C1517]/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#00D084]/10 border border-[#00D084]/30 flex items-center justify-center text-[#00D084] shadow-lg shadow-[#00D084]/10">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-[#F1F5F3]">PadelSaaS Core</h1>
                <span className="text-xs bg-[#00D084]/20 text-[#00D084] border border-[#00D084]/30 px-2 py-0.5 rounded-full font-semibold">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-[#8A9B95]">Control maestro de complejos, pistas y credenciales</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-[#00D084] hover:bg-[#4ADE80] text-[#06100E] font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-[#00D084]/20"
            >
              <Plus className="h-4 w-4" />
              Nuevo Complejo & Dueño
            </button>
            <a
              href="/login"
              className="p-2 rounded-xl bg-[#0C1517] border border-[#16272a] text-[#8A9B95] hover:text-[#F1F5F3] transition text-xs flex items-center gap-1"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {msg && (
          <div className="p-3.5 rounded-xl bg-[#00D084]/10 border border-[#00D084]/30 text-[#00D084] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>{msg}</span>
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0C1517] border border-[#16272a] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#8A9B95]">Complejos Registrados</p>
            <h3 className="text-3xl font-bold mt-1 text-[#F1F5F3]">{clubs.length}</h3>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="text-[#00D084] font-semibold">{activeClubsCount} activos</span>
              {inactiveClubsCount > 0 && (
                <span className="text-[#EF4444] font-semibold">({inactiveClubsCount} de baja)</span>
              )}
            </div>
          </div>

          <div className="bg-[#0C1517] border border-[#16272a] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#8A9B95]">Estado de Suscripciones</p>
            <h3 className="text-3xl font-bold mt-1 text-[#00D084]">{paidClubsCount} al día</h3>
            <p className="text-xs text-[#8A9B95] mt-2">
              {pendingClubsCount > 0 ? (
                <span className="text-[#EF4444] font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {pendingClubsCount} con pago pendiente
                </span>
              ) : (
                <span className="text-[#00D084]">100% de complejos al día</span>
              )}
            </p>
          </div>

          <div className="bg-[#0C1517] border border-[#16272a] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#8A9B95]">Recaudación Mensual</p>
            <h3 className="text-3xl font-bold mt-1 text-[#F1F5F3]">
              ${estimatedMonthlyRevenue.toLocaleString("es-AR")}
            </h3>
            <p className="text-xs text-[#8A9B95] mt-2">Ingreso mensual por canchas activas</p>
          </div>

          <div className="bg-[#0C1517] border border-[#16272a] p-5 rounded-2xl">
            <p className="text-xs font-medium text-[#8A9B95]">Cupo Global Canchas</p>
            <h3 className="text-3xl font-bold mt-1 text-[#F1F5F3]">{totalCourtsAllowed}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-[#00D084]">
              <span className="h-2 w-2 rounded-full bg-[#00D084] animate-pulse"></span>
              <span className="font-semibold">Motor IA WhatsApp Activo</span>
            </div>
          </div>
        </section>

        <section className="bg-[#0C1517] border border-[#16272a] rounded-2xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#16272a] pb-4">
            <div>
              <h2 className="text-base font-bold text-[#F1F5F3]">Gestión de Complejos & Suscripciones</h2>
              <p className="text-xs text-[#8A9B95]">Habilitar/deshabilitar accesos y registrar pagos mensuales de software</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex bg-[#06100E] border border-[#16272a] rounded-xl p-0.5 text-xs">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1 rounded-lg transition font-medium ${
                    statusFilter === "all" ? "bg-[#00D084] text-[#06100E] font-bold" : "text-[#8A9B95] hover:text-[#F1F5F3]"
                  }`}
                >
                  Todos ({clubs.length})
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-3 py-1 rounded-lg transition font-medium ${
                    statusFilter === "active" ? "bg-[#00D084] text-[#06100E] font-bold" : "text-[#8A9B95] hover:text-[#F1F5F3]"
                  }`}
                >
                  Activos ({activeClubsCount})
                </button>
                <button
                  onClick={() => setStatusFilter("inactive")}
                  className={`px-3 py-1 rounded-lg transition font-medium ${
                    statusFilter === "inactive" ? "bg-[#EF4444] text-white font-bold" : "text-[#8A9B95] hover:text-[#F1F5F3]"
                  }`}
                >
                  De Baja ({inactiveClubsCount})
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-3 py-1 rounded-lg transition font-medium ${
                    statusFilter === "pending" ? "bg-[#F59E0B] text-[#06100E] font-bold" : "text-[#8A9B95] hover:text-[#F1F5F3]"
                  }`}
                >
                  Pendientes Pago ({pendingClubsCount})
                </button>
              </div>

              <div className="relative flex-1 md:w-56">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9B95]" />
                <input
                  type="text"
                  placeholder="Buscar club o mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#F1F5F3]"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#8A9B95]">
              <thead className="bg-[#06100E] text-[#8A9B95] uppercase text-[10px] border-b border-[#16272a]">
                <tr>
                  <th className="px-4 py-3">Complejo</th>
                  <th className="px-4 py-3">Dueño & Login Email</th>
                  <th className="px-4 py-3">Estado Acceso</th>
                  <th className="px-4 py-3">Seguimiento Pago</th>
                  <th className="px-4 py-3">Cupo Canchas</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#16272a]">
                {filteredClubs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#8A9B95]">
                      No se encontraron complejos con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  filteredClubs.map((club) => {
                    const isInactive = club.status === "inactive";
                    const isPaid = club.payment_status === "paid" || !club.payment_status;
                    const courtsCount = Number(club.max_courts) || 4;
                    const monthlyFee = courtsCount * 15000;

                    return (
                      <tr
                        key={club.id}
                        className={`hover:bg-[#16272a]/30 transition ${
                          isInactive ? "opacity-60 bg-[#EF4444]/5" : ""
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="font-semibold text-[#F1F5F3] text-sm flex items-center gap-2">
                            {club.name}
                            {isInactive && (
                              <span className="text-[10px] bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30 px-1.5 py-0.5 rounded font-bold">
                                DADO DE BAJA
                              </span>
                            )}
                          </div>
                          <div className="text-[#8A9B95] text-[11px] flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-[#8A9B95]" /> {club.city || "Argentina"}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="text-[#F1F5F3] font-medium">{club.owner_name}</div>
                          <div className="text-[#8A9B95] text-[11px] flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3 text-[#8A9B95]" /> {club.owner_email || "-"}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {isInactive ? (
                              <span className="px-2.5 py-1 rounded-lg bg-[#EF4444]/15 text-[#EF4444] text-[11px] border border-[#EF4444]/30 font-bold inline-flex items-center gap-1">
                                <Power className="h-3 w-3" /> Deshabilitado
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-[#00D084]/15 text-[#00D084] text-[11px] border border-[#00D084]/30 font-bold inline-flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Activo
                              </span>
                            )}
                            <button
                              onClick={() => handleToggleStatus(club)}
                              className={`text-[10px] px-2 py-1 rounded-lg border transition font-medium ${
                                isInactive
                                  ? "bg-[#00D084]/10 border-[#00D084]/30 text-[#00D084] hover:bg-[#00D084] hover:text-[#06100E]"
                                  : "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444] hover:bg-[#EF4444] hover:text-white"
                              }`}
                              title={isInactive ? "Reactivar complejo y login" : "Dar de baja complejo y bloquear login"}
                            >
                              {isInactive ? "Reactivar" : "Dar de baja"}
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {isPaid ? (
                                <span className="px-2 py-0.5 rounded bg-[#00D084]/15 text-[#00D084] text-[11px] border border-[#00D084]/30 font-bold inline-flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> Al Día
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] text-[11px] border border-[#F59E0B]/40 font-bold inline-flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" /> Pendiente
                                </span>
                              )}
                              <span className="text-[11px] font-semibold text-[#F1F5F3]">
                                ${monthlyFee.toLocaleString("es-AR")}/mes
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {club.last_payment_date && (
                                <span className="text-[10px] text-[#8A9B95] flex items-center gap-1">
                                  <Clock className="h-2.5 w-2.5" /> Último pago: {club.last_payment_date}
                                </span>
                              )}
                              <button
                                onClick={() => handleTogglePayment(club)}
                                className={`text-[10px] px-2 py-0.5 rounded border transition font-medium ${
                                  isPaid
                                    ? "bg-[#16272a] border-[#16272a] text-[#8A9B95] hover:text-[#F1F5F3]"
                                    : "bg-[#00D084]/20 border-[#00D084]/40 text-[#00D084] hover:bg-[#00D084] hover:text-[#06100E] font-bold"
                                }`}
                              >
                                {isPaid ? "Marcar Pendiente" : "Registrar Pago"}
                              </button>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 font-bold text-[#F1F5F3]">
                          {club.max_courts || 4} pistas
                        </td>

                        <td className="px-4 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedClubForCourt(club);
                              setIsAddCourtModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 text-xs bg-[#06100E] border border-[#16272a] hover:border-[#00D084]/50 text-[#F1F5F3] px-2.5 py-1.5 rounded-lg transition"
                          >
                            <Layers className="h-3 w-3 text-[#00D084]" /> + Cancha
                          </button>
                          <a
                            href={`/clubs/${club.slug || "latoska-er"}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#00D084] hover:underline font-semibold"
                          >
                            Ver Link <ExternalLink className="h-3 w-3" />
                          </a>
                          <button
                            onClick={() => handleDeleteClub(club)}
                            className="inline-flex items-center gap-1 text-xs bg-[#EF4444]/10 border border-[#EF4444]/30 hover:bg-[#EF4444] hover:text-white text-[#EF4444] px-2.5 py-1.5 rounded-lg transition"
                            title="Eliminar complejo permanentemente"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modal Crear Club */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C1517] border border-[#16272a] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#16272a] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#00D084]" />
                <h3 className="font-bold text-[#F1F5F3] text-base">Crear Complejo & Usuario Administrador</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#8A9B95] hover:text-[#F1F5F3]">✕</button>
            </div>

            <form onSubmit={handleCreateClub} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-[#8A9B95] font-medium">Nombre del Complejo</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: Smash Pádel"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#8A9B95] font-medium">Ciudad</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: Rosario, Santa Fe"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-[#8A9B95] font-medium">WhatsApp / Teléfono del Club</label>
                  <input
                    required
                    type="tel"
                    placeholder="Ej: +54 9 3447 64-2471"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#8A9B95] font-medium">Cupo Máximo de Canchas</label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxCourts}
                    onChange={(e) => setFormData({ ...formData, maxCourts: Number(e.target.value) })}
                    className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-[#8A9B95] font-medium">Nombre del Dueño</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#8A9B95] font-medium">Email de Login</label>
                  <input
                    required
                    type="email"
                    placeholder="juan@smashpadel.com"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8A9B95] font-medium">Contraseña Inicial</label>
                <input
                  required
                  type="text"
                  placeholder="password123"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                />
              </div>

              <div className="pt-3 border-t border-[#16272a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#8A9B95] hover:text-[#F1F5F3]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#00D084] hover:bg-[#4ADE80] text-[#06100E] font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-[#00D084]/20"
                >
                  {loading ? "Creando..." : "Crear Club & Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Super Admin: Agregar Cancha a un Complejo */}
      {isAddCourtModalOpen && selectedClubForCourt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C1517] border border-[#16272a] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#16272a] pb-3">
              <div>
                <h3 className="font-bold text-[#F1F5F3] text-base">Agregar Cancha</h3>
                <p className="text-xs text-[#8A9B95]">{selectedClubForCourt.name} (Cupo: {selectedClubForCourt.max_courts})</p>
              </div>
              <button onClick={() => setIsAddCourtModalOpen(false)} className="text-[#8A9B95] hover:text-[#F1F5F3]">✕</button>
            </div>

            <form onSubmit={handleAddCourtToClub} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-[#8A9B95] font-medium">Nombre de la Cancha</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Cancha 3 (Cristal)"
                  value={newCourtData.name}
                  onChange={(e) => setNewCourtData({ ...newCourtData, name: e.target.value })}
                  className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[#8A9B95] font-medium">Superficie</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: Cristal Panorámico"
                  value={newCourtData.surface}
                  onChange={(e) => setNewCourtData({ ...newCourtData, surface: e.target.value })}
                  className="w-full bg-[#06100E] border border-[#16272a] focus:border-[#00D084] rounded-xl px-3 py-2 text-xs text-[#F1F5F3]"
                />
              </div>

              <div className="pt-3 border-t border-[#16272a] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCourtModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#8A9B95] hover:text-[#F1F5F3]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#00D084] hover:bg-[#4ADE80] text-[#06100E] font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-lg shadow-[#00D084]/20"
                >
                  Habilitar Cancha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
