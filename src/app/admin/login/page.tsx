"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles, KeyRound, Check } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@furnix.studio");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if already authenticated
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/admin/check");
        if (res.ok) {
          router.replace("/admin");
          return;
        }
      } catch (err) {
        // Not authenticated
      } finally {
        setCheckingAuth(false);
      }
    }
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin");
      } else {
        setError(data.error || "Authentication failed. Please verify credentials.");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    setEmail("admin@furnix.studio");
    setPassword("admin");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#F7F4ED] flex items-center justify-center text-[#141210] font-sans">
        <div className="flex items-center space-x-3 text-sm text-[#7A7367]">
          <div className="w-4 h-4 rounded-full border-2 border-[#DDD6CA] border-t-[#141210] animate-spin" />
          <span>Verifying Studio Credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#141210] flex flex-col justify-between selection:bg-[#141210] selection:text-white font-sans relative overflow-hidden">
      {/* Ambient Warm Radial Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(220,210,195,0.45)_0%,_transparent_70%)] pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 p-6 sm:p-8 flex items-center justify-between border-b border-[#E6DFD5] bg-[#FAF8F5]/80 backdrop-blur-md">
        <Link href="/" className="inline-flex items-center space-x-3 group">
          <div className="w-7 h-7 rounded-full bg-[#141210] text-[#FAF8F5] flex items-center justify-center font-bold text-xs tracking-tight transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
              <path d="M12 2L4 9v13h16V9l-8-7zm0 3.2L18 10v10H6V10l6-4.8z" />
            </svg>
          </div>
          <span className="font-sans text-base font-bold tracking-[0.08em] text-[#141210]">
            FURNIX
          </span>
          <span className="text-[#8C8477] text-xs">/ Studio Admin</span>
        </Link>

        <Link
          href="/"
          className="text-xs text-[#7A7367] hover:text-[#141210] transition-colors flex items-center space-x-1 font-medium"
        >
          <span>Return to Storefront</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Center Login Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white border border-[#E6DFD5] p-8 sm:p-10 shadow-[0_12px_40px_rgba(20,18,16,0.06)] relative space-y-8 rounded-2xl">
          
          {/* Header */}
          <div className="space-y-2 text-center">
            <span className="inline-block text-[10px] uppercase tracking-[0.22em] font-bold text-[#8C8477]">
              ARCHIVAL ACCESS
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#141210] font-normal tracking-tight">
              Admin Studio Login
            </h1>
            <p className="font-sans text-xs text-[#7A7367] leading-relaxed">
              Sign in to manage catalog products, live inventory, pricing, and 3D specifications.
            </p>
          </div>

          {/* Quick Demo Credentials Badge */}
          <div className="p-3.5 bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                PRE-SET CREDENTIALS
              </span>
              <span className="text-[#141210] font-mono text-[11px] font-medium">
                admin@furnix.studio · admin
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-[10px] uppercase font-bold text-[#BA4C35] hover:text-[#9A3824] transition-colors cursor-pointer"
            >
              Autofill
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl leading-relaxed">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#7A7367] font-semibold">
                ADMIN EMAIL / USERNAME
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@furnix.studio or admin"
                  required
                  className="w-full bg-[#FAF8F5] border border-[#DDD6CA] text-[#141210] placeholder-[#8C8477] text-xs sm:text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#141210] focus:ring-1 focus:ring-[#141210] focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#7A7367] font-semibold">
                SECURITY PASSWORD
              </label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#FAF8F5] border border-[#DDD6CA] text-[#141210] placeholder-[#8C8477] text-xs sm:text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-[#141210] focus:ring-1 focus:ring-[#141210] focus:bg-white transition-colors font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#141210] hover:bg-black text-[#FAF8F5] text-xs font-bold uppercase tracking-[0.18em] rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <span>ENTER ADMIN STUDIO</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="pt-2 border-t border-[#E6DFD5] flex items-center justify-center space-x-2 text-[10px] text-[#7A7367]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>MongoDB Atlas Cluster Protected · Furnix Security</span>
          </div>

        </div>
      </main>

      {/* Footer Colophon */}
      <footer className="relative z-10 p-6 text-center text-[11px] text-[#7A7367] border-t border-[#E6DFD5] bg-[#FAF8F5]/80">
        © 2026 FURNIX Studio Inc. Archival Content Management System.
      </footer>
    </div>
  );
}
