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
  CheckCircle2,
  Sliders,
  Clock,
  ShieldCheck,
  Calendar,
  Users,
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
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
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

// Identical realistic SVG Padel Ball
function RealisticPadelBall({
  rotation = 0,
  scaleX = 1,
  scaleY = 1,
  size = 54,
}: {
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  size?: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `rotate(${rotation}deg) scale(${scaleX}, ${scaleY})`,
        transition: "transform 0.07s linear",
      }}
      className="relative rounded-full shadow-[0_0_28px_rgba(204,255,0,0.65)]"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full rounded-full overflow-hidden"
      >
        <defs>
          <radialGradient id="padelFelt" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#f5ff66" />
            <stop offset="40%" stopColor="#ccff00" />
            <stop offset="85%" stopColor="#9edb00" />
            <stop offset="100%" stopColor="#6d9900" />
          </radialGradient>
          <radialGradient id="ballShine" cx="30%" cy="25%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Felt Base Sphere */}
        <circle cx="50" cy="50" r="49" fill="url(#padelFelt)" />

        {/* Padel signature curved seam lines */}
        <path
          d="M 14 30 C 32 46, 68 46, 86 30"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.8"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M 14 70 C 32 54, 68 54, 86 70"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.8"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Inner seam groove depth */}
        <path
          d="M 14 31 C 32 47, 68 47, 86 31"
          fill="none"
          stroke="#709600"
          strokeWidth="1.2"
          opacity="0.5"
        />
        <path
          d="M 14 71 C 32 55, 68 55, 86 71"
          fill="none"
          stroke="#709600"
          strokeWidth="1.2"
          opacity="0.5"
        />

        {/* Specular gloss */}
        <circle cx="36" cy="30" r="26" fill="url(#ballShine)" />
      </svg>
    </div>
  );
}

