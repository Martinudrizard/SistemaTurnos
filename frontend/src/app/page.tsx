"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  CheckCircle2,
  CreditCard,
  MessageCircle,
  Smartphone,
  Clock,
  ArrowRight,
  Lock,
  Zap,
  ChevronRight,
  Flame,
  Sun,
  Moon,
  HelpCircle,
  Users,
  Check,
} from "lucide-react";

function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "scale";
  delay?: number;
  className?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const getTransform = () => {
    if (!isVisible) {
      if (direction === "left") return "-translate-x-14 opacity-0";
      if (direction === "right") return "translate-x-14 opacity-0";
      if (direction === "scale") return "scale-90 opacity-0";
      return "translate-y-12 opacity-0";
    }
    return "translate-x-0 translate-y-0 scale-100 opacity-100";
  };

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${getTransform()} ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [courtsCount, setCourtsCount] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<"owner" | "player">("owner");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const pricePerCourt = 15000;
  const totalPrice = courtsCount * pricePerCourt;

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const whatsappLink = `https://wa.me/5493435551234?text=${encodeURIComponent(
    `¡Hola! Me interesa contratar PádelHub para mi complejo (${courtsCount} canchas). ¿Podrían brindarme más información?`
  )}`;

  return (
    <div className="min-h-screen bg-[#090d12] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-500/20 py-2 px-4 text-center text-xs font-medium text-emerald-300 flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
        <span>¡Lanzamiento 2026! Automatizá tu complejo de pádel y cobrá señas 100% online.</span>
      </div>

      {/* Main Navbar */}
      <header className="border-b border-slate-800/80 bg-[#090d12]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  Pádel<span className="text-emerald-400">Hub</span>
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-semibold">
                  PRO
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#plataforma" className="hover:text-emerald-400 transition flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
              Plataforma
            </a>
            <a href="#funcionalidades" className="hover:text-emerald-400 transition">
              Funcionalidades
            </a>
            <a href="#precios" className="hover:text-emerald-400 transition">
              Precios
            </a>
            <a href="#como-funciona" className="hover:text-emerald-400 transition">
              Cómo funciona
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition">
              Preguntas
            </a>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/reserve"
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-800/60 transition"
            >
              <span>Ver Demo</span>
            </Link>

            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:border-emerald-400 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm hover:shadow-emerald-500/10"
            >
              <span>Ingresar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-inner">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span>El software definitivo para complejos y canchas de pádel</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Automatizá tus turnos, cobrá señas y <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">llená tus canchas.</span>
          </h1>

          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Plataforma 100% online con grilla de turnos en tiempo real, integración directa con Mercado Pago, página web personalizada para tu club y bot de WhatsApp con Inteligencia Artificial.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-7 py-3.5 rounded-2xl text-xs sm:text-sm transition shadow-xl shadow-emerald-500/20"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Solicitar Demo por WhatsApp</span>
            </a>

            <Link
              href="/clubs/smash-padel-colon"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3.5 rounded-2xl text-xs sm:text-sm border border-slate-800 hover:border-slate-700 transition"
            >
              <span>Ver Web de Reservas en Vivo</span>
              <ArrowRight className="h-4 w-4 text-emerald-400" />
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-800/60 text-left">
            <div className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl">
              <div className="text-lg sm:text-xl font-extrabold text-emerald-400">100%</div>
              <div className="text-[11px] text-slate-400">Señas aseguradas</div>
            </div>
            <div className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl">
              <div className="text-lg sm:text-xl font-extrabold text-white">0</div>
              <div className="text-[11px] text-slate-400">Turnos duplicados</div>
            </div>
            <div className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl">
              <div className="text-lg sm:text-xl font-extrabold text-emerald-400">24/7</div>
              <div className="text-[11px] text-slate-400">Reservas automáticas</div>
            </div>
            <div className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl">
              <div className="text-lg sm:text-xl font-extrabold text-white">$15.000</div>
              <div className="text-[11px] text-slate-400">Por cancha al mes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Platform Preview Section */}
      <section id="plataforma" className="py-12 px-4 sm:px-6 bg-[#0c1117] border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto space-y-8">
          <ScrollReveal direction="up" delay={50}>
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Diseñado para dueños exigentes y jugadores modernos
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Explorá la experiencia desde la administración y desde la vista de tus clientes.
              </p>

              {/* Toggle View Tabs */}
              <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl mt-4">
                <button
                  onClick={() => setActiveTab("owner")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === "owner"
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Panel del Dueño</span>
                </button>
                <button
                  onClick={() => setActiveTab("player")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === "player"
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>Página Web del Jugador</span>
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Tab Content 1: Owner Panel */}
          {activeTab === "owner" && (
            <ScrollReveal direction="scale" delay={100}>
              <div className="bg-[#131b22] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                      <h3 className="font-extrabold text-white text-base">Grilla de Turnos en Vivo</h3>
                    </div>
                    <p className="text-xs text-slate-400">Control total de turnos casuales, fijos semanales y cobro de señas</p>
                  </div>
                  <Link
                    href="/login"
                    className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Probar panel con usuario demo</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Grid Preview Table */}
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0e141a]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="p-3 w-32">Horario</th>
                        <th className="p-3">Cancha 1 (Cristal Panorámico)</th>
                        <th className="p-3">Cancha 2 (Sintético Pro)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      <tr>
                        <td className="p-3 font-semibold text-slate-300 bg-slate-950/40">17:00 - 18:30</td>
                        <td className="p-2">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                            <div className="font-bold flex items-center justify-between">
                              <span>Martín Udrizard</span>
                              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold">
                                🔁 Fijo Mar
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-300 mt-0.5 flex justify-between">
                              <span>Seña: $8.000</span>
                              <span className="text-amber-300 font-semibold">Debe: $6.000</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="py-3 text-center rounded-xl border border-dashed border-slate-800 text-slate-500 font-medium">
                            + Libre ($14.000)
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-300 bg-slate-950/40">18:30 - 20:00</td>
                        <td className="p-2">
                          <div className="py-3 text-center rounded-xl border border-dashed border-slate-800 text-slate-500 font-medium">
                            + Libre ($18.000)
                          </div>
                        </td>
                        <td className="p-2">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                            <div className="font-bold">Gonzalo Rossi</div>
                            <div className="text-[10px] text-slate-300 mt-0.5 flex justify-between">
                              <span>Seña: $8.000 (MP)</span>
                              <span className="text-emerald-400 font-bold">100% Abonado</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Tab Content 2: Player Page */}
          {activeTab === "player" && (
            <ScrollReveal direction="scale" delay={100}>
              <div className="bg-[#131b22] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                      <h3 className="font-extrabold text-white text-base">Página Web Pública para Jugadores</h3>
                    </div>
                    <p className="text-xs text-slate-400">Link personalizado para poner en Instagram y WhatsApp de tu complejo</p>
                  </div>
                  <Link
                    href="/clubs/smash-padel-colon"
                    className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Abrir web de ejemplo</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0e141a] border border-slate-800 p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">Horarios Disponibles Hoy</span>
                      <span className="text-emerald-400 font-medium">3 horarios libres</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2 font-bold text-emerald-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                          <span>18:30 hs | Pádel</span>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg font-bold text-[11px] border border-emerald-500/20">
                          Reservar (Seña $8.000)
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2 font-bold text-emerald-300">
                          <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                          <span>20:00 hs | Pádel</span>
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg font-bold text-[11px] border border-emerald-500/20">
                          Reservar (Seña $8.000)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0e141a] border border-slate-800 p-4 rounded-2xl space-y-3 text-xs">
                    <span className="font-bold text-white">Modal de Checkout y Pago</span>
                    <div className="space-y-2 bg-slate-900 p-3 rounded-xl border border-slate-800 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cancha elegida:</span>
                        <span className="font-bold text-white">Cancha 1 (Cristal)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total turno:</span>
                        <span className="text-white">$18.000</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-1.5 font-bold text-emerald-400">
                        <span>Seña MercadoPago:</span>
                        <span>$8.000</span>
                      </div>
                    </div>
                    <div className="w-full text-center py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs">
                      Pagar con MercadoPago y Confirmar
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section id="funcionalidades" className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <ScrollReveal direction="up">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Todo lo que necesitás para gestionar tu club
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
                Herramientas profesionales diseñadas específicamente para el ecosistema del pádel en Argentina.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 - Left */}
            <ScrollReveal direction="left" delay={100}>
              <div className="h-full bg-[#131b22] border border-slate-800/80 p-6 rounded-3xl space-y-3 shadow-lg hover:border-emerald-500/40 transition group">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-base text-white">Turnos Casuales & Fijos</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Reservas puntuales y turnos fijos automáticos sin duplicar horarios.
                </p>
              </div>
            </ScrollReveal>

            {/* Feature 2 - Up */}
            <ScrollReveal direction="up" delay={200}>
              <div className="h-full bg-[#131b22] border border-slate-800/80 p-6 rounded-3xl space-y-3 shadow-lg hover:border-emerald-500/40 transition group">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-base text-white">Cobro de Señas MP</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Conectá tu cuenta de Mercado Pago y cobrá señas al instante.
                </p>
              </div>
            </ScrollReveal>

            {/* Feature 3 - Right */}
            <ScrollReveal direction="right" delay={300}>
              <div className="h-full bg-[#131b22] border border-slate-800/80 p-6 rounded-3xl space-y-3 shadow-lg hover:border-emerald-500/40 transition group">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-base text-white">Bot WhatsApp con IA</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Responde consultas, pasa disponibilidad y envía el link directo.
                </p>
              </div>
            </ScrollReveal>

            {/* Feature 4 - Left */}
            <ScrollReveal direction="left" delay={150}>
              <div className="h-full bg-[#131b22] border border-slate-800/80 p-6 rounded-3xl space-y-3 shadow-lg hover:border-emerald-500/40 transition group">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                  <Sun className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-base text-white">Tarifas Día & Noche</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ajuste automático de precios por iluminación y horarios pico.
                </p>
              </div>
            </ScrollReveal>

            {/* Feature 5 - Up */}
            <ScrollReveal direction="up" delay={250}>
              <div className="h-full bg-[#131b22] border border-slate-800/80 p-6 rounded-3xl space-y-3 shadow-lg hover:border-emerald-500/40 transition group">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-base text-white">Reglas & Bloqueos</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Aperturas, cierres, torneos y restricción de horarios pasados.
                </p>
              </div>
            </ScrollReveal>

            {/* Feature 6 - Right */}
            <ScrollReveal direction="right" delay={350}>
              <div className="h-full bg-[#131b22] border border-slate-800/80 p-6 rounded-3xl space-y-3 shadow-lg hover:border-emerald-500/40 transition group">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-base text-white">Web Oficial en tu Bio</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tus jugadores reservan desde el celular sin descargar apps.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Pricing Section with Interactive Calculator */}
      <section id="precios" className="py-16 px-4 sm:px-6 bg-[#0c1117] border-y border-slate-800/80">
        <div className="max-w-4xl mx-auto space-y-10">
          <ScrollReveal direction="up">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <span>Tarifa Simple & Sin Comisiones</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Precios transparentes y previsibles
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Solo pagás un monto fijo por cancha al mes. Sin comisiones por reserva ni costos ocultos.
              </p>
            </div>
          </ScrollReveal>

          {/* Pricing Card & Interactive Slider */}
          <ScrollReveal direction="scale" delay={150}>
            <div className="bg-[#131b22] border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Column: Interactive Calculator */}
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-2">
                      ¿Cuántas canchas tiene tu complejo?
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          onClick={() => setCourtsCount(num)}
                          className={`h-11 w-11 rounded-xl text-xs font-extrabold transition border ${
                            courtsCount === num
                              ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105"
                              : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>Todas las funcionalidades habilitadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>Integración de Mercado Pago a tu cuenta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>Bot de WhatsApp con Inteligencia Artificial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>Turnos y reservas ilimitadas sin comisión</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>Soporte prioritario y puesta en marcha en 24 hs</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Price Box */}
                <div className="bg-[#0e141a] border border-slate-800 p-6 sm:p-8 rounded-2xl text-center space-y-4 shadow-inner">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Plan Completo ({courtsCount} {courtsCount === 1 ? "Cancha" : "Canchas"})
                  </span>

                  <div>
                    <div className="text-4xl sm:text-5xl font-black text-white">
                      ${totalPrice.toLocaleString()}
                    </div>
                    <span className="text-xs text-slate-400 font-medium">ARS / mes final</span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Equivale a <strong className="text-emerald-300">${pricePerCourt.toLocaleString()}</strong> por cancha por mes.
                  </p>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-emerald-500/20"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Empezar con {courtsCount} Canchas</span>
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <ScrollReveal direction="up">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Cómo funciona en 3 simples pasos
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Tu complejo funcionando en piloto automático desde el primer día.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal direction="left" delay={100}>
              <div className="h-full bg-[#131b22] border border-slate-800 p-6 rounded-3xl space-y-3 text-left shadow-lg">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-sm border border-emerald-500/30">
                  1
                </div>
                <h3 className="font-extrabold text-base text-white">Configurás tu complejo</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ingresás tus canchas, horarios de apertura y montos de seña en el panel del dueño.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200}>
              <div className="h-full bg-[#131b22] border border-slate-800 p-6 rounded-3xl space-y-3 text-left shadow-lg">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-sm border border-emerald-500/30">
                  2
                </div>
                <h3 className="font-extrabold text-base text-white">Compartís tu Link Oficial</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pegás el link en tu Instagram y WhatsApp. Tus clientes reservan desde cualquier celular.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={300}>
              <div className="h-full bg-[#131b22] border border-slate-800 p-6 rounded-3xl space-y-3 text-left shadow-lg">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 font-black flex items-center justify-center text-sm border border-emerald-500/30">
                  3
                </div>
                <h3 className="font-extrabold text-base text-white">Recibís reservas y señas</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  La seña se acredita en tu Mercado Pago y el turno se bloquea automáticamente en tu grilla.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-16 px-4 sm:px-6 bg-[#0c1117] border-t border-slate-800/80">
        <div className="max-w-3xl mx-auto space-y-8">
          <ScrollReveal direction="up">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Preguntas Frecuentes
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Resolvemos tus dudas sobre la plataforma y el funcionamiento.
              </p>
            </div>
          </ScrollReveal>

          <div className="space-y-3">
            {[
              {
                q: "¿Cómo recibo el dinero de las señas?",
                a: "El dinero de las señas va directo a tu cuenta de Mercado Pago personal o de tu complejo sin intermediarios. Nosotros no retenemos tus fondos.",
              },
              {
                q: "¿Qué pasa si un jugador tiene un turno fijo semanal?",
                a: "El sistema permite agendar turnos fijos que se repiten automáticamente todos los mismos días de la semana a esa hora, dejando libres el resto de los días.",
              },
              {
                q: "¿Los clientes tienen que instalarse alguna app?",
                a: "No. Tu web de reservas funciona de forma 100% nativa en el navegador del celular. Hacen clic en tu link de Instagram o WhatsApp y reservan en 30 segundos.",
              },
              {
                q: "¿Tiene costo de instalación o permanencia?",
                a: "No. Solo abonás el abono mensual fijo de $15.000 por cancha. Podés darte de baja en cualquier momento sin penalidad.",
              },
            ].map((faq, idx) => (
              <ScrollReveal key={idx} direction="up" delay={idx * 75}>
                <div
                  onClick={() => toggleFaq(idx)}
                  className="bg-[#131b22] border border-slate-800 rounded-2xl p-4.5 cursor-pointer hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-white">
                    <span>{faq.q}</span>
                    <ChevronRight
                      className={`h-4 w-4 text-slate-400 transition-transform ${
                        openFaq === idx ? "rotate-90 text-emerald-400" : ""
                      }`}
                    />
                  </div>
                  {openFaq === idx && (
                    <p className="text-xs text-slate-400 pt-1 leading-relaxed border-t border-slate-800/60 mt-2">
                      {faq.a}
                    </p>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#090d12] px-6 py-10 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-white text-sm">PádelHub</span>
            <span className="text-slate-600">|</span>
            <span>Software de Gestión & Reservas</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <Link href="/login" className="hover:text-emerald-400 transition">
              Acceso Dueños
            </Link>
            <Link href="/reserve" className="hover:text-emerald-400 transition">
              Web de Reservas
            </Link>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
              Soporte WhatsApp
            </a>
          </div>

          <div className="text-slate-500 text-[11px]">
            © 2026 PádelHub. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
