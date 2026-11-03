"use client";

import React from "react";

/**
 * Clean, Understated Architectural Canvas.
 * Plain warm ivory showroom environment (#F7F4ED) with zero background image:
 * - Seamless warm ivory base with zero horizontal division or floor seams
 * - Subtle, soft ambient daylight gradation from upper right
 * - Understated ground warmth under the chair
 * - Keeps the 3D chair as the pure sculptural focal highlight
 */
export function HeroShowroomBackdrop() {
  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* 1. Base Canvas Warm Ivory Tone */}
      <div className="absolute inset-0 bg-[#F7F4ED]" />

      {/* 2. Soft Ambient Daylight Vignette from Upper Right */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 85% 15%, rgba(255, 253, 248, 0.85) 0%, rgba(247, 244, 237, 0) 70%)",
        }}
      />

      {/* 3. Subtle Seamless Ground Depth */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 35% at 65% 90%, rgba(232, 224, 212, 0.35) 0%, rgba(247, 244, 237, 0) 70%)",
        }}
      />
    </div>
  );
}

export default HeroShowroomBackdrop;
