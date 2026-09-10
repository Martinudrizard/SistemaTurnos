"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Trophy,
  Sparkles,
  CreditCard,
  MessageCircle,
  Smartphone,
  ArrowRight,
  Zap,
  ChevronRight,
  Check,
  Sliders,
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
      if (direction === "left") return "-translate-x-12 opacity-0";
      if (direction === "right") return "translate-x-12 opacity-0";
      if (direction === "scale") return "scale-90 opacity-0";
      return "translate-y-10 opacity-0";
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

function BouncingPadelBall() {
  const [scrollY, setScrollY] = useState(0);
  const [bounceClick, setBounceClick] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Period of bounce: every ~260px of scroll
  const bounceCycle = (scrollY % 260) / 260; // 0 to 1
  const xOffset = Math.sin(bounceCycle * Math.PI) * 48; // parabolic arc
  const isImpact = bounceCycle > 0.92 || bounceCycle < 0.08;
  const rotation = (scrollY * 0.9 + bounceClick * 120) % 360;

  return (
    <div className="hidden lg:flex fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-40 pointer-events-auto flex-col items-center select-none group">
      {/* Side Glass Court Line Indicator */}
      <div className="absolute right-0 top-[-220px] bottom-[-220px] w-[2px] bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent pointer-events-none" />

      {/* Ripple impact ring */}
      {isImpact && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-cyan-400/70 animate-ping pointer-events-none" />
      )}

      {/* The Neon Padel Ball */}
      <div
        onClick={() => setBounceClick((c) => c + 1)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transform: `translateX(-${xOffset}px) rotate(${rotation}deg) scale(${
            isImpact ? "1.25, 0.75" : isHovered ? "1.15" : "1"
          })`,
          transition: "transform 0.09s ease-out",
        }}
        className="cursor-pointer relative w-12 h-12 rounded-full bg-gradient-to-br from-lime-300 via-lime-400 to-yellow-500 shadow-[0_0_24px_rgba(163,230,53,0.7)] flex items-center justify-center border-2 border-white/60 group-hover:shadow-[0_0_35px_rgba(6,182,212,0.9)]"
        title="¡Pelota en juego! Hacé clic o scrolleá para hacerla picar"
      >
        {/* Padel ball curved seam */}
        <div className="absolute inset-1 rounded-full border border-white/70 opacity-80 pointer-events-none" />
        <div className="absolute w-full h-[1.5px] bg-white/80 rounded-full rotate-45 pointer-events-none" />

        {/* Shine reflection */}
        <div className="absolute top-1.5 left-2 w-3 h-2 bg-white/90 rounded-full blur-[1px]" />
      </div>

      {/* Badge Tag */}
      <span className="mt-4 text-[10px] font-bold text-cyan-300 bg-slate-950/90 border border-cyan-500/40 px-2.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-xl">
        🎾 ¡Punto de Oro!
      </span>
    </div>
  );
}

