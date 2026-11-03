import React from "react";
import Link from "next/link";
import { ArrowRight, Truck } from "lucide-react";

interface HeroSectionProps {
  children?: React.ReactNode;
}

export function HeroSection({ children }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-2 lg:py-4"
      aria-label="Contemporary Furniture Showcase"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Bento Column (Spans 7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-5 justify-between">
          {/* Main Headline Card */}
          <div className="bg-white rounded-[2rem] p-8 sm:p-12 border border-[#E6E1D8] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between flex-1">
            <div>
              {/* Season Pill Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-[#F5F2EB] rounded-full text-xs font-semibold text-[#191816] w-fit mb-8">
                <span className="w-2 h-2 rounded-full bg-[#2D5BFF]" />
                <span>New season · 9 pieces just landed</span>
              </div>

              {/* Bold Editorial Headline */}
              <h1 className="font-sans text-4xl sm:text-5xl lg:text-[58px] font-bold tracking-tight text-[#191816] leading-[1.06] max-w-xl">
                Calm objects for slow homes.
              </h1>

              {/* Refined Subtitle */}
              <p className="font-sans text-sm sm:text-base text-[#6B665E] leading-relaxed max-w-md mt-6 font-normal">
                Solid oak, wool and clay from small workshops. Pieces that get better the longer you live with them.
              </p>
            </div>

            {/* CTAs & Testimonial Footer */}
            <div className="mt-10 pt-2 flex flex-wrap items-center justify-between gap-6 border-t border-[#F2EFE9]/60">
              {/* Pill Action Buttons */}
              <div className="flex items-center space-x-3">
                <Link
                  href="#collections"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 bg-[#1A1A1A] text-white rounded-full text-xs font-semibold hover:bg-black transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]"
                >
                  <span>Shop the edit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="#collections"
                  className="px-6 py-3.5 border border-[#E0DCD3] rounded-full text-xs font-semibold text-[#191816] hover:bg-[#F2EFE9] transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#191816]"
                >
                  Explore lighting
                </Link>
              </div>

              {/* Customer Rating Cluster */}
              <div className="flex items-center space-x-3">
                <div className="flex -space-x-2 overflow-hidden">
                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#D8E2D0] flex items-center justify-center text-[10px] font-bold text-[#191816]">
                    A
                  </div>
                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#EFE5CC] flex items-center justify-center text-[10px] font-bold text-[#191816]">
                    M
                  </div>
                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#CBD7C2] flex items-center justify-center text-[10px] font-bold text-[#191816]">
                    S
                  </div>
                </div>
                <div className="text-[11px] font-medium text-[#6B665E]">
                  <span className="text-[#191816] font-semibold">★ 4.9 average</span>
                  <span className="block text-[10px] text-[#6B665E]">from 2,184 homes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Two Complementary Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Lighting Accent Card (Soft Sand Tone) */}
            <div className="bg-[#EFE5CC] rounded-[2rem] p-6 sm:p-7 border border-[#E6DCBF] flex flex-col justify-between h-[190px] relative overflow-hidden group hover:border-[#D8CEA8] transition-colors">
              <div>
                <span className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-[#191816]/60 block mb-1">
                  LIGHTING
                </span>
                <h3 className="font-sans text-xl font-bold text-[#191816]">Soft light</h3>
                <span className="font-sans text-xs text-[#191816]/75 mt-0.5 inline-block group-hover:translate-x-0.5 transition-transform">
                  3 pieces ↗
                </span>
              </div>

              {/* Decorative Minimalist Lantern Illustration */}
              <div className="absolute right-4 bottom-2 w-28 h-28 pointer-events-none opacity-90">
                <svg viewBox="0 0 100 100" className="w-full h-full text-[#191816]/20 fill-current">
                  <ellipse cx="50" cy="55" rx="35" ry="30" />
                  <line x1="50" y1="5" x2="50" y2="25" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M 25 55 Q 50 35 75 55 Q 50 75 25 55" fill="none" stroke="currentColor" strokeWidth="0.8" />
                  <path d="M 30 55 Q 50 40 70 55 Q 50 70 30 55" fill="none" stroke="currentColor" strokeWidth="0.8" />
                </svg>
              </div>
            </div>

            {/* Delivery Assurance Card (Clean White) */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-7 border border-[#E6E1D8] flex flex-col justify-between h-[190px] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div>
                <span className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase text-[#191816]/60 block mb-1">
                  DELIVERY
                </span>
                <h3 className="font-sans text-xl font-bold text-[#191816]">Free over $150</h3>
                <p className="font-sans text-xs text-[#6B665E] mt-1">Dispatched in 48h. 30-night trial.</p>
              </div>

              {/* Transit Tracker Graphic with Blue Van Icon */}
              <div className="pt-4 border-t border-[#F2EFE9] flex items-center justify-between">
                <div className="flex-1 border-t-2 border-dotted border-[#D8D2C6] relative mr-4">
                  <div className="absolute -top-1.5 left-0 w-3 h-3 rounded-full bg-[#191816]" />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#2D5BFF] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Bento Column: Muted Sage Hero Showcase (Spans 5 cols on desktop) */}
        <div className="lg:col-span-5 bg-[#D8E2D0] rounded-[2rem] p-7 sm:p-9 border border-[#CBD7C2] relative flex flex-col justify-between min-h-[580px] lg:min-h-[660px] shadow-[0_2px_16px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Top Bar: Title & Circular Craft Stamp */}
          <div className="flex items-start justify-between z-10">
            <div>
              <span className="font-sans text-[10px] font-bold tracking-[0.22em] uppercase text-[#191816]/65 block mb-1">
                BESTSELLER
              </span>
              <h2 className="font-sans text-2xl font-bold text-[#191816] tracking-tight">
                Bolle Lounge Chair
              </h2>
              <span className="font-sans text-xs text-[#191816]/60 block mt-0.5">
                Shack15 Ferry Edition
              </span>
            </div>

            {/* Circular Stamp / Artisan Seal */}
            <div className="w-14 h-14 rounded-full border border-[#191816]/20 flex flex-col items-center justify-center text-center p-1 relative flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 animate-spin-slow pointer-events-none">
                <path
                  id="circlePath"
                  d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                  fill="none"
                />
                <text className="text-[9.5px] uppercase font-bold tracking-[0.18em] fill-[#191816]/75">
                  <textPath href="#circlePath">
                    SOLID OAK · WOOL BOUCLÉ ·
                  </textPath>
                </text>
              </svg>
              <span className="text-[11px] text-[#191816]">🌱</span>
            </div>
          </div>

          {/* 3D Model Reception Anchor: Exact Hero Target */}
          <div
            id="hero-3d-stage"
            className="w-full flex-1 min-h-[380px] sm:min-h-[440px] relative flex items-center justify-center my-2 pointer-events-none"
            aria-hidden="true"
          >
            {children}
          </div>

          {/* Bottom Bar: Price, Details, and Add to Bag Pill */}
          <div className="flex items-center justify-between pt-4 border-t border-[#CBD7C2]/70 z-10">
            <span className="font-sans text-2xl font-bold text-[#191816]">$890</span>

            <div className="flex items-center space-x-3">
              <Link
                href="#collections"
                className="text-xs font-semibold text-[#191816] hover:underline px-3 py-2 transition-colors"
              >
                Details
              </Link>
              <button
                type="button"
                className="px-6 py-2.5 bg-[#1A1A1A] text-white rounded-full text-xs font-semibold hover:bg-black transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1A]"
              >
                Add to bag
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
