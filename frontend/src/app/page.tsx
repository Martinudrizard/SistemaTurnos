import Link from "next/link";
import { Trophy, ShieldCheck, Building2, Calendar, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">PadelSaaS AI</h1>
            <p className="text-xs text-slate-400">Gestión de canchas de pádel con IA</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 text-center space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Arquitectura Multi-Rol Activa
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Sistema de Gestión & Reservas de Pádel
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Plataforma escalable con reservas en tiempo real, integración con MercadoPago y atención automática por WhatsApp con Inteligencia Artificial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Super Admin */}
          <Link
            href="/admin"
            className="group block p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition relative overflow-hidden shadow-xl"
          >
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20 w-fit mb-4 group-hover:scale-110 transition">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-white group-hover:text-emerald-400 transition">
              1. Super Admin (Vos)
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Panel maestro para dar de alta clubes, autorizar cupos de canchas, supervisar suscripciones y el bot de WhatsApp.
            </p>
            <span className="inline-block mt-4 text-xs font-semibold text-emerald-400">
              Entrar al panel →
            </span>
          </Link>

          {/* Club Owner */}
          <Link
            href="/owner"
            className="group block p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition relative overflow-hidden shadow-xl"
          >
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20 w-fit mb-4 group-hover:scale-110 transition">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition">
              2. Dueño del Complejo
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Grilla de turnos interactiva, gestión de canchas con límite de cupo, caja de señas y contacto al jugador por WhatsApp.
            </p>
            <span className="inline-block mt-4 text-xs font-semibold text-blue-400">
              Entrar al panel del club →
            </span>
          </Link>

          {/* Player / Public */}
          <Link
            href="/reserve"
            className="group block p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition relative overflow-hidden shadow-xl"
          >
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20 w-fit mb-4 group-hover:scale-110 transition">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition">
              3. Vista Jugador (Estilo Clubo)
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Experiencia pública para seleccionar fecha, pista, turno y abonar la seña con MercadoPago.
            </p>
            <span className="inline-block mt-4 text-xs font-semibold text-purple-400">
              Ver web de reservas →
            </span>
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-900 px-6 py-4 text-center text-xs text-slate-500">
        PadelSaaS © 2026 — Diseñado con Next.js, TypeScript y TailwindCSS.
      </footer>
    </div>
  );
}
