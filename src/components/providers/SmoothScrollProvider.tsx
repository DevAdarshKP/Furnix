"use client";

import React, { useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import type { LenisRef } from "lenis/react";
import { getRegisteredGSAP } from "@/lib/animation";

function ScrollTriggerSync() {
  const { ScrollTrigger } = getRegisteredGSAP();

  // Keep GSAP ScrollTrigger in lockstep with Lenis smooth scrolling
  useLenis((lenis) => {
    if (lenis && typeof window !== "undefined") {
      (window as any).lenis = lenis;
    }
    ScrollTrigger.update();
  });

  return null;
}

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const { gsap, ScrollTrigger } = getRegisteredGSAP();

    // Direct Lenis RAF loop through GSAP Ticker for frame-perfect scroll & trigger alignment
    function update(time: number) {
      if (lenisRef.current?.lenis) {
        (window as any).lenis = lenisRef.current.lenis;
        lenisRef.current.lenis.raf(time * 1000);
      }
    }

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Initial ScrollTrigger calibration once smooth scroll DOM is mounted
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
      if (lenisRef.current?.lenis) {
        (window as any).lenis = lenisRef.current.lenis;
      }
    }, 120);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }

    return () => {
      gsap.ticker.remove(update);
      clearTimeout(timer);
      delete (window as any).lenis;
    };
  }, []);

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        autoRaf: false, // Driven by GSAP ticker for synchronous updates
        lerp: 0.1, // Calm, luxurious Scandinavian inertia
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        anchors: true, // Smooth glide on hash anchor clicks
      }}
    >
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}

export { useLenis };
