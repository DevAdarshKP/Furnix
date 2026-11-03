"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ChairScrollSequence, ChairScrollSequenceHandle } from "./ChairScrollSequence";
import { HeroShowroomBackdrop } from "./HeroShowroomBackdrop";
import { getRegisteredGSAP, createAnimationContext } from "@/lib/animation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function ChairHeroScroll() {
  const sequenceRef = useRef<ChairScrollSequenceHandle | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef<HTMLDivElement | null>(null);
  const textOriginalRef = useRef<HTMLDivElement | null>(null);
  const textExplodedRef = useRef<HTMLDivElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement | null>(null);
  const heroStageRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(1.0);
  const reducedMotion = useReducedMotion();
  const heroBg = "#F7F4ED";

  // Responsive chair scale targeting maximum sculptural presence with zero clipping
  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      if (w >= 1024) {
        setScale(1.0); // Desktop: maximum safe contained scale
      } else if (w >= 640) {
        setScale(0.96); // Tablet: balanced fit
      } else {
        setScale(0.92); // Mobile: comfortable framing
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Initialize GSAP ScrollTrigger for natural document pinned scrub of the hero explosion
  useEffect(() => {
    if (reducedMotion) return;

    const { ScrollTrigger } = getRegisteredGSAP();
    const track = trackRef.current;
    const pinned = pinnedRef.current;

    if (!track || !pinned) return;

    const cleanup = createAnimationContext(track, () => {
      const updateDimensions = () => {
        const vh = window.innerHeight;
        track.style.height = `${Math.round(vh * 2)}px`;
      };
      updateDimensions();

      ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: () => `+=${track.offsetHeight}`,
        pin: pinned,
        pinSpacing: false,
        scrub: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onToggle: (self) => {
          if (self.isActive) {
            pinned.style.height = "100vh";
          } else {
            pinned.style.height = "";
          }
        },
        onUpdate: (self) => {
          const p = self.progress;

          // Phase 1 (p <= 0.50): Chair explosion scrubs smoothly (Frame 0 to Frame 108)
          // Phase 2 (p > 0.50): Chair holds in exploded state while "Crafted for living" rises over hero
          const pExplode = p <= 0.50 ? p / 0.50 : 1.0;
          sequenceRef.current?.setProgress(pExplode);

          // Synchronized hero text transition:
          // Original state: "Calm objects for mindful spaces."
          // Exploded state: "Form, revealed."
          if (textOriginalRef.current && textExplodedRef.current) {
            // Text 1 fades out between pExplode = 0.12 and 0.42 (as chair visibly starts separating)
            if (pExplode <= 0.12) {
              textOriginalRef.current.style.opacity = "1";
              textOriginalRef.current.style.transform = "translateY(0px)";
              textOriginalRef.current.style.pointerEvents = "auto";
              textOriginalRef.current.setAttribute("aria-hidden", "false");
            } else if (pExplode >= 0.42) {
              textOriginalRef.current.style.opacity = "0";
              textOriginalRef.current.style.transform = "translateY(-10px)";
              textOriginalRef.current.style.pointerEvents = "none";
              textOriginalRef.current.setAttribute("aria-hidden", "true");
            } else {
              const tOut = (pExplode - 0.12) / (0.42 - 0.12);
              const easeOut = tOut * tOut * (3 - 2 * tOut);
              textOriginalRef.current.style.opacity = `${(1 - easeOut).toFixed(3)}`;
              textOriginalRef.current.style.transform = `translateY(-${(easeOut * 10).toFixed(1)}px)`;
              textOriginalRef.current.style.pointerEvents = easeOut < 0.5 ? "auto" : "none";
              textOriginalRef.current.setAttribute("aria-hidden", easeOut > 0.5 ? "true" : "false");
            }

            // Text 2 fades in between pExplode = 0.38 and 0.85 (settles as chair reaches exploded form)
            if (pExplode <= 0.38) {
              textExplodedRef.current.style.opacity = "0";
              textExplodedRef.current.style.transform = "translateY(10px)";
              textExplodedRef.current.style.pointerEvents = "none";
              textExplodedRef.current.setAttribute("aria-hidden", "true");
            } else if (pExplode >= 0.85) {
              textExplodedRef.current.style.opacity = "1";
              textExplodedRef.current.style.transform = "translateY(0px)";
              textExplodedRef.current.style.pointerEvents = "auto";
              textExplodedRef.current.setAttribute("aria-hidden", "false");
            } else {
              const tIn = (pExplode - 0.38) / (0.85 - 0.38);
              const easeIn = tIn * tIn * (3 - 2 * tIn);
              textExplodedRef.current.style.opacity = `${easeIn.toFixed(3)}`;
              textExplodedRef.current.style.transform = `translateY(${((1 - easeIn) * 10).toFixed(1)}px)`;
              textExplodedRef.current.style.pointerEvents = easeIn > 0.5 ? "auto" : "none";
              textExplodedRef.current.setAttribute("aria-hidden", easeIn < 0.5 ? "true" : "false");
            }
          }

          // Fade out scroll prompt at start of exploration
          if (scrollIndicatorRef.current) {
            scrollIndicatorRef.current.style.opacity = p > 0.03 ? "0" : "1";
            scrollIndicatorRef.current.style.pointerEvents = p > 0.03 ? "none" : "auto";
          }
        },
      });
    });

    const handleResize = () => {
      if (track) {
        track.style.height = `${Math.round(window.innerHeight * 2)}px`;
      }
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cleanup();
      window.removeEventListener("resize", handleResize);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={trackRef}
      style={{ backgroundColor: heroBg, transition: "background-color 0.4s ease" }}
      className={`relative w-full z-0 ${reducedMotion
          ? "min-h-[85vh] py-6"
          : "h-[200vh] min-h-[1400px] lg:min-h-[1600px]"
        }`}
    >
      {/* Pinned Viewport Container: sized to remaining viewport height below navbar */}
      <section
        ref={pinnedRef}
        id="hero"
        className="w-full h-[100svh] min-h-[560px] lg:min-h-[620px] relative z-0 overflow-hidden flex flex-col justify-between pt-20 sm:pt-24 pb-5 sm:pb-7 select-none transition-colors duration-500"
        style={{ backgroundColor: heroBg }}
        aria-label="Calm objects for mindful spaces - Interactive exploded view showcase"
      >
        {/* Seamless Warm Ivory Atmosphere (continuous canvas, soft daylight illumination, delicate mullion shadows) */}
        <HeroShowroomBackdrop />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 h-full flex flex-col justify-between">
          {/* Central 2-Column Hero Grid: Left Copy & Right Canvas Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center my-auto flex-1 py-1">
            {/* Left Column: Headline, Narrative, and Primary Action (Spans 5 cols on lg+) */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6 z-20 pr-2 lg:pr-4">
              {/* Stacked Heading & Supporting Text Container (Zero layout shift) */}
              <div className="grid grid-cols-1 grid-rows-1">
                {/* State 1: Original text (Assembled chair) */}
                <div
                  ref={textOriginalRef}
                  className="col-start-1 row-start-1 will-change-transform"
                >
                  {/* Editorial Eyebrow from Reference */}
                  <div className="flex items-center space-x-3 mb-5 sm:mb-6">
                    <span className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#81796F] font-semibold">
                      FURNITURE, CONSIDERED
                    </span>
                    <span className="w-12 h-[1px] bg-[#DED7CD]" />
                  </div>

                  <h1 className="font-sans text-[36px] sm:text-[44px] md:text-[50px] lg:text-[46px] xl:text-[56px] 2xl:text-[66px] font-bold tracking-[-0.035em] text-[#191817] leading-[1.02]">
                    <span className="block sm:whitespace-nowrap">Calm objects for</span>
                    <span className="block sm:whitespace-nowrap">mindful spaces.</span>
                  </h1>

                  <p className="font-sans text-base sm:text-lg text-[#81796F] leading-relaxed mt-6 font-normal max-w-lg">
                    Honest materials. Timeless forms. Designed to belong.
                  </p>
                </div>

                {/* State 2: Exploded text (Deconstructed chair) */}
                <div
                  ref={textExplodedRef}
                  className="col-start-1 row-start-1 pointer-events-none will-change-transform"
                  style={{ opacity: 0, transform: "translateY(10px)" }}
                  aria-hidden="true"
                >
                  <div className="flex items-center space-x-3 mb-5 sm:mb-6">
                    <span className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#81796F] font-semibold">
                      DECONSTRUCTION · 01
                    </span>
                    <span className="w-12 h-[1px] bg-[#DED7CD]" />
                  </div>

                  <h1 className="font-sans text-[36px] sm:text-[44px] md:text-[50px] lg:text-[46px] xl:text-[56px] 2xl:text-[66px] font-bold tracking-[-0.035em] text-[#191817] leading-[1.02]">
                    <span className="block sm:whitespace-nowrap">Form, revealed.</span>
                  </h1>

                  <p className="font-sans text-base sm:text-lg text-[#81796F] leading-relaxed mt-6 font-normal max-w-lg">
                    Every curve. Every layer. A study in considered design.
                  </p>
                </div>
              </div>

              {/* Action Buttons & Collection CTA */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="#collections"
                  className="inline-flex items-center space-x-2.5 px-8 py-4 bg-[#191817] text-white rounded-full text-xs xl:text-sm font-semibold tracking-wider hover:bg-black transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#191817]"
                >
                  <span>EXPLORE THE COLLECTION</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>

                <Link
                  href="#collections"
                  className="px-7 py-4 bg-[#F7F4ED] hover:bg-white border border-[#DED7CD] rounded-full text-xs xl:text-sm font-medium text-[#191817] transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#191817]"
                >
                  Explore lighting
                </Link>
              </div>
            </div>

            {/* Right Column: Seamless Transparent 3D Stage (Sculptural focal point against showroom canvas, Spans 7 cols on lg+) */}
            <div
              id="hero-chair-stage"
              ref={heroStageRef}
              className="lg:col-span-7 w-full h-[400px] sm:h-[460px] md:h-[520px] lg:h-[580px] xl:h-[640px] 2xl:h-[700px] max-h-[72vh] relative flex items-center justify-center z-10 hero-chair-stage-align transition-opacity duration-150"
            >
              <ChairScrollSequence
                ref={sequenceRef}
                isReducedMotion={reducedMotion}
                scale={scale}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Bottom Bar: Restrained Animated Scroll Indicator */}
          <div className="flex items-center justify-start pb-4 sm:pb-6 z-20">
            {/* Scroll Indicator Prompt */}
            <div
              ref={scrollIndicatorRef}
              className="inline-flex items-center space-x-3.5 transition-opacity duration-300"
            >
              <div className="flex flex-col items-center">
                <div className="w-4 h-7 rounded-full border border-[#191817]/40 flex items-start justify-center p-1">
                  <div className="w-1 h-1.5 rounded-full bg-[#191817] animate-pulse" />
                </div>
                <div className="w-[1px] h-3.5 bg-[#191817]/25 mt-1" />
              </div>
              <span className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.20em] font-semibold text-[#81796F]">
                Scroll to deconstruct architecture
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ChairHeroScroll;
