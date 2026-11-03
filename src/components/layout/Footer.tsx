"use client";

import React from "react";
import Link from "next/link";
import { ArrowUp, Heart, ShoppingBag } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    if (typeof window !== "undefined" && (window as any).lenis) {
      (window as any).lenis.scrollTo(0, { duration: 1.4 });
    } else if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative z-20 bg-[#0B0A09] text-[#EBE7E0] border-t border-[#1C1A18] select-none pt-20 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 px-6 sm:px-12 lg:px-20 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Editorial Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 pb-12 sm:pb-16 border-b border-[#1C1A18]">
          <div className="space-y-4 max-w-lg">
            <Link
              href="/"
              className="inline-flex items-center space-x-3 group focus:outline-none"
              aria-label="FURNIX Studio Home"
            >
              <div className="w-8 h-8 rounded-full bg-[#FAF8F5] text-[#121110] flex items-center justify-center font-bold text-xs tracking-tight transition-transform duration-300 group-hover:scale-110 shadow-sm">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M12 2L4 9v13h16V9l-8-7zm0 3.2L18 10v10H6V10l6-4.8z" />
                </svg>
              </div>
              <span className="font-sans text-2xl sm:text-3xl font-bold tracking-[0.12em] text-[#FAF8F5]">
                FURNIX
              </span>
            </Link>
            <p className="font-sans text-sm sm:text-base text-[#8C8477] leading-relaxed font-light">
              Calm objects for slow homes. Sculptural, enduring seating handcrafted with architectural restraint and honest materials.
            </p>
          </div>

          {/* Clean Essential Navigation & Back to Top */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-start lg:items-center gap-6 sm:gap-8">
            <nav
              className="flex flex-wrap items-center gap-6 sm:gap-8 font-sans text-xs uppercase tracking-widest font-semibold text-[#A69E92]"
              aria-label="Footer Navigation"
            >
              <Link
                href="/products"
                className="hover:text-[#FAF8F5] transition-colors py-1"
              >
                Collections
              </Link>
              <Link
                href="/cart"
                className="inline-flex items-center space-x-2 hover:text-[#FAF8F5] transition-colors py-1"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Bag</span>
              </Link>
              <Link
                href="/wishlist"
                className="inline-flex items-center space-x-2 hover:text-[#FAF8F5] transition-colors py-1"
              >
                <Heart className="w-3.5 h-3.5 text-[#E04F44]" />
                <span>Wishlist</span>
              </Link>
              <Link
                href="/admin"
                className="text-[#6E675D] hover:text-[#FAF8F5] transition-colors py-1"
              >
                Studio Admin
              </Link>
            </nav>

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-white/20 text-xs text-[#A69E92] hover:text-[#FAF8F5] hover:border-white/50 hover:bg-white/5 transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
              aria-label="Scroll back to top"
            >
              <span className="text-[11px] uppercase tracking-wider font-semibold">Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Grand Low-Opacity Typographic Wordmark Watermark */}
        <div className="py-10 sm:py-16 select-none pointer-events-none overflow-hidden">
          <p className="font-sans font-black tracking-[-0.04em] text-white/[0.04] text-[18vw] sm:text-[16vw] lg:text-[14vw] leading-none text-center">
            FURNIX
          </p>
        </div>

        {/* Bottom Colophon Bar */}
        <div className="pt-8 border-t border-[#1C1A18] flex flex-col sm:flex-row items-center justify-between text-xs text-[#635D54] font-sans gap-4">
          <div className="flex items-center space-x-3">
            <span>© 2026 FURNIX Studio Inc.</span>
            <span>·</span>
            <span>All rights reserved</span>
          </div>
          <p className="text-[11px] text-[#524D46] tracking-wide">
            Designed for mindful, enduring living spaces.
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
