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
        const res = await fetch("https://padel-saas-backend-production-a91f.up.railway.app/api/clubs");
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
    <div className="min-h-screen bg-[#06100E] text-[#F1F5F3] font-sans p-6">
      <header className="max-w-4xl mx-auto flex items-center justify-between pb-8 border-b border-[#16272a]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#00D084]/10 border border-[#00D084]/30 flex items-center justify-center text-[#00D084]">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#F1F5F3]">Reserva tu Turno de Pádel</h1>
            <p className="text-xs text-[#8A9B95]">Seleccioná tu complejo para ver disponibilidad en vivo</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-base font-bold text-[#F1F5F3]">Complejos Disponibles</h2>
          <p className="text-xs text-[#8A9B95]">Elegí el club donde querés jugar hoy:</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {clubs.map((club) => (
            <Link
              key={club.id}
              href={`/clubs/${club.slug || "latoska-er"}`}
              className="p-5 rounded-2xl bg-[#0C1517] border border-[#16272a] hover:border-[#00D084]/50 transition group flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="space-y-1.5">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base text-[#F1F5F3] group-hover:text-[#00D084] transition">
                    {club.name}
                  </h3>
                  <span className="text-[10px] bg-[#00D084]/10 border border-[#00D084]/20 text-[#00D084] px-2 py-0.5 rounded-full font-semibold">
                    {club.max_courts || 4} Pistas
                  </span>
                </div>
                <div className="text-xs text-[#8A9B95] flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#8A9B95]" /> {club.city || "Argentina"}
                </div>
              </div>

              <div className="pt-3 border-t border-[#16272a] flex justify-between items-center text-xs font-semibold text-[#00D084]">
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