// Bounces from bottom to top and back as user scrolls
function BouncingPadelBall() {
  const [scrollY, setScrollY] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Parabolic cycle from bottom (ground) to top (peak) every 300px
  const cycle = (scrollY % 300) / 300; // 0 to 1
  // Parabola: at 0 & 1 y=70 (floor); at 0.5 y=-70 (peak)
  const yOffset = 70 - 140 * 4 * cycle * (1 - cycle);
  const isFloorImpact = cycle < 0.08 || cycle > 0.92;
  const isPeak = cycle > 0.42 && cycle < 0.58;

  // Squash & Stretch physics
  const scaleX = isFloorImpact ? 1.3 : isPeak ? 0.92 : 1;
  const scaleY = isFloorImpact ? 0.72 : isPeak ? 1.12 : 1;
  const rotation = (scrollY * 0.95 + clickCount * 120) % 360;

  return (
    <div className="hidden lg:flex fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-40 pointer-events-auto flex-col items-center select-none group">
      {/* Side Court Glass Rail Line */}
      <div className="absolute top-[-180px] bottom-[-180px] w-[2px] bg-gradient-to-b from-transparent via-[#ccff00]/30 to-transparent pointer-events-none" />

      {/* Floor Impact Ripple & Shadow */}
      <div
        style={{
          transform: `translateY(110px) scale(${isFloorImpact ? "1.4" : "0.7"})`,
          opacity: isFloorImpact ? 0.8 : 0.2,
          transition: "all 0.08s ease-out",
        }}
        className="absolute w-12 h-3 rounded-full bg-[#ccff00]/40 blur-[3px] pointer-events-none"
      />

      {isFloorImpact && (
        <div className="absolute top-[105px] w-12 h-12 rounded-full border border-[#ccff00]/80 animate-ping pointer-events-none" />
      )}

      {/* The Realistic Padel Ball */}
      <div
        onClick={() => setClickCount((c) => c + 1)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          transform: `translateY(${yOffset}px)`,
          transition: "transform 0.07s ease-out",
        }}
        className="cursor-pointer"
        title="¡Hacé clic para picar la pelota!"
      >
        <RealisticPadelBall
          rotation={rotation}
          scaleX={isHovered ? scaleX * 1.15 : scaleX}
          scaleY={isHovered ? scaleY * 1.15 : scaleY}
          size={56}
        />
      </div>

      {/* Mini Status Tag */}
      <span className="mt-40 text-[10px] font-bold text-[#ccff00] bg-slate-950/95 border border-[#ccff00]/40 px-2.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-xl">
        🎾 ¡Saque y Red!
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
    <div className="min-h-screen bg-[#070a0e] text-slate-100 font-sans selection:bg-[#ccff00]/30 selection:text-[#ccff00] overflow-x-hidden">
      {/* Dynamic Realistic Padel Ball (bounces bottom-to-top on scroll) */}
      <BouncingPadelBall />

      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-lime-950 via-slate-900 to-lime-950 border-b border-[#ccff00]/20 py-2 px-4 text-center text-xs font-semibold text-[#ccff00] flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5 text-[#ccff00] animate-pulse" />
        <span>¡Lanzamiento 2026! Automatizá tu complejo de pádel y cobrá señas 100% online.</span>
      </div>

      {/* Main Navbar */}
      <header className="border-b border-slate-800/80 bg-[#070a0e]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00] shadow-lg shadow-[#ccff00]/10 group-hover:scale-105 transition">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  Pádel<span className="text-[#ccff00]">Hub</span>
                </span>
                <span className="text-[10px] bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30 px-1.5 py-0.2 rounded font-semibold">
                  PRO
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
            <a href="#funcionalidades" className="hover:text-[#ccff00] transition flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ccff00]"></span>
              Funcionalidades
            </a>
            <a href="#beneficios" className="hover:text-[#ccff00] transition">
              Beneficios
            </a>
            <a href="#precios" className="hover:text-[#ccff00] transition">
              Precios
            </a>
            <a href="#como-funciona" className="hover:text-[#ccff00] transition">
              Cómo funciona
            </a>
            <a href="#faq" className="hover:text-[#ccff00] transition">
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
              className="flex items-center gap-1.5 bg-[#ccff00]/10 hover:bg-[#ccff00]/20 text-[#ccff00] border border-[#ccff00]/40 hover:border-[#ccff00] px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm hover:shadow-[#ccff00]/10"
            >
              <span>Ingresar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#ccff00]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-semibold shadow-inner">
            <Zap className="h-3.5 w-3.5 text-[#ccff00]" />
            <span>El software definitivo para canchas y clubes de pádel</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Automatizá tus turnos, cobrá señas y <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-[#ccff00] to-emerald-400">llená tus canchas.</span>
          </h1>

          <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Grilla en tiempo real, cobro de señas con Mercado Pago, web oficial personalizada y bot de WhatsApp con Inteligencia Artificial.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#ccff00] hover:bg-[#bbf000] text-slate-950 font-black px-7 py-3.5 rounded-2xl text-xs sm:text-sm transition shadow-xl shadow-[#ccff00]/20 hover:scale-105"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Solicitar Demo por WhatsApp</span>
            </a>

            <Link
              href="/clubs/smash-padel-colon"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900/80 hover:bg-slate-800 text-white font-semibold px-6 py-3.5 rounded-2xl text-xs sm:text-sm border border-slate-800 hover:border-[#ccff00]/40 transition"
            >
              <span>Ver Web de Reservas en Vivo</span>
              <ArrowRight className="h-4 w-4 text-[#ccff00]" />
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-slate-800/60 text-left">
            <div className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl">
              <div className="text-lg sm:text-xl font-extrabold text-[#ccff00]">100%</div>
              <div className="text-[11px] text-slate-400">Señas aseguradas</div>
            </div>
            <div className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl">
              <div className="text-lg sm:text-xl font-extrabold text-white">0</div>
              <div className="text-[11px] text-slate-400">Turnos duplicados</div>
            </div>
            <div className="p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl">
              <div className="text-lg sm:text-xl font-extrabold text-[#ccff00]">24/7</div>
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
              <div className="h-full bg-gradient-to-b from-[#0f1722] to-[#0a0f16] border border-slate-800/90 hover:border-[#ccff00]/50 p-6 rounded-3xl flex flex-col items-center text-center justify-center space-y-3 shadow-xl hover:shadow-[#ccff00]/10 transition duration-300 group">
                <div className="h-14 w-14 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00] group-hover:scale-110 group-hover:bg-[#ccff00]/20 transition">
                  <CreditCard className="h-7 w-7" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-[#ccff00] transition">
                  Cobro de señas automático
                </h3>
              </div>
            </ScrollReveal>

            {/* Feature 2 */}
            <ScrollReveal direction="up" delay={150}>
              <div className="h-full bg-gradient-to-b from-[#0f1722] to-[#0a0f16] border border-slate-800/90 hover:border-[#ccff00]/50 p-6 rounded-3xl flex flex-col items-center text-center justify-center space-y-3 shadow-xl hover:shadow-[#ccff00]/10 transition duration-300 group">
                <div className="h-14 w-14 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00] group-hover:scale-110 group-hover:bg-[#ccff00]/20 transition">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-[#ccff00] transition">
                  Bot de WhatsApp con IA
                </h3>
              </div>
            </ScrollReveal>

            {/* Feature 3 */}
            <ScrollReveal direction="up" delay={200}>
              <div className="h-full bg-gradient-to-b from-[#0f1722] to-[#0a0f16] border border-slate-800/90 hover:border-[#ccff00]/50 p-6 rounded-3xl flex flex-col items-center text-center justify-center space-y-3 shadow-xl hover:shadow-[#ccff00]/10 transition duration-300 group">
                <div className="h-14 w-14 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00] group-hover:scale-110 group-hover:bg-[#ccff00]/20 transition">
                  <Sliders className="h-7 w-7" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-[#ccff00] transition">
                  Tarifas personalizables
                </h3>
              </div>
            </ScrollReveal>

            {/* Feature 4 */}
            <ScrollReveal direction="right" delay={250}>
              <div className="h-full bg-gradient-to-b from-[#0f1722] to-[#0a0f16] border border-slate-800/90 hover:border-[#ccff00]/50 p-6 rounded-3xl flex flex-col items-center text-center justify-center space-y-3 shadow-xl hover:shadow-[#ccff00]/10 transition duration-300 group">
                <div className="h-14 w-14 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00] group-hover:scale-110 group-hover:bg-[#ccff00]/20 transition">
                  <Smartphone className="h-7 w-7" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-[#ccff00] transition">
                  Web oficial en tu bio
                </h3>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* NEW: Beneficios para tu predio Section (Inspired by Image 2) */}
      <section id="beneficios" className="py-20 px-4 sm:px-6 bg-[#0a0f15] border-y border-slate-800/80 relative overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-12">
          <ScrollReveal direction="up">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-bold">
                <ShieldCheck className="h-3.5 w-3.5 text-[#ccff00]" />
                <span>Impacto Directo en tu Negocio</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
                Beneficios para <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-[#ccff00] to-emerald-400">tu Predio</span>
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
                Diseñado para reducir tu carga de trabajo y asegurar la recaudación de cada turno.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Modern Smartphone Mockups */}
            <div className="lg:col-span-5 flex items-center justify-center relative py-6">
              <ScrollReveal direction="left" delay={100}>
                <div className="relative w-[300px] sm:w-[340px] h-[400px]">
                  {/* Phone 1: WhatsApp Bot */}
                  <div className="absolute left-0 top-0 w-[240px] sm:w-[260px] bg-[#111b21] rounded-3xl border-4 border-slate-700 shadow-2xl p-3.5 space-y-3 transform -rotate-3 hover:rotate-0 transition duration-300 z-10">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-[#00a884] flex items-center justify-center text-white font-bold text-xs">
                          🤖
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">Bot PádelHub</div>
                          <div className="text-[9px] text-[#00a884]">en línea</div>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400">10:35</span>
                    </div>

                    <div className="space-y-2 text-[10px]">
                      <div className="bg-[#202c33] p-2.5 rounded-2xl rounded-tl-none text-slate-200">
                        ¡Hola Francisco! 👋 Tu reserva para el <strong>Martes 19:00 hs</strong> en <strong>Cancha 1</strong> está confirmada.
                      </div>
                      <div className="bg-[#005c4b] p-2.5 rounded-2xl rounded-tr-none text-white ml-auto max-w-[85%]">
                        ✅ Seña de $8.000 acreditada en Mercado Pago.
                      </div>
                    </div>
                  </div>

                  {/* Phone 2: Mercado Pago Badge Overlay */}
                  <div className="absolute right-0 bottom-4 w-[220px] sm:w-[240px] bg-[#009ee3]/10 backdrop-blur-md rounded-2xl border border-[#009ee3]/40 shadow-2xl p-4 space-y-2.5 transform rotate-6 hover:rotate-0 transition duration-300 z-20">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#009ee3] flex items-center justify-center text-white font-black text-xs">
                        ✓
                      </div>
                      <span className="text-xs font-bold text-white">¡Pago Acreditado!</span>
                    </div>
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                      <div className="text-slate-400">Seña Turno Pádel:</div>
                      <div className="text-base font-black text-[#ccff00]">$8.000 ARS</div>
                      <div className="text-[9px] text-emerald-400 font-semibold mt-0.5">En tu cuenta al instante</div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right Column: 5 High-Impact Benefits Checklist */}
            <div className="lg:col-span-7 space-y-4">
              {[
                {
                  title: "Ventas activas 24/7",
                  desc: "Tus canchas se siguen reservando mientras dormís o estás ocupado, sin atender llamados.",
                },
                {
                  title: "Ahorrá tiempo: Reducí un 80% los mensajes",
                  desc: "Dejá de enviar audios y capturas de disponibilidad. El sistema muestra los horarios libres en vivo.",
                },
                {
                  title: "Pago de señas con Mercado Pago",
                  desc: "Disminuí un 90% las ausencias y cancelaciones. La plata va directo a tu cuenta bancaria.",
                },
                {
                  title: "Bot de WhatsApp con Inteligencia Artificial",
                  desc: "Atención inmediata para responder preguntas frecuentes y pasar el link de reserva al instante.",
                },
                {
                  title: "100% Web sin descargas de apps",
                  desc: "Para sacar turno tus clientes NO tienen que instalarse apps pesadas ni pasar por registros molestos.",
                },
              ].map((b, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 80}>
                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#0f1722]/80 border border-slate-800/80 hover:border-[#ccff00]/40 transition group">
                    <div className="h-7 w-7 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/40 flex items-center justify-center text-[#ccff00] flex-shrink-0 mt-0.5 group-hover:scale-110 group-hover:bg-[#ccff00] group-hover:text-slate-950 transition">
                      <Check className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#ccff00] transition">
                        {b.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Precios y Aranceles Section (Inspired by Image 4) */}
      <section id="precios" className="py-20 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto space-y-12">
          <ScrollReveal direction="up">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-bold">
                <span>Tarifa Plana & Sin Comisiones</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
                Precios y <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-[#ccff00] to-emerald-400">Aranceles</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Abono mensual fijo por cancha. Sin costos por reserva, sin contratos de permanencia.
              </p>
            </div>
          </ScrollReveal>

          {/* 2 Photographic Cards (Image 4 Style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Card 1: Predios de Pádel */}
            <ScrollReveal direction="left" delay={100}>
              <div className="bg-[#0f1722] border-2 border-slate-800 hover:border-[#ccff00]/60 rounded-3xl overflow-hidden shadow-2xl transition duration-300 group flex flex-col justify-between">
                {/* Visual Header */}
                <div className="relative h-48 sm:h-52 w-full bg-gradient-to-t from-[#0f1722] via-[#0f1722]/50 to-transparent overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80"
                    alt="Cancha de Pádel"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1722] via-[#0f1722]/40 to-transparent" />
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-[#ccff00]/40 text-[#ccff00] px-3 py-1 rounded-full text-[11px] font-bold">
                    🎾 Especializado en Pádel
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                      Para complejos de Pádel
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                        $15.000
                      </span>
                      <span className="text-xs font-bold text-[#ccff00]">ARS / mes</span>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold mt-1">
                      Por mes por cancha
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Cristal panorámico, canchas techadas o al aire libre
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#ccff00] flex-shrink-0" />
                      <span>Grilla de turnos casuales y fijos semanales</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#ccff00] flex-shrink-0" />
                      <span>Cobro de señas automático con Mercado Pago</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#ccff00] flex-shrink-0" />
                      <span>Bot de WhatsApp con Inteligencia Artificial</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#ccff00] flex-shrink-0" />
                      <span>Link web personalizado para tu Instagram</span>
                    </div>
                  </div>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#ccff00] hover:bg-[#bbf000] text-slate-950 font-black py-3.5 rounded-xl text-xs sm:text-sm transition shadow-lg shadow-[#ccff00]/20"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Contratar para mi Complejo</span>
                  </a>
                </div>
              </div>
            </ScrollReveal>

            {/* Card 2: Multideporte (Pádel, Tenis, Fútbol) */}
            <ScrollReveal direction="right" delay={150}>
              <div className="bg-[#0f1722] border-2 border-slate-800 hover:border-[#ccff00]/60 rounded-3xl overflow-hidden shadow-2xl transition duration-300 group flex flex-col justify-between">
                {/* Visual Header */}
                <div className="relative h-48 sm:h-52 w-full bg-gradient-to-t from-[#0f1722] via-[#0f1722]/50 to-transparent overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80"
                    alt="Club Multideporte"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f1722] via-[#0f1722]/40 to-transparent" />
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-[#ccff00]/40 text-[#ccff00] px-3 py-1 rounded-full text-[11px] font-bold">
                    ⚡ Club Multideporte
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                      Para predios de varios deportes
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                        $15.000
                      </span>
                      <span className="text-xs font-bold text-[#ccff00]">ARS / mes</span>
                    </div>
                    <p className="text-xs text-slate-300 font-semibold mt-1">
                      Por mes por cancha
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Pádel, Tenis, Pickleball, Fútbol y más
                    </p>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-4">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#ccff00] flex-shrink-0" />
                      <span>Administración simultánea de múltiples deportes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#ccff00] flex-shrink-0" />
                      <span>Tarifas diferenciadas día / noche con luz</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#ccff00] flex-shrink-0" />
                      <span>Bloqueo de horarios por torneos o lluvia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-[#ccff00] flex-shrink-0" />
                      <span>Soporte prioritario y puesta en marcha en 24 hs</span>
                    </div>
                  </div>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm border border-slate-700 hover:border-[#ccff00] transition"
                  >
                    <MessageCircle className="h-4 w-4 text-[#ccff00]" />
                    <span>Consultar por Predio Multideporte</span>
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Quick Calculator Box */}
          <ScrollReveal direction="scale" delay={150}>
            <div className="max-w-3xl mx-auto bg-[#0a0f15] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-bold text-slate-300">
                  Calculá tu costo exacto:
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start pt-1">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setCourtsCount(num)}
                      className={`h-9 w-9 rounded-lg text-xs font-bold transition border ${
                        courtsCount === num
                          ? "bg-[#ccff00] text-slate-950 border-[#ccff00] font-black scale-105"
                          : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="text-2xl font-black text-white">
                  ${totalPrice.toLocaleString()} <span className="text-xs text-[#ccff00] font-bold">ARS / mes</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {courtsCount} {courtsCount === 1 ? "cancha" : "canchas"} en total
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="py-16 px-4 sm:px-6 bg-[#0a0f15] border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto space-y-12">
          <ScrollReveal direction="up">
            <div className="text-center space-y-2">
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
                <div className="h-8 w-8 rounded-xl bg-[#ccff00]/10 text-[#ccff00] font-black flex items-center justify-center text-sm border border-[#ccff00]/30">
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
                <div className="h-8 w-8 rounded-xl bg-[#ccff00]/10 text-[#ccff00] font-black flex items-center justify-center text-sm border border-[#ccff00]/30">
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
                <div className="h-8 w-8 rounded-xl bg-[#ccff00]/10 text-[#ccff00] font-black flex items-center justify-center text-sm border border-[#ccff00]/30">
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
      <section id="faq" className="py-16 px-4 sm:px-6 border-t border-slate-800/80">
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
                        openFaq === idx ? "rotate-90 text-[#ccff00]" : ""
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
      <footer className="border-t border-slate-800 bg-[#070a0e] px-6 py-10 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00] font-bold">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-white text-sm">PádelHub</span>
            <span className="text-slate-600">|</span>
            <span>Software de Gestión & Reservas</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <Link href="/login" className="hover:text-[#ccff00] transition">
              Acceso Dueños
            </Link>
            <Link href="/reserve" className="hover:text-[#ccff00] transition">
              Web de Reservas
            </Link>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="text-[#ccff00] hover:underline">
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
