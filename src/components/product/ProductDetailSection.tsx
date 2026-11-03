"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getRegisteredGSAP, createAnimationContext } from "@/lib/animation";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { setShowcaseProgress } from "@/lib/showcaseStore";

import { useLenis } from "@/components/providers/SmoothScrollProvider";

const STATES = [
  { step: 0, badge: "FIG. 00 · COMPLETE CHAIR", label: "00 Overview" },
  { step: 1, badge: "FIG. 01 · UPHOLSTERY & BACKREST", label: "01 Upholstery" },
  { step: 2, badge: "FIG. 02 · SEAT CUSHION", label: "02 Cushion" },
  { step: 3, badge: "FIG. 03 · SCULPTED ARMRESTS", label: "03 Arms" },
  { step: 4, badge: "FIG. 04 · SOLID WOODEN LEGS", label: "04 Legs" },
  { step: 5, badge: "FIG. 05 · FRAME & JOINERY", label: "05 Frame" },
];

export function ProductDetailSection() {
  const lenis = useLenis();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef<HTMLElement | null>(null);

  // Desktop panel refs for zero-layout-shift transitions (State 0 to State 5)
  const panel0Ref = useRef<HTMLDivElement | null>(null);
  const panel1Ref = useRef<HTMLDivElement | null>(null);
  const panel2Ref = useRef<HTMLDivElement | null>(null);
  const panel3Ref = useRef<HTMLDivElement | null>(null);
  const panel4Ref = useRef<HTMLDivElement | null>(null);
  const panel5Ref = useRef<HTMLDivElement | null>(null);

  // Mobile panel refs
  const mPanel0Ref = useRef<HTMLDivElement | null>(null);
  const mPanel1Ref = useRef<HTMLDivElement | null>(null);
  const mPanel2Ref = useRef<HTMLDivElement | null>(null);
  const mPanel3Ref = useRef<HTMLDivElement | null>(null);
  const mPanel4Ref = useRef<HTMLDivElement | null>(null);
  const mPanel5Ref = useRef<HTMLDivElement | null>(null);

  // Architectural corner badges
  const badgeDesktopRef = useRef<HTMLSpanElement | null>(null);
  const badgeMobileRef = useRef<HTMLSpanElement | null>(null);

  // Stepper indicator bars (6 states)
  const stepDot0Ref = useRef<HTMLSpanElement | null>(null);
  const stepDot1Ref = useRef<HTMLSpanElement | null>(null);
  const stepDot2Ref = useRef<HTMLSpanElement | null>(null);
  const stepDot3Ref = useRef<HTMLSpanElement | null>(null);
  const stepDot4Ref = useRef<HTMLSpanElement | null>(null);
  const stepDot5Ref = useRef<HTMLSpanElement | null>(null);

  const stepLabel0Ref = useRef<HTMLSpanElement | null>(null);
  const stepLabel1Ref = useRef<HTMLSpanElement | null>(null);
  const stepLabel2Ref = useRef<HTMLSpanElement | null>(null);
  const stepLabel3Ref = useRef<HTMLSpanElement | null>(null);
  const stepLabel4Ref = useRef<HTMLSpanElement | null>(null);
  const stepLabel5Ref = useRef<HTMLSpanElement | null>(null);

  const activeStepRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();

  const updateUI = useCallback((step: number) => {
    const badgeText = STATES[step]?.badge || "FIG. 00 · COMPLETE CHAIR";
    if (badgeDesktopRef.current) badgeDesktopRef.current.textContent = badgeText;
    if (badgeMobileRef.current) badgeMobileRef.current.textContent = badgeText;

    const dots = [
      stepDot0Ref.current,
      stepDot1Ref.current,
      stepDot2Ref.current,
      stepDot3Ref.current,
      stepDot4Ref.current,
      stepDot5Ref.current,
    ];
    const labels = [
      stepLabel0Ref.current,
      stepLabel1Ref.current,
      stepLabel2Ref.current,
      stepLabel3Ref.current,
      stepLabel4Ref.current,
      stepLabel5Ref.current,
    ];

    dots.forEach((dot, idx) => {
      if (!dot) return;
      if (idx === step) {
        dot.className = "w-6 h-1.5 rounded-full bg-[#141210] transition-all duration-300";
      } else {
        dot.className = "w-1.5 h-1.5 rounded-full bg-[#141210]/20 transition-all duration-300";
      }
    });

    labels.forEach((lbl, idx) => {
      if (!lbl) return;
      if (idx === step) {
        lbl.className = "font-sans text-[10px] uppercase tracking-[0.16em] text-[#141210] font-semibold transition-colors duration-200";
      } else {
        lbl.className = "font-sans text-[10px] uppercase tracking-[0.16em] text-[#8C8477] font-semibold transition-colors duration-200 group-hover:text-[#141210]";
      }
    });
  }, []);

  const updatePanels = useCallback((p: number) => {
    const panels = [
      panel0Ref.current,
      panel1Ref.current,
      panel2Ref.current,
      panel3Ref.current,
      panel4Ref.current,
      panel5Ref.current,
    ];
    const mPanels = [
      mPanel0Ref.current,
      mPanel1Ref.current,
      mPanel2Ref.current,
      mPanel3Ref.current,
      mPanel4Ref.current,
      mPanel5Ref.current,
    ];

    const clampedP = Math.max(0, Math.min(1, p));
    const segFloat = clampedP * 6;
    const segment = Math.min(5, Math.floor(segFloat));
    const localT = segFloat - segment;

    const panelA = segment;
    // For segment 5 (Frame), hold on Frame (step 5)
    const panelB = segment === 5 ? 5 : segment + 1;

    let opA = 0;
    let yA = 0;
    let opB = 0;
    let yB = 0;

    if (segment === 5) {
      // Step 5 (Frame) holds firmly throughout segment 5 until section unpins
      opA = 1;
      yA = 0;
      opB = 1;
      yB = 0;
    } else if (localT <= 0.36) {
      // Stable Hold Window for Panel A
      opA = 1;
      yA = 0;
      opB = 0;
      yB = 12;
    } else if (localT < 0.50) {
      // Sequential Exit: Panel A dissolves upward cleanly
      // Panel B remains completely hidden (opB = 0, visibility = hidden)
      const t = (localT - 0.36) / 0.14;
      const ease = t * t * (3 - 2 * t);
      opA = 1 - ease;
      yA = -12 * ease;
      opB = 0;
      yB = 12;
    } else if (localT < 0.64) {
      // Sequential Enter: Panel B settles upward from +12px into resting place
      // Panel A is already completely hidden (opA = 0, visibility = hidden)
      const t = (localT - 0.50) / 0.14;
      const ease = t * t * (3 - 2 * t);
      opA = 0;
      yA = -12;
      opB = ease;
      yB = 12 * (1 - ease);
    } else {
      // Stable Hold Window for settled Panel B
      opA = 0;
      yA = -12;
      opB = 1;
      yB = 0;
    }

    panels.forEach((panel, idx) => {
      const mPanel = mPanels[idx];
      let op = 0;
      let y = 10;

      if (segment === 5) {
        if (idx === 5) {
          op = 1;
          y = 0;
        }
      } else {
        if (idx === panelA) {
          op = opA;
          y = yA;
        } else if (idx === panelB) {
          op = opB;
          y = yB;
        }
      }

      const isVis = op > 0.005;
      const visStr = isVis ? "visible" : "hidden";
      const opStr = isVis ? op.toFixed(3) : "0";
      const ptrStr = op > 0.6 ? "auto" : "none";
      const ariaStr = op > 0.6 ? "false" : "true";
      const zStr = op > 0.6 ? "10" : isVis ? "5" : "0";

      if (panel) {
        panel.style.opacity = opStr;
        panel.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
        panel.style.visibility = visStr;
        panel.style.pointerEvents = ptrStr;
        panel.style.zIndex = zStr;
        panel.setAttribute("aria-hidden", ariaStr);
      }
      if (mPanel) {
        mPanel.style.opacity = opStr;
        mPanel.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
        mPanel.style.visibility = visStr;
        mPanel.style.pointerEvents = ptrStr;
        mPanel.style.zIndex = zStr;
        mPanel.setAttribute("aria-hidden", ariaStr);
      }
    });
  }, []);

  const handleStepClick = useCallback(
    (idx: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const trackDocY = rect.top + window.scrollY;
      const vh = window.innerHeight;
      const scrollDist = track.offsetHeight - vh;
      // Step indices 0..5 map to p in [0, 5/6]
      const targetP = idx / 6;
      const targetY = trackDocY + targetP * scrollDist;
      const l = lenis || (typeof window !== "undefined" ? (window as unknown as { lenis?: { scrollTo: (target: number, opts?: { duration?: number }) => void } }).lenis : null);
      if (l) {
        l.scrollTo(targetY, { duration: 0.8 });
      } else {
        window.scrollTo({ top: targetY, behavior: "smooth" });
      }
    },
    [lenis]
  );

  useEffect(() => {
    if (reducedMotion) {
      setShowcaseProgress(0);
      updatePanels(0);
      updateUI(0);
      return;
    }

    const { ScrollTrigger } = getRegisteredGSAP();
    const track = trackRef.current;
    const pinned = pinnedRef.current;
    if (!track || !pinned) return;

    const cleanup = createAnimationContext(track, () => {
      const updateDimensions = () => {
        const vh = window.innerHeight;
        track.style.height = `${Math.round(vh * 3.5)}px`;
      };
      updateDimensions();

      ScrollTrigger.create({
        trigger: track,
        start: "top top",
        end: () => `+=${track.offsetHeight - window.innerHeight}`,
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
          const p = self.progress; // 0.0 to 1.0 strictly derived from scroll position
          setShowcaseProgress(p);
          updatePanels(p);

          // Update active step for dots & badges synchronized with panel handoff:
          const clampedP = Math.max(0, Math.min(1, p));
          const segFloat = clampedP * 6;
          const segment = Math.min(5, Math.floor(segFloat));
          const localT = segFloat - segment;
          const step = segment === 5 ? 5 : (localT >= 0.50 ? segment + 1 : segment);

          if (step !== activeStepRef.current) {
            activeStepRef.current = step;
            updateUI(step);
          }
        },
      });
    });

    const handleResize = () => {
      if (track) {
        track.style.height = `${Math.round(window.innerHeight * 3.5)}px`;
      }
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cleanup();
      setShowcaseProgress(0);
    };
  }, [reducedMotion, updatePanels, updateUI]);

  return (
    <div
      ref={trackRef}
      id="product-detail-track"
      className={`relative w-full ${
        reducedMotion ? "min-h-screen" : "h-[350vh] min-h-[2600px]"
      }`}
    >
      <div id="details" className="absolute top-0 left-0 w-full h-1 pointer-events-none" aria-hidden="true" />
      <section
        ref={pinnedRef}
        id="crafted-product-detail"
        className="w-full min-h-screen flex items-center bg-[#F9F7EF] text-[#141210] relative select-none overflow-hidden py-8 sm:py-12 lg:py-16"
        aria-label="Bolle Lounge Chair - Material & Craftsmanship Showcase"
      >
        <div className="max-w-[1520px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 w-full">
          {/* DESKTOP 2-COLUMN ARCHITECTURAL LAYOUT (lg and above) */}
          <div className="hidden lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-16 items-center min-h-[640px] xl:min-h-[700px]">
            {/* Left Column: Synchronized 6-State Component Narrative (Spans 5 cols) */}
            <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center space-y-6 relative z-30">
              {/* Stacked Content Container: Zero Layout Shifts via CSS Grid */}
              <div className="grid grid-cols-1 grid-rows-1 relative min-h-[460px] xl:min-h-[500px]">
                {/* STATE 0: Complete Chair (Original Product Information) */}
                <div
                  ref={panel0Ref}
                  className="col-start-1 row-start-1 flex flex-col justify-center space-y-7 will-change-transform"
                  style={{ opacity: 1, transform: "translate3d(0, 0px, 0)", visibility: "visible", zIndex: 10 }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 rounded-full bg-[#141210]" />
                    <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-[#6B665E] font-bold">
                      ARCHIVAL PIECE NO. 241 · SHACK15 FERRY STUDY
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h2 className="font-serif text-5xl xl:text-6xl 2xl:text-7xl font-normal text-[#141210] tracking-[-0.03em] leading-[1.04]">
                      The Bolle Lounge Chair.
                    </h2>
                    <p className="font-sans text-xl xl:text-2xl font-medium text-[#4A453E] tracking-tight">
                      Solid European Oak & Saffron Wool Bouclé
                    </p>
                  </div>

                  <p className="font-sans text-sm xl:text-base text-[#6B665E] leading-relaxed max-w-lg font-normal">
                    A calm sculptural lounge chair documented in San Francisco’s historic Ferry Building. Crafted with cantilevered solid wood framing, tactile comfort, and joinery intended to last across generations.
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#DDD3C4]/70">
                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Materiality
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Solid Oak & Saffron Bouclé
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Joinery
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Concealed Mortise & Tenon
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Dimensions
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        84 W × 88 D × 78 H cm (Seat 42 cm)
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Edition
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Ferry Edition · Batch 04
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center space-x-6">
                    <Link
                      href="#collections"
                      className="inline-flex items-center space-x-3 px-8 py-4 bg-[#141210] hover:bg-black text-white rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141210]"
                    >
                      <span>Acquire Piece · $2,850</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      className="font-sans text-xs xl:text-sm font-semibold text-[#141210] hover:text-black underline underline-offset-4 transition-colors cursor-pointer"
                    >
                      Request Saffron Swatch
                    </button>
                  </div>
                </div>

                {/* STATE 1: Upholstery and Backrest */}
                <div
                  ref={panel1Ref}
                  className="col-start-1 row-start-1 flex flex-col justify-center space-y-7 pointer-events-none will-change-transform"
                  style={{ opacity: 0, transform: "translate3d(0, 10px, 0)", visibility: "hidden" }}
                  aria-hidden="true"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 rounded-full bg-[#141210]" />
                    <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-[#6B665E] font-bold">
                      MATERIAL STUDY · 01
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h2 className="font-serif text-5xl xl:text-6xl 2xl:text-7xl font-normal text-[#141210] tracking-[-0.03em] leading-[1.04]">
                      Texture you can feel.
                    </h2>
                    <p className="font-sans text-xl xl:text-2xl font-medium text-[#4A453E] tracking-tight">
                      Saffron wool bouclé
                    </p>
                  </div>

                  <p className="font-sans text-sm xl:text-base text-[#6B665E] leading-relaxed max-w-lg font-normal">
                    A richly woven upholstery with tactile depth and a softly textured finish, designed to bring warmth and comfort to everyday living.
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#DDD3C4]/70">
                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Weave Architecture
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Custom High-Density Loop
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Fiber Composition
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        85% Wool, 15% Linen
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Tactile Profile
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Soft, Matte Textured Loop
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Durability Standard
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        100,000 Martindale Rubs
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center space-x-6">
                    <button
                      type="button"
                      className="inline-flex items-center space-x-3 px-8 py-4 bg-[#141210] hover:bg-black text-white rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141210] cursor-pointer"
                    >
                      <span>Request Saffron Swatch</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <span className="font-sans text-xs xl:text-sm text-[#6B665E]">
                      Available in Saffron & Natural Oak
                    </span>
                  </div>
                </div>

                {/* STATE 2: Seat Cushion */}
                <div
                  ref={panel2Ref}
                  className="col-start-1 row-start-1 flex flex-col justify-center space-y-7 pointer-events-none will-change-transform"
                  style={{ opacity: 0, transform: "translate3d(0, 10px, 0)", visibility: "hidden" }}
                  aria-hidden="true"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 rounded-full bg-[#141210]" />
                    <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-[#6B665E] font-bold">
                      ERGONOMIC STUDY · 02
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h2 className="font-serif text-5xl xl:text-6xl 2xl:text-7xl font-normal text-[#141210] tracking-[-0.03em] leading-[1.04]">
                      Sculpted for deep comfort.
                    </h2>
                    <p className="font-sans text-xl xl:text-2xl font-medium text-[#4A453E] tracking-tight">
                      Multi-density ergonomic cushion
                    </p>
                  </div>

                  <p className="font-sans text-sm xl:text-base text-[#6B665E] leading-relaxed max-w-lg font-normal">
                    Generously contoured core layered with responsive foam and natural batting, delivering sustained support without compromising silhouette.
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#DDD3C4]/70">
                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Cushion Core
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Multi-Density Latex Foam
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Seat Depth
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        58 cm Relaxed Depth
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Resilience
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        High-Elasticity Rebound
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Edge Profile
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Soft Radiused Perimeter
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center space-x-6">
                    <button
                      type="button"
                      className="inline-flex items-center space-x-3 px-8 py-4 bg-[#141210] hover:bg-black text-white rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141210] cursor-pointer"
                    >
                      <span>Explore Cushion Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <span className="font-sans text-xs xl:text-sm text-[#6B665E]">
                      Breathable Natural Batting
                    </span>
                  </div>
                </div>

                {/* STATE 3: Armrests */}
                <div
                  ref={panel3Ref}
                  className="col-start-1 row-start-1 flex flex-col justify-center space-y-7 pointer-events-none will-change-transform"
                  style={{ opacity: 0, transform: "translate3d(0, 10px, 0)", visibility: "hidden" }}
                  aria-hidden="true"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 rounded-full bg-[#141210]" />
                    <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-[#6B665E] font-bold">
                      FORM STUDY · 03
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h2 className="font-serif text-5xl xl:text-6xl 2xl:text-7xl font-normal text-[#141210] tracking-[-0.03em] leading-[1.04]">
                      Continuous organic form.
                    </h2>
                    <p className="font-sans text-xl xl:text-2xl font-medium text-[#4A453E] tracking-tight">
                      Sculpted sweeping armrests
                    </p>
                  </div>

                  <p className="font-sans text-sm xl:text-base text-[#6B665E] leading-relaxed max-w-lg font-normal">
                    A fluid, unified profile that envelops the sitter, balancing architectural precision with welcoming, gently sloped curves.
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#DDD3C4]/70">
                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Armrest Rise
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        22 cm Above Seat Line
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Contour Flare
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Graduated Ergonomic Curve
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Foam Density
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Conforming Dual-Density
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Body Union
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Seamless Integrated Shell
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center space-x-6">
                    <button
                      type="button"
                      className="inline-flex items-center space-x-3 px-8 py-4 bg-[#141210] hover:bg-black text-white rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141210] cursor-pointer"
                    >
                      <span>View Armrest Geometry</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <span className="font-sans text-xs xl:text-sm text-[#6B665E]">
                      Hand-Tensioned Tailoring
                    </span>
                  </div>
                </div>

                {/* STATE 4: Wooden Legs */}
                <div
                  ref={panel4Ref}
                  className="col-start-1 row-start-1 flex flex-col justify-center space-y-7 pointer-events-none will-change-transform"
                  style={{ opacity: 0, transform: "translate3d(0, 10px, 0)", visibility: "hidden" }}
                  aria-hidden="true"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 rounded-full bg-[#141210]" />
                    <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-[#6B665E] font-bold">
                      TIMBER STUDY · 04
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h2 className="font-serif text-5xl xl:text-6xl 2xl:text-7xl font-normal text-[#141210] tracking-[-0.03em] leading-[1.04]">
                      Grounded in craftsmanship.
                    </h2>
                    <p className="font-sans text-xl xl:text-2xl font-medium text-[#4A453E] tracking-tight">
                      Solid European oak
                    </p>
                  </div>

                  <p className="font-sans text-sm xl:text-base text-[#6B665E] leading-relaxed max-w-lg font-normal">
                    Warm timber, considered proportions and carefully finished joinery give the chair its structural character and enduring presence.
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#DDD3C4]/70">
                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Timber Origin
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        FSC-Certified French Oak
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Surface Treatment
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Natural Organic Matte Wax
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Leg Profile
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Tapered Cantilever Angle
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Floor Glides
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Concealed High-Density Felt
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center space-x-6">
                    <button
                      type="button"
                      className="inline-flex items-center space-x-3 px-8 py-4 bg-[#141210] hover:bg-black text-white rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141210] cursor-pointer"
                    >
                      <span>Explore Oak Finishes</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <span className="font-sans text-xs xl:text-sm text-[#6B665E]">
                      Natural, Smoked & Blackened
                    </span>
                  </div>
                </div>

                {/* STATE 5: Lower Frame and Joinery */}
                <div
                  ref={panel5Ref}
                  className="col-start-1 row-start-1 flex flex-col justify-center space-y-7 pointer-events-none will-change-transform"
                  style={{ opacity: 0, transform: "translate3d(0, 10px, 0)", visibility: "hidden" }}
                  aria-hidden="true"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 rounded-full bg-[#141210]" />
                    <span className="font-sans text-[11px] uppercase tracking-[0.22em] text-[#6B665E] font-bold">
                      JOINERY STUDY · 05
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h2 className="font-serif text-5xl xl:text-6xl 2xl:text-7xl font-normal text-[#141210] tracking-[-0.03em] leading-[1.04]">
                      Enduring architecture.
                    </h2>
                    <p className="font-sans text-xl xl:text-2xl font-medium text-[#4A453E] tracking-tight">
                      Concealed mortise & tenon joinery
                    </p>
                  </div>

                  <p className="font-sans text-sm xl:text-base text-[#6B665E] leading-relaxed max-w-lg font-normal">
                    Interlocking solid wood joinery built to endure across generations, uniting the cantilevered base with the sculpted upper seat.
                  </p>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#DDD3C4]/70">
                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Structural Joint
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Concealed Mortise & Tenon
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Subframe Rail
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Reinforced Oak Cross-Brace
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Fastening
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Traditional Wood Doweling
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                        Structural Rating
                      </span>
                      <span className="font-sans text-xs xl:text-sm text-[#141210] font-medium block">
                        Exceeds BIFMA Standards
                      </span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center space-x-6">
                    <button
                      type="button"
                      className="inline-flex items-center space-x-3 px-8 py-4 bg-[#141210] hover:bg-black text-white rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141210] cursor-pointer"
                    >
                      <span>Inspect Construction Specs</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <span className="font-sans text-xs xl:text-sm text-[#6B665E]">
                      Lifetime Structural Guarantee
                    </span>
                  </div>
                </div>
              </div>

              {/* Minimal Architectural Showcase Progress Stepper (6 States) */}
              <div className="pt-2 flex items-center space-x-5 border-t border-[#DDD3C4]/50">
                {STATES.map((st, idx) => {
                  const dots = [stepDot0Ref, stepDot1Ref, stepDot2Ref, stepDot3Ref, stepDot4Ref, stepDot5Ref];
                  const labels = [stepLabel0Ref, stepLabel1Ref, stepLabel2Ref, stepLabel3Ref, stepLabel4Ref, stepLabel5Ref];
                  const isCurrent = idx === 0;

                  return (
                    <button
                      key={st.step}
                      type="button"
                      onClick={() => handleStepClick(idx)}
                      className="flex items-center space-x-2 cursor-pointer focus:outline-none group py-1"
                      aria-label={`View ${st.label}`}
                    >
                      <span
                        ref={dots[idx]}
                        className={
                          isCurrent
                            ? "w-6 h-1.5 rounded-full bg-[#141210] transition-all duration-300"
                            : "w-1.5 h-1.5 rounded-full bg-[#141210]/20 transition-all duration-300"
                        }
                      />
                      <span
                        ref={labels[idx]}
                        className={
                          isCurrent
                            ? "font-sans text-[10px] uppercase tracking-[0.16em] text-[#141210] font-semibold transition-colors duration-200"
                            : "font-sans text-[10px] uppercase tracking-[0.16em] text-[#8C8477] font-semibold transition-colors duration-200 group-hover:text-[#141210]"
                        }
                      >
                        {st.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Contained 3D Product Display Container */}
            <div className="lg:col-span-6 xl:col-span-7 flex items-center justify-center lg:justify-end">
              <div
                id="product-chair-target"
                className="relative z-10 w-full max-w-[540px] xl:max-w-[620px] 2xl:max-w-[660px] aspect-square bg-[#E4DCCF] rounded-[3rem] xl:rounded-[3.6rem] border border-[#DDD3C4]/80 shadow-[0_4px_32px_rgba(0,0,0,0.03)] overflow-hidden flex items-center justify-center"
              >
                {/* Dynamic Architectural Corner Labels */}
                <div className="absolute top-7 left-8 z-10 pointer-events-none">
                  <span
                    ref={badgeDesktopRef}
                    className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#8C8477] font-semibold transition-opacity duration-200"
                  >
                    FIG. 00 · COMPLETE CHAIR
                  </span>
                </div>

                <div className="absolute bottom-7 right-8 z-10 pointer-events-none flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#141210]/40" />
                  <span className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#8C8477] font-semibold">
                    3D SPATIAL MODEL
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TABLET & MOBILE RESPONSIVE STACK (Screens < 1024px) */}
          <div className="lg:hidden flex flex-col space-y-6">
            {/* Header / Subtitle Grid */}
            <div className="grid grid-cols-1 grid-rows-1 relative min-h-[170px] z-30">
              <div
                ref={mPanel0Ref}
                className="col-start-1 row-start-1 space-y-1.5 will-change-transform"
                style={{ opacity: 1, transform: "translate3d(0, 0px, 0)", visibility: "visible", zIndex: 10 }}
              >
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#141210]" />
                  <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#6B665E] font-bold">
                    ARCHIVE NO. 241
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#141210] tracking-tight">
                  The Bolle Lounge Chair.
                </h2>
                <p className="font-sans text-sm sm:text-base text-[#4A453E]">
                  Solid European Oak & Saffron Wool Bouclé
                </p>
                <p className="font-sans text-xs sm:text-sm text-[#6B665E] leading-relaxed pt-1">
                  A calm sculptural lounge chair documented in San Francisco’s historic Ferry Building. Crafted with cantilevered solid wood framing and tactile comfort.
                </p>
              </div>

              {/* Mobile State 1 */}
              <div
                ref={mPanel1Ref}
                className="col-start-1 row-start-1 space-y-1.5 pointer-events-none will-change-transform"
                style={{ opacity: 0, transform: "translate3d(0, 10px, 0)", visibility: "hidden" }}
                aria-hidden="true"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#141210]" />
                  <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#6B665E] font-bold">
                    MATERIAL STUDY · 01
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#141210] tracking-tight">
                  Texture you can feel.
                </h2>
                <p className="font-sans text-sm sm:text-base text-[#4A453E]">
                  Saffron wool bouclé
                </p>
                <p className="font-sans text-xs sm:text-sm text-[#6B665E] leading-relaxed pt-1">
                  A richly woven upholstery with tactile depth and a softly textured finish, designed to bring warmth and comfort to everyday living.
                </p>
              </div>

              {/* Mobile State 2 */}
              <div
                ref={mPanel2Ref}
                className="col-start-1 row-start-1 space-y-1.5 pointer-events-none will-change-transform"
                style={{ opacity: 0, transform: "translate3d(0, 10px, 0)", visibility: "hidden" }}
                aria-hidden="true"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#141210]" />
                  <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#6B665E] font-bold">
                    ERGONOMIC STUDY · 02
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#141210] tracking-tight">
                  Sculpted for deep comfort.
                </h2>
                <p className="font-sans text-sm sm:text-base text-[#4A453E]">
                  Multi-density ergonomic cushion
                </p>
                <p className="font-sans text-xs sm:text-sm text-[#6B665E] leading-relaxed pt-1">
                  Generously contoured core layered with responsive foam and natural batting, delivering sustained support without compromising silhouette.
                </p>
              </div>

              {/* Mobile State 3 */}
              <div
                ref={mPanel3Ref}
                className="col-start-1 row-start-1 space-y-1.5 pointer-events-none will-change-transform"
                style={{ opacity: 0, transform: "translate3d(0, 10px, 0)", visibility: "hidden" }}
                aria-hidden="true"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#141210]" />
                  <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#6B665E] font-bold">
                    FORM STUDY · 03
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#141210] tracking-tight">
                  Continuous organic form.
                </h2>
                <p className="font-sans text-sm sm:text-base text-[#4A453E]">
                  Sculpted sweeping armrests
                </p>
                <p className="font-sans text-xs sm:text-sm text-[#6B665E] leading-relaxed pt-1">
                  A fluid, unified profile that envelops the sitter, balancing architectural precision with welcoming, gently sloped curves.
                </p>
              </div>

              {/* Mobile State 4 */}
              <div
                ref={mPanel4Ref}
                className="col-start-1 row-start-1 space-y-1.5 pointer-events-none will-change-transform"
                style={{ opacity: 0, transform: "translate3d(0, 10px, 0)", visibility: "hidden" }}
                aria-hidden="true"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#141210]" />
                  <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#6B665E] font-bold">
                    TIMBER STUDY · 04
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#141210] tracking-tight">
                  Grounded in craftsmanship.
                </h2>
                <p className="font-sans text-sm sm:text-base text-[#4A453E]">
                  Solid European oak
                </p>
                <p className="font-sans text-xs sm:text-sm text-[#6B665E] leading-relaxed pt-1">
                  Warm timber, considered proportions and carefully finished joinery give the chair its structural character and enduring presence.
                </p>
              </div>

              {/* Mobile State 5 */}
              <div
                ref={mPanel5Ref}
                className="col-start-1 row-start-1 space-y-1.5 pointer-events-none will-change-transform"
                style={{ opacity: 0, transform: "translate3d(0, 10px, 0)", visibility: "hidden" }}
                aria-hidden="true"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#141210]" />
                  <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#6B665E] font-bold">
                    JOINERY STUDY · 05
                  </span>
                </div>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#141210] tracking-tight">
                  Enduring architecture.
                </h2>
                <p className="font-sans text-sm sm:text-base text-[#4A453E]">
                  Concealed mortise & tenon joinery
                </p>
                <p className="font-sans text-xs sm:text-sm text-[#6B665E] leading-relaxed pt-1">
                  Interlocking solid wood joinery built to endure across generations, uniting the cantilevered base with the sculpted upper seat.
                </p>
              </div>
            </div>

            {/* Product Display Area for the 3D Chair */}
            <div
              id="product-chair-target-mobile"
              className="w-full max-w-[420px] mx-auto aspect-square bg-[#E4DCCF] rounded-[2.4rem] border border-[#DDD3C4]/80 shadow-[0_4px_24px_rgba(0,0,0,0.025)] overflow-hidden flex items-center justify-center relative z-10"
            >
              <div className="absolute top-5 left-6 z-10 pointer-events-none">
                <span
                  ref={badgeMobileRef}
                  className="font-sans text-[9px] uppercase tracking-[0.18em] text-[#8C8477] font-semibold"
                >
                  FIG. 00 · COMPLETE CHAIR
                </span>
              </div>
            </div>

            {/* Specs & Acquisition CTA Footer */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#DDD3C4]/70">
                <div className="space-y-0.5">
                  <span className="font-sans text-[9px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                    Material
                  </span>
                  <span className="font-sans text-xs text-[#141210] font-medium block">
                    Oak & Wool Bouclé
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="font-sans text-[9px] uppercase tracking-wider text-[#8C8477] font-semibold block">
                    Dimensions
                  </span>
                  <span className="font-sans text-xs text-[#141210] font-medium block">
                    84 × 88 × 78 cm
                  </span>
                </div>
              </div>

              <div className="pt-1">
                <Link
                  href="#collections"
                  className="inline-flex items-center justify-center space-x-2 w-full py-4 bg-[#141210] text-white rounded-full text-xs font-semibold shadow-sm"
                >
                  <span>Acquire Piece · $2,850</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductDetailSection;
