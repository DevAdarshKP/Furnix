"use client";

import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export function AtelierStatementSection() {
  return (
    <section
      id="atelier-statement"
      className="relative w-full bg-[#0D0C0B] text-white select-none overflow-hidden h-screen min-h-[600px] max-h-[760px] lg:max-h-[800px] flex items-center justify-center py-4 sm:py-6"
      aria-label="Atelier Timeless Furniture Statement"
    >
      {/* Background ambient lighting for depth */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.035)_0%,_transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 relative z-10 flex flex-col justify-between h-full py-2 sm:py-3 lg:py-4">
        
        {/* TOP ROW: Green Chair Card (Left) & Poetic Narrative (Right) */}
        <div className="flex items-start justify-between gap-4 shrink-0">
          {/* Top Left: Green Armchair Card */}
          <div className="w-[110px] sm:w-[125px] lg:w-[145px] xl:w-[160px] aspect-square rounded-[1.25rem] lg:rounded-[1.5rem] overflow-hidden border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.5)] bg-[#191816]/60 backdrop-blur-xs shrink-0">
            <Image
              src="/images/atelier_green_armchair.jpg"
              alt="Atelier Olive Green Armchair"
              width={180}
              height={180}
              className="w-full h-full object-cover"
              priority
            />
          </div>

          {/* Top Right: Narrative Text */}
          <p className="font-sans text-xs lg:text-[13px] text-[#A6A097] max-w-[280px] lg:max-w-[320px] leading-relaxed text-right font-normal pt-1">
            At Atelier, we believe exceptional furniture is an investment that enhances your comfort and elevates your home&apos;s ambiance.
          </p>
        </div>

        {/* CENTER ROW: Signature Typography with Anchored 3D Chair Container */}
        {/* Desktop View (>= 1024px) */}
        <div className="hidden lg:flex flex-col items-center justify-center my-auto select-none">
          <div className="font-sans text-white font-medium tracking-[-0.035em] text-[50px] lg:text-[60px] xl:text-[70px] 2xl:text-[76px] leading-[1.08] inline-block">
            {/* Line 1 */}
            <div className="text-left w-full">Atelier creates timeless</div>

            {/* Lines 2 & 3: 3-column layout */}
            <div className="flex items-center justify-start mt-1">
              {/* Left Column: furniture / from pre */}
              <div className="flex flex-col items-start pr-2.5 lg:pr-3.5 shrink-0">
                <span className="whitespace-nowrap">furniture</span>
                <span className="whitespace-nowrap">from pre</span>
              </div>

              {/* Center Column: Squircle container for 3D Chair */}
              <div
                id="atelier-chair-target"
                className="relative z-10 w-[125px] lg:w-[140px] xl:w-[160px] h-[130px] lg:h-[148px] xl:h-[168px] bg-[#DDD7CD] rounded-[1.35rem] lg:rounded-[1.65rem] border border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden shrink-0 flex items-center justify-center mx-1 lg:mx-2 select-none"
              >
                {/* Soft natural radial backdrop */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#EDE7DE_0%,_#CBC4B7_100%)] opacity-95 pointer-events-none" />
                <div className="absolute inset-0 rounded-[1.35rem] lg:rounded-[1.65rem] ring-1 ring-white/30 pointer-events-none" />
              </div>

              {/* Right Column: expertly crafted / mium materials. */}
              <div className="flex flex-col items-start pl-2.5 lg:pl-3.5 shrink-0">
                <span className="whitespace-nowrap">expertly crafted</span>
                <span className="whitespace-nowrap">mium materials.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tablet & Mobile View (< 1024px) */}
        <div className="lg:hidden my-4 flex flex-col items-start space-y-3">
          <h2 className="font-sans text-white font-medium tracking-[-0.03em] text-[32px] sm:text-[44px] md:text-[54px] leading-[1.12]">
            Atelier creates timeless furniture expertly crafted from{" "}
            <span className="inline-block align-middle my-1">
              <span
                id="atelier-chair-target-mobile"
                className="inline-flex w-[110px] sm:w-[135px] h-[120px] sm:h-[145px] bg-[#DDD7CD] rounded-2xl border border-white/20 shadow-xl overflow-hidden relative align-middle mx-2"
              >
                <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#EDE7DE_0%,_#CBC4B7_100%)] opacity-95 pointer-events-none" />
              </span>
            </span>{" "}
            premium materials.
          </h2>
        </div>

        {/* BOTTOM ROW: Learn More CTA Button (Left) & Red Chair Card (Right) */}
        <div className="flex items-end justify-between gap-4 shrink-0">
          {/* Bottom Left: Pill Button */}
          <div className="pb-1">
            <button
              type="button"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white hover:bg-[#F4EFEA] text-[#141210] rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Learn More</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* Bottom Right: Terracotta/Red Armchair Card */}
          <div className="w-[110px] sm:w-[125px] lg:w-[145px] xl:w-[160px] aspect-square rounded-[1.25rem] lg:rounded-[1.5rem] overflow-hidden border border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.5)] bg-[#191816]/60 backdrop-blur-xs shrink-0">
            <Image
              src="/images/atelier_red_armchair.jpg"
              alt="Atelier Terracotta Armchair"
              width={180}
              height={180}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </div>
    </section>
  );
}

export default AtelierStatementSection;
