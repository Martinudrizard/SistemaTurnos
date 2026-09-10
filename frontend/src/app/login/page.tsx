"use client";

import React, { useState } from "react";
import { Trophy, Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://padel-saas-backend-production-a91f.up.railway.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Credenciales incorrectas");
      }

      localStorage.setItem("padel_token", data.token);
      localStorage.setItem("padel_user", JSON.stringify(data.user));

      if (data.user.role === "superadmin") {
        window.location.href = "/admin";
      } else if (data.user.role === "owner") {
        window.location.href = "/owner";
      } else {
        window.location.href = "/reserve";
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06100E] text-[#F1F5F3] flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-[#00D084]/10 border border-[#00D084]/30 flex items-center justify-center text-[#00D084] mx-auto shadow-xl shadow-[#00D084]/10">
            <Trophy className="h-7 w-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#F1F5F3] tracking-tight">PádelHub</h1>
          <p className="text-sm sm:text-base text-[#8A9B95]">Ingresá a tu cuenta de administración o complejo</p>
        </div>

        <div className="bg-[#0C1517] border border-[#16272a] rounded-3xl p-7 sm:p-9 shadow-2xl space-y-6">
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs sm:text-sm text-[#F1F5F3] font-semibold">Correo Electrónico</label>
              <div className="relative">
                <Mail className="h-5 w-5 text-[#8A9B95] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#06100E] border border-[#1a2e32] rounded-xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-[#F1F5F3] placeholder-[#8A9B95]/50 focus:outline-none focus:border-[#00D084] transition"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs sm:text-sm text-[#F1F5F3] font-semibold">Contraseña</label>
              <div className="relative">
                <Lock className="h-5 w-5 text-[#8A9B95] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#06100E] border border-[#1a2e32] rounded-xl pl-11 pr-4 py-3.5 text-xs sm:text-sm text-[#F1F5F3] placeholder-[#8A9B95]/50 focus:outline-none focus:border-[#00D084] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-[#00D084] hover:bg-[#4ADE80] disabled:opacity-50 text-[#06100E] font-black py-3.5 sm:py-4 rounded-xl text-sm sm:text-base transition shadow-xl shadow-[#00D084]/20 hover:scale-[1.01]"
            >
              <span>{loading ? "Verificando..." : "Iniciar Sesión"}</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
