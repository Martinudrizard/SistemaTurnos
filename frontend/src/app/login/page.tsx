"use client";

import React, { useState } from "react";
import { Trophy, Lock, Mail, ArrowRight, ShieldCheck, Building2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://padel-saas-backend-production.up.railway.app/api/auth/login", {
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

  const setDemoSuperAdmin = () => {
    setEmail("admin@padelsaas.com");
    setPassword("admin123");
  };

  const setDemoClubOwner = () => {
    setEmail("esteban@latoska.com.ar");
    setPassword("padel123");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/10">
            <Trophy className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">PadelSaaS Core</h1>
          <p className="text-xs text-slate-400">Ingresá a tu panel de administración o complejo</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Correo Electrónico</label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Contraseña</label>
              <div className="relative">
                <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
            >
              <span>{loading ? "Verificando..." : "Iniciar Sesión"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <p className="text-[11px] text-slate-400 text-center font-medium">Accesos rápidos:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={setDemoSuperAdmin}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left text-xs transition space-y-0.5"
              >
                <div className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                  <ShieldCheck className="h-3 w-3" /> Super Admin
                </div>
                <div className="text-[10px] text-slate-400">admin@padelsaas.com</div>
              </button>

              <button
                type="button"
                onClick={setDemoClubOwner}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-left text-xs transition space-y-0.5"
              >
                <div className="flex items-center gap-1 text-blue-400 font-bold text-[11px]">
                  <Building2 className="h-3 w-3" /> Dueño Complejo
                </div>
                <div className="text-[10px] text-slate-400">esteban@latoska...</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
