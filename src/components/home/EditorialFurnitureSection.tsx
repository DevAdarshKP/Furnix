"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  "Dining",
  "Office",
  "Bedroom",
  "Living Room",
  "Lighting",
];

/**
 * Editorial Typography & 3D Showcase Section.
 * Recreates the exact high-end Scandinavian editorial lookbook reference:
 * - Oversized typography ("Crafted" / "for living")
 * - Central nearly square (1:1) rounded container with the authentic 3D armchair model filling 80-90%
 * - Supporting copy: "Discover premium furniture designed to elevate your home with style, comfort, and durability."
 * - Compact "Explore Collection →" dark pill button
 * - Clean edge-to-edge secondary furniture image card in lower-left (no nested double frames)
 * - Upper-right category navigation (Office emphasized)
 */
export function EditorialFurnitureSection() {
  const [activeCategory, setActiveCategory] = useState("Office");

  return (
    <section
      id="crafted-editorial"
      className="w-full bg-[#F9F7EF] text-[#191816] pt-12 sm:pt-16 lg:pt-18 pb-20 sm:pb-24 lg:pb-32 relative z-10 select-none overflow-x-clip shadow-[0_-24px_48px_rgba(20,18,16,0.06)]"
      aria-label="Crafted for living - Editorial Collection Showcase"
    >
      <div id="crafted" className="absolute top-0 left-0 w-full h-1 pointer-events-none" aria-hidden="true" />
      <div className="max-w-[1520px] mx-auto px-6 sm:px-8 lg:px-10 xl:px-12 relative">
        {/* DESKTOP EXACT 1:1 EDITORIAL COMPOSITION (Screens >= 1024px) */}
        <div className="hidden lg:block relative w-full min-h-[720px] lg:min-h-[780px] xl:min-h-[850px] 2xl:min-h-[900px]">
          {/* 1. Oversized Top Headline: "Crafted" (Stacking: z-10, sits behind the central container's top-left corner) */}
          <div className="absolute top-[30px] lg:top-[40px] xl:top-[48px] left-[3.5%] z-10 pointer-events-none whitespace-nowrap">
            <h2 className="font-sans text-[115px] lg:text-[145px] xl:text-[185px] 2xl:text-[210px] font-bold text-[#141210] tracking-[-0.05em] leading-[0.82]">
              Crafted
            </h2>
          </div>

          {/* 2. Left Supporting Copy & Collection CTA Button (Stacking: z-30, interactive and in front) */}
          <div className="absolute top-[180px] lg:top-[225px] xl:top-[270px] left-[3.5%] z-30 max-w-[280px] xl:max-w-[310px] space-y-6">
            <p className="font-sans text-sm xl:text-base text-[#4A453E] leading-relaxed font-normal">
              Discover premium furniture designed to elevate your home with style, comfort, and durability.
            </p>

            <div>
              <Link
                href="/products"
                className="inline-flex items-center space-x-2.5 px-6 py-3.5 bg-[#141210] hover:bg-black text-white rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141210]"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 3. Lower-Left Secondary Furniture Card */}
          <div className="absolute top-[340px] lg:top-[420px] xl:top-[490px] left-[3.5%] z-10">
            <div className="w-[190px] lg:w-[230px] xl:w-[270px] aspect-square rounded-[1.75rem] xl:rounded-[2rem] overflow-hidden border border-[#DDD3C4]/60 shadow-xs">
              <Image
                src="/images/secondary-chair.webp"
                alt="Scandinavian Leather Armchair"
                width={270}
                height={270}
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          </div>

          {/* 4. Central Square Product Container with Authentic 3D Chair Model (Stacking: z-10, sits behind z-20 chair canvas) */}
          <div
            id="editorial-chair-target"
            className="absolute left-[40%] top-[120px] lg:top-[145px] xl:top-[170px] z-10 w-[360px] lg:w-[430px] xl:w-[485px] aspect-square bg-[#E4DCCF] rounded-[2.8rem] xl:rounded-[3.2rem] border border-[#DDD3C4]/70 shadow-[0_4px_30px_rgba(0,0,0,0.025)] overflow-hidden flex items-center justify-center relative"
          >
            <div className="absolute top-6 left-7 z-10 pointer-events-none">
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#8C8477] font-semibold">
                EDITION · 01
              </span>
            </div>
            <div className="absolute bottom-6 right-7 z-10 pointer-events-none flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#141210]/30" />
              <span className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#8C8477] font-semibold">
                SHACK15 STUDY
              </span>
            </div>
          </div>

          {/* 5. Right-Side Category Navigation (Stacking: z-30, interactive and in front) */}
          <nav
            aria-label="Furniture category selection"
            className="absolute top-[40px] lg:top-[50px] xl:top-[60px] right-[3.5%] z-30 flex flex-col space-y-3.5 lg:space-y-4 xl:space-y-5 text-left"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-sans text-xl lg:text-2xl xl:text-[28px] tracking-tight transition-colors duration-200 text-left focus:outline-none cursor-pointer ${
                  activeCategory === cat
                    ? "font-bold text-[#141210]"
                    : "font-medium text-[#B5ACA1] hover:text-[#141210]"
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* 6. Lower Headline: "for living" (Stacking: z-30, in FRONT of z-20 chair canvas, never obscured) */}
          <div className="absolute top-[430px] lg:top-[515px] xl:top-[590px] left-[41.5%] z-30 pointer-events-none whitespace-nowrap">
            <span className="font-sans text-[88px] lg:text-[116px] xl:text-[150px] 2xl:text-[172px] font-bold text-[#141210] tracking-[-0.045em] leading-[0.82]">
              for living
            </span>
          </div>
        </div>

        {/* TABLET & MOBILE RESPONSIVE EDITORIAL LAYOUT (Screens < 1024px) */}
        <div className="lg:hidden flex flex-col space-y-8 sm:space-y-10">
          {/* 1. "Crafted" Headline & Narrative Subtext & CTA */}
          <div className="space-y-4">
            <h2 className="font-sans text-[56px] sm:text-[76px] md:text-[88px] font-bold text-[#141210] tracking-[-0.04em] leading-[0.88]">
              Crafted
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#4A453E] leading-relaxed max-w-md font-normal">
              Discover premium furniture designed to elevate your home with style, comfort, and durability.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center space-x-2 px-6 py-3.5 bg-[#141210] hover:bg-black text-white rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* 2. Central Square 3D Product Container */}
          <div
            id="editorial-chair-target-mobile"
            className="w-full max-w-[380px] sm:max-w-[440px] mx-auto aspect-square bg-[#E4DCCF] rounded-[2.2rem] sm:rounded-[2.6rem] border border-[#DDD3C4]/80 shadow-[0_4px_24px_rgba(0,0,0,0.025)] overflow-hidden flex items-center justify-center relative"
          >
            <div className="absolute top-5 left-6 z-10 pointer-events-none">
              <span className="font-sans text-[9px] uppercase tracking-[0.18em] text-[#8C8477] font-semibold">
                EDITION · 01
              </span>
            </div>
          </div>

          {/* 3. Lower Headline "for living" */}
          <div className="text-center sm:text-left -mt-4 sm:-mt-6">
            <span className="font-sans text-[48px] sm:text-[68px] md:text-[80px] font-bold text-[#141210] tracking-[-0.04em] leading-[0.88] block">
              for living
            </span>
          </div>

          {/* 4. Category Navigation */}
          <nav
            aria-label="Category filter"
            className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 py-1"
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-sm sm:text-base font-medium tracking-tight transition-colors px-3.5 py-1.5 rounded-full cursor-pointer ${
                  activeCategory === cat
                    ? "font-bold text-[#141210] bg-[#E4DCCF]/80"
                    : "text-[#8C8477] hover:text-[#141210]"
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* 5. Secondary Accent Asset */}
          <div className="pt-2 flex justify-center sm:justify-start">
            <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-[1.75rem] overflow-hidden shadow-xs border border-[#DDD3C4]/60">
              <Image
                src="/images/secondary-chair.webp"
                alt="Scandinavian Leather Armchair"
                width={224}
                height={224}
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditorialFurnitureSection;
