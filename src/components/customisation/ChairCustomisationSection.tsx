"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CHAIR_COLOR_LIST,
  ChairColorId,
  ChairColorOption,
  getChairColor,
  setChairColor,
  subscribeToChairColor,
} from "@/lib/customisationStore";

/**
 * Premium 3D Chair Colour Customisation Section.
 * Exact visual recreation matching the reference design:
 * - Light, warm grey studio background (#D8D8D6) with subtle radial spotlight
 * - Left third: "Real comfort" headline in large bold white sans-serif, description copy, white pill button
 * - Centre: Prominently sized 3D Chair with grounded contact shadow (#customisation-chair-target)
 * - Right: Exactly 3 circular swatches in one horizontal row (Yellow, Light Green, Grey) with thin outline and colour label
 */
export function ChairCustomisationSection() {
  const [activeColor, setActiveColor] = useState<ChairColorOption>(getChairColor());

  useEffect(() => {
    // Keep local component state in sync with global customisation store
    const unsubscribe = subscribeToChairColor((newColor) => {
      setActiveColor(newColor);
    });
    return unsubscribe;
  }, []);

  const handleSelectColor = useCallback((id: ChairColorId) => {
    setChairColor(id);
  }, []);

  return (
    <section
      id="customisation"
      style={{
        backgroundColor: activeColor.bgHex,
        backgroundImage:
          "radial-gradient(ellipse at 52% 48%, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.10) 45%, rgba(0, 0, 0, 0.04) 100%)",
        transition: "background-color 500ms ease",
      }}
      className="w-full min-h-screen lg:h-screen lg:min-h-[700px] relative overflow-hidden select-none flex items-center justify-center py-16 lg:py-0"
      aria-label="Chair Colour Customisation"
    >
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14">
        {/* Layout Grid: Left Content (col-span-4), Center 3D Model (col-span-5), Right Circular Swatches (col-span-3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">
          
          {/* Left Column — "Real comfort" Editorial Content with Pure Black Typography */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-center z-10 order-1">
            <h2 className="font-sans text-5xl sm:text-6xl md:text-7xl lg:text-[76px] xl:text-[82px] font-bold text-black leading-[1.02] tracking-tight">
              Real
              <br />
              comfort
            </h2>

            <p className="font-sans text-xs sm:text-sm md:text-base text-black/80 leading-relaxed max-w-[400px] font-normal mt-5 sm:mt-6">
              We create designer chairs that complement your interior. Each piece combines architectural form, tactile comfort, and visual harmony.
            </p>

            <div className="mt-7 sm:mt-9">
              <Link
                href="#collections"
                className="inline-flex items-center justify-center px-8 sm:px-9 py-3.5 sm:py-4 bg-white text-black hover:bg-neutral-50 rounded-full text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-98"
              >
                View all collections
              </Link>
            </div>
          </div>

          {/* Centre Column — 3D Chair Destination Container (Enlarged and Centred) */}
          <div className="lg:col-span-5 xl:col-span-5 flex items-center justify-center relative order-2">
            <div
              id="customisation-chair-target"
              className="w-full h-[420px] sm:h-[480px] md:h-[520px] lg:h-[580px] max-h-[72vh] relative flex items-center justify-center"
              aria-label="3D Chair Colourway Preview"
            />
          </div>

          {/* Right Column — Tactile Borderless Color Swatches without Color Name */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col items-center lg:items-end justify-center z-10 order-3">
            <div
              className="flex flex-row items-center gap-3.5 sm:gap-4 md:gap-5 flex-nowrap"
              role="radiogroup"
              aria-label="Select upholstery colourway"
            >
              {CHAIR_COLOR_LIST.map((color) => {
                const isSelected = activeColor.id === color.id;

                return (
                  <button
                    key={color.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Select ${color.name} colourway`}
                    onClick={() => handleSelectColor(color.id)}
                    className={`group relative rounded-full transition-all duration-300 cursor-pointer focus:outline-none shrink-0 ${
                      isSelected
                        ? "w-14 h-14 sm:w-16 sm:h-16 shadow-[0_12px_28px_rgba(0,0,0,0.28)] scale-110 z-10"
                        : "w-11 h-11 sm:w-13 sm:h-13 shadow-[0_6px_16px_rgba(0,0,0,0.14)] opacity-85 hover:opacity-100 hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: color.swatchHex,
                    }}
                  >
                    {/* Subtle luxury surface specular highlight giving tangible ceramic/leather dome feel */}
                    <div
                      className="w-full h-full rounded-full pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle at 35% 32%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.10) 50%, rgba(0, 0, 0, 0.18) 100%)",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default ChairCustomisationSection;
