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
      <div className="min-h-screen bg-[#0D0C0B] flex items-center justify-center text-white font-sans">
        <div className="flex items-center space-x-3 text-sm text-[#8E877C]">
          <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <span>Verifying Studio Credentials...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0C0B] text-[#EBE7E0] flex flex-col justify-between selection:bg-white selection:text-black font-sans relative overflow-hidden">
      {/* Ambient Radial Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.04)_0%,_transparent_70%)] pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 p-6 sm:p-8 flex items-center justify-between border-b border-[#23211F]">
        <Link href="/" className="inline-flex items-center space-x-3 group">
          <div className="w-7 h-7 rounded-full bg-[#FAF8F5] text-[#121110] flex items-center justify-center font-bold text-xs tracking-tight transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
              <path d="M12 2L4 9v13h16V9l-8-7zm0 3.2L18 10v10H6V10l6-4.8z" />
            </svg>
          </div>
          <span className="font-sans text-base font-bold tracking-[0.08em] text-[#FAF8F5]">
            FURNIX
          </span>
          <span className="text-[#6B655D] text-xs">/ Studio Admin</span>
        </Link>

        <Link
          href="/"
          className="text-xs text-[#8E877C] hover:text-[#FAF8F5] transition-colors flex items-center space-x-1"
        >
          <span>Return to Storefront</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      {/* Center Login Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-[#141312] border border-[#262421] p-8 sm:p-10 shadow-2xl relative space-y-8">
          
          {/* Header */}
          <div className="space-y-2 text-center">
            <span className="inline-block text-[10px] uppercase tracking-[0.22em] font-bold text-[#8C8477]">
              ARCHIVAL ACCESS
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] font-normal tracking-tight">
              Admin Studio Login
            </h1>
            <p className="font-sans text-xs text-[#7D766B] leading-relaxed">
              Sign in to manage catalog products, live inventory, pricing, and 3D specifications.
            </p>
          </div>

          {/* Quick Demo Credentials Badge */}
          <div className="p-3.5 bg-[#1B1A18] border border-[#2E2B27] rounded-none flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider text-[#A69E92] font-semibold block">
                PRE-SET CREDENTIALS
              </span>
              <span className="text-[#EBE7E0] font-mono text-[11px]">
                admin@furnix.studio · admin
              </span>
            </div>
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-[10px] uppercase font-bold text-[#BA4C35] hover:text-[#E25C42] transition-colors cursor-pointer"
            >
              Autofill
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-[#2A1614] border border-[#5C231D] text-[#E57368] text-xs leading-relaxed">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#8C8477] font-semibold">
                ADMIN EMAIL / USERNAME
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@furnix.studio or admin"
                  required
                  className="w-full bg-[#1A1817] border border-[#302D29] text-[#FAF8F5] placeholder-[#635E56] text-xs sm:text-sm px-4 py-3 rounded-none focus:outline-none focus:border-[#FAF8F5] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-[0.16em] text-[#8C8477] font-semibold">
                SECURITY PASSWORD
              </label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#1A1817] border border-[#302D29] text-[#FAF8F5] placeholder-[#635E56] text-xs sm:text-sm px-4 py-3 rounded-none focus:outline-none focus:border-[#FAF8F5] transition-colors font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#FAF8F5] hover:bg-white text-[#121110] text-xs font-bold uppercase tracking-[0.18em] transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
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
          <div className="pt-2 border-t border-[#23211F] flex items-center justify-center space-x-2 text-[10px] text-[#6B655D]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>MongoDB Atlas Cluster Protected · Furnix Security</span>
          </div>

        </div>
      </main>

      {/* Footer Colophon */}
      <footer className="relative z-10 p-6 text-center text-[11px] text-[#6B655D] border-t border-[#23211F]">
        © 2026 FURNIX Studio Inc. Archival Content Management System.
      </footer>
    </div>
  );
}
