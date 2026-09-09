"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, MapPin, ChevronRight, Sparkles, Building2 } from "lucide-react";

interface Club {
  id: string;
  name: string;
  slug: string;
  city: string;
  max_courts: number;
}

export default function ReserveIndexPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClubs() {
      try {
        const res = await fetch("https://padel-saas-backend-production.up.railway.app/api/clubs");
        if (res.ok) {
          const data = await res.json();
          setClubs(data);
        }
      } catch (e) {
        console.warn("Error fetching clubs");
      } finally {
        setLoading(false);
      }
    }
    fetchClubs();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6">
      <header className="max-w-4xl mx-auto flex items-center justify-between pb-8 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">Reserva tu Turno de Pádel</h1>
            <p className="text-xs text-slate-400">Seleccioná tu complejo para ver disponibilidad en vivo</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-base font-bold text-white">Complejos Disponibles</h2>
          <p className="text-xs text-slate-400">Elegí el club donde querés jugar hoy:</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {clubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.slug || "latoska-er"}`}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition group flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-1.5">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition">
                    {club.name}
                  </h3>
                  <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                    {club.max_courts || 4} Pistas
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-500" /> {club.city || "Argentina"}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs font-semibold text-emerald-400">
                <span>Ver turnos y reservar</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