export default function Home() {
  const [courtsCount, setCourtsCount] = useState<number>(2);
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
    <div className="min-h-screen bg-[#070a0f] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-300 overflow-x-hidden">
      {/* Dynamic Padel Ball that bounces with scroll */}
      <BouncingPadelBall />

      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 border-b border-cyan-500/20 py-2 px-4 text-center text-xs font-semibold text-cyan-300 flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
        <span>¡Lanzamiento 2026! Automatizá tu complejo de pádel y cobrá señas 100% online.</span>
      </div>

      {/* Main Navbar */}
      <header className="border-b border-slate-800/80 bg-[#070a0f]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  Pádel<span className="text-cyan-400">Hub</span>
                </span>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.2 rounded font-semibold">
                  PRO
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#funcionalidades" className="hover:text-cyan-400 transition flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
              Funcionalidades
            </a>
            <a href="#precios" className="hover:text-cyan-400 transition">
              Precios
            </a>
            <a href="#como-funciona" className="hover:text-cyan-400 transition">
              Cómo funciona
            </a>
            <a href="#faq" className="hover:text-cyan-400 transition">
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
              className="flex items-center gap-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:border-cyan-400 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm hover:shadow-cyan-500/10"
            >
              <span>Ingresar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-inner">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>El software definitivo para canchas y clubes de pádel</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Automatizá tus turnos, cobrá señas y <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">llená tus canchas.</span>
          </h1>

          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Grilla en tiempo real, integración directa con Mercado Pago, web oficial personalizada y bot de WhatsApp con Inteligencia Artificial.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold px-7 py-3.5 rounded-2xl text-xs sm:text-sm transition shadow-xl shadow-cyan-500/25"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Solicitar Demo por WhatsApp</span>
            </a>

            <Link
              href="/clubs/smash-padel-colon"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold px-6 py-3.5 rounded-2xl text-xs sm:text-sm border border-slate-800 hover:border-cyan-500/40 transition"
            >
              <span>Ver Web de Reservas en Vivo</span>
              <ArrowRight className="h-4 w-4 text-cyan-400" />
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-800/60 text-left">
            <div className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl">
              <div className="text-lg sm:text-xl font-extrabold text-cyan-400">100%</div>
              <div className="text-[11px] text-slate-400">Señas aseguradas</div>
            </div>
            <div className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl">
              <div className="text-lg sm:text-xl font-extrabold text-white">0</div>
              <div className="text-[11px] text-slate-400">Turnos duplicados</div>
            </div>
            <div className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl">
              <div className="text-lg sm:text-xl font-extrabold text-cyan-400">24/7</div>
              <div className="text-[11px] text-slate-400">Reservas automáticas</div>
            </div>
            <div className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl">
              <div className="text-lg sm:text-xl font-extrabold text-white">$15.000</div>
              <div className="text-[11px] text-slate-400">Por cancha al mes</div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimalist Key Features Showcase */}
      <section id="funcionalidades" className="py-16 px-4 sm:px-6 relative">
        <div className="max-w-5xl mx-auto space-y-10">
          <ScrollReveal direction="up">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Todo lo que tu complejo necesita
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Sin complicaciones. Tecnología simple para llenar tus canchas.
              </p>
            </div>
          </ScrollReveal>

          {/* Minimalist High-Tech Feature Grid (Specific concepts only) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feature 1 */}
            <ScrollReveal direction="left" delay={100}>
              <div className="h-full bg-gradient-to-b from-[#0f1722] to-[#0a0f16] border border-slate-800/90 hover:border-cyan-500/50 p-6 rounded-3xl flex flex-col items-center text-center justify-center space-y-3 shadow-xl hover:shadow-cyan-500/10 transition duration-300 group">
                <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition">
                  <CreditCard className="h-7 w-7" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-cyan-300 transition">
                  Cobro de señas automático
                </h3>
              </div>
            </ScrollReveal>

            {/* Feature 2 */}
            <ScrollReveal direction="up" delay={150}>
              <div className="h-full bg-gradient-to-b from-[#0f1722] to-[#0a0f16] border border-slate-800/90 hover:border-cyan-500/50 p-6 rounded-3xl flex flex-col items-center text-center justify-center space-y-3 shadow-xl hover:shadow-cyan-500/10 transition duration-300 group">
                <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-cyan-300 transition">
                  Bot de WhatsApp con IA
                </h3>
              </div>
            </ScrollReveal>

            {/* Feature 3 */}
            <ScrollReveal direction="up" delay={200}>
              <div className="h-full bg-gradient-to-b from-[#0f1722] to-[#0a0f16] border border-slate-800/90 hover:border-cyan-500/50 p-6 rounded-3xl flex flex-col items-center text-center justify-center space-y-3 shadow-xl hover:shadow-cyan-500/10 transition duration-300 group">
                <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition">
                  <Sliders className="h-7 w-7" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-cyan-300 transition">
                  Tarifas personalizables
                </h3>
              </div>
            </ScrollReveal>

            {/* Feature 4 */}
            <ScrollReveal direction="right" delay={250}>
              <div className="h-full bg-gradient-to-b from-[#0f1722] to-[#0a0f16] border border-slate-800/90 hover:border-cyan-500/50 p-6 rounded-3xl flex flex-col items-center text-center justify-center space-y-3 shadow-xl hover:shadow-cyan-500/10 transition duration-300 group">
                <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition">
                  <Smartphone className="h-7 w-7" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-cyan-300 transition">
                  Web oficial en tu bio
                </h3>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Pricing Section with Interactive Calculator */}
      <section id="precios" className="py-16 px-4 sm:px-6 bg-[#0a0f16] border-y border-slate-800/80">
        <div className="max-w-4xl mx-auto space-y-10">
          <ScrollReveal direction="up">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold">
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
            <div className="bg-[#0f1722] border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 relative overflow-hidden">
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
                              ? "bg-cyan-400 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/20 scale-105"
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
                      <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span>Todas las funcionalidades habilitadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span>Integración de Mercado Pago a tu cuenta</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span>Bot de WhatsApp con Inteligencia Artificial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span>Turnos y reservas ilimitadas sin comisión</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                      <span>Soporte prioritario y puesta en marcha en 24 hs</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Price Box */}
                <div className="bg-[#070a0f] border border-slate-800 p-6 sm:p-8 rounded-2xl text-center space-y-4 shadow-inner">
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
                    Equivale a <strong className="text-cyan-300">${pricePerCourt.toLocaleString()}</strong> por cancha por mes.
                  </p>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold py-3 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-cyan-500/20"
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
              <div className="h-full bg-[#0f1722] border border-slate-800 p-6 rounded-3xl space-y-3 text-left shadow-lg">
                <div className="h-8 w-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center text-sm border border-cyan-500/30">
                  1
                </div>
                <h3 className="font-extrabold text-base text-white">Configurás tu complejo</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Ingresás tus canchas, horarios de apertura y montos de seña en el panel.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={200}>
              <div className="h-full bg-[#0f1722] border border-slate-800 p-6 rounded-3xl space-y-3 text-left shadow-lg">
                <div className="h-8 w-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center text-sm border border-cyan-500/30">
                  2
                </div>
                <h3 className="font-extrabold text-base text-white">Compartís tu Link Oficial</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pegás el link en tu Instagram y WhatsApp. Tus clientes reservan desde el celular.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={300}>
              <div className="h-full bg-[#0f1722] border border-slate-800 p-6 rounded-3xl space-y-3 text-left shadow-lg">
                <div className="h-8 w-8 rounded-xl bg-cyan-500/20 text-cyan-400 font-black flex items-center justify-center text-sm border border-cyan-500/30">
                  3
                </div>
                <h3 className="font-extrabold text-base text-white">Recibís reservas y señas</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  La seña se acredita en tu Mercado Pago y el turno se bloquea automáticamente.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-16 px-4 sm:px-6 bg-[#0a0f16] border-t border-slate-800/80">
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
                  className="bg-[#0f1722] border border-slate-800 rounded-2xl p-4.5 cursor-pointer hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-white">
                    <span>{faq.q}</span>
                    <ChevronRight
                      className={`h-4 w-4 text-slate-400 transition-transform ${
                        openFaq === idx ? "rotate-90 text-cyan-400" : ""
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
      <footer className="border-t border-slate-800 bg-[#070a0f] px-6 py-10 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-white text-sm">PádelHub</span>
            <span className="text-slate-600">|</span>
            <span>Software de Gestión & Reservas</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <Link href="/login" className="hover:text-cyan-400 transition">
              Acceso Dueños
            </Link>
            <Link href="/reserve" className="hover:text-cyan-400 transition">
              Web de Reservas
            </Link>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
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
