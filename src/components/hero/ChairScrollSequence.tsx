"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";

export interface ChairScrollSequenceHandle {
  setProgress: (progress: number) => void;
  getCurrentFrameIndex: () => number;
  isReady: () => boolean;
}

export interface ChairScrollSequenceProps {
  className?: string;
  isReducedMotion?: boolean;
  scale?: number;
  onFrameChange?: (frameIndex: number, progress: number) => void;
  onLoadingProgress?: (loadedCount: number, totalCount: number) => void;
}

const TOTAL_FRAMES = 109;
const FRAME_WIDTH = 1920;
const FRAME_HEIGHT = 1080;
const FRAME_ASPECT = FRAME_WIDTH / FRAME_HEIGHT;
const CONCURRENT_DOWNLOADS = 6;

const getFramePath = (index1Based: number) =>
  `/frames/chair-transparent/frame_${String(index1Based).padStart(4, "0")}.webp`;

/**
 * High-performance scroll-driven canvas sequence component.
 * Uses native pixel dimensions without matrix scaling to guarantee zero-artifact,
 * razor-sharp rendering on all device pixel ratios.
 */
export const ChairScrollSequence = forwardRef<
  ChairScrollSequenceHandle,
  ChairScrollSequenceProps
>(function ChairScrollSequence(
  {
    className = "",
    isReducedMotion = false,
    scale = 1.0,
    onFrameChange,
    onLoadingProgress,
  },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scaleRef = useRef(scale);

  // Cached frame images and load states
  const imagesRef = useRef<(HTMLImageElement | null)[]>(
    new Array(TOTAL_FRAMES).fill(null)
  );
  const loadedFlagsRef = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));

  // Playhead and render state
  const targetProgressRef = useRef(0);
  const targetIndexRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const isComponentMountedRef = useRef(true);

  // Initial load visual state
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);
  const [loadedPercent, setLoadedPercent] = useState(0);

  /**
   * Directly draws the resolved frame to the canvas buffer using native pixel coordinates.
   */
  const drawFrameDirect = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Ensure canvas dimensions are initialized
    if (canvas.width <= 0 || canvas.height <= 0) {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    const cw = canvas.width;
    const ch = canvas.height;
    if (cw <= 0 || ch <= 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const images = imagesRef.current;
    const loadedFlags = loadedFlagsRef.current;

    // Resolve target frame or closest loaded fallback
    let resolvedIndex = frameIndex;
    if (!loadedFlags[resolvedIndex] || !images[resolvedIndex]) {
      let closestDistance = Infinity;
      let foundIndex = -1;

      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (loadedFlags[i] && images[i]) {
          const dist = Math.abs(i - frameIndex);
          if (dist < closestDistance) {
            closestDistance = dist;
            foundIndex = i;
          }
        }
      }

      if (foundIndex !== -1) {
        resolvedIndex = foundIndex;
      } else {
        return; // No frame available yet
      }
    }

    const img = images[resolvedIndex];
    if (!img) return;

    // Safe containment calculation in native buffer pixels
    // Guarantees zero clipping of any chair pixel across all 109 frames (assembled to fully deconstructed)
    const padY = Math.max(0, Math.round(ch * 0.03));
    const padX = Math.max(0, Math.round(cw * 0.03));

    const maxDrawHFromHeight = Math.max(0, (ch - padY * 2) / 0.93);
    const maxDrawHFromWidth = Math.max(0, (cw - padX * 2) / 1.09);
    const baseSafeH = Math.min(maxDrawHFromHeight, maxDrawHFromWidth);

    const safeScale = Math.min(1.0, Math.max(0.7, scaleRef.current || 1.0));
    const drawH = Math.max(0, baseSafeH * safeScale);
    const drawW = Math.max(0, drawH * FRAME_ASPECT);

    // If canvas buffer is not yet properly measured or too small, skip drawing to avoid invalid gradient radii
    if (drawW < 20 || drawH < 20) return;

    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Clean transparent canvas - zero solid background
    ctx.clearRect(0, 0, cw, ch);

    // Subtle, realistic contact shadow grounded beneath the chair and its 4 wooden feet
    // Fades naturally as the armchair deconstructs and separates upwards
    const progressNorm = targetProgressRef.current;
    const shadowFactor = Math.max(0, 1 - progressNorm * 1.5);
    if (shadowFactor > 0.01) {
      // 1. Soft diffused floor shadow cast slightly forward-left (matching daylight angle)
      const shadowX = drawX + drawW * 0.505;
      const shadowY = drawY + drawH * 0.895;
      const radiusX = Math.max(1, drawW * 0.24);
      const radiusY = Math.max(1, drawH * 0.042);

      if (radiusX > 0 && radiusY > 0) {
        ctx.save();
        ctx.translate(shadowX, shadowY);
        ctx.scale(1, radiusY / radiusX);

        const r1 = Math.max(0.1, radiusX);
        const grad = ctx.createRadialGradient(-radiusX * 0.06, 0, 0, 0, 0, r1);
        grad.addColorStop(0, `rgba(38, 30, 22, ${0.22 * shadowFactor})`);
        grad.addColorStop(0.35, `rgba(38, 30, 22, ${0.11 * shadowFactor})`);
        grad.addColorStop(0.7, `rgba(38, 30, 22, ${0.03 * shadowFactor})`);
        grad.addColorStop(1, "rgba(38, 30, 22, 0)");

        ctx.beginPath();
        ctx.arc(0, 0, radiusX, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      // 2. Subtle ambient occlusion contact darkening under the 4 wooden leg tips
      // (UV coordinates resolved from frame 1: BL: 0.320, 0.832; FL: 0.413, 0.923; BR: 0.543, 0.799; FR: 0.687, 0.877)
      const legContacts = [
        { u: 0.3203, v: 0.8315, rx: Math.max(1, drawW * 0.022), ry: Math.max(1, drawH * 0.007), alpha: 0.24 }, // Back Left
        { u: 0.4130, v: 0.9231, rx: Math.max(1, drawW * 0.026), ry: Math.max(1, drawH * 0.008), alpha: 0.36 }, // Front Left (dominant foreground contact)
        { u: 0.5432, v: 0.7991, rx: Math.max(1, drawW * 0.020), ry: Math.max(1, drawH * 0.006), alpha: 0.22 }, // Back Right
        { u: 0.6870, v: 0.8769, rx: Math.max(1, drawW * 0.024), ry: Math.max(1, drawH * 0.0075), alpha: 0.32 }, // Front Right
      ];

      for (const leg of legContacts) {
        if (leg.rx <= 0 || leg.ry <= 0) continue;
        const lx = drawX + drawW * leg.u;
        const ly = drawY + drawH * leg.v;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.scale(1, leg.ry / leg.rx);

        const legR1 = Math.max(0.1, leg.rx);
        const legGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, legR1);
        legGrad.addColorStop(0, `rgba(24, 18, 12, ${leg.alpha * shadowFactor})`);
        legGrad.addColorStop(0.5, `rgba(24, 18, 12, ${leg.alpha * 0.4 * shadowFactor})`);
        legGrad.addColorStop(1, "rgba(24, 18, 12, 0)");

        ctx.beginPath();
        ctx.arc(0, 0, leg.rx, 0, Math.PI * 2);
        ctx.fillStyle = legGrad;
        ctx.fill();
        ctx.restore();
      }
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }, []);

  /**
   * Schedules or directly executes a canvas redraw
   */
  const requestRedraw = useCallback(() => {
    drawFrameDirect(targetIndexRef.current);
  }, [drawFrameDirect]);

  useEffect(() => {
    scaleRef.current = scale;
    drawFrameDirect(targetIndexRef.current);
  }, [scale, drawFrameDirect]);

  /**
   * Linear, deterministic scroll progress to frame index mapping:
   * At 0%: Frame 0 (exact assembled chair)
   * At 25%: Frame 27 (initial separation begins with clean gaps)
   * At 50%: Frame 54 (cushion, shell, and legs clearly separating)
   * At 75%: Frame 81 (major components visibly distinct)
   * At 100%: Frame 108 (complete, balanced exploded arrangement)
   */
  const mapProgressToFrameIndex = useCallback((progress: number) => {
    if (isReducedMotion) return 0;

    const p = Math.max(0, Math.min(1, progress));
    const index = Math.round(p * (TOTAL_FRAMES - 1));
    return Math.max(0, Math.min(TOTAL_FRAMES - 1, index));
  }, [isReducedMotion]);

  // Imperative handle for GSAP
  useImperativeHandle(
    ref,
    () => ({
      setProgress: (progress: number) => {
        targetProgressRef.current = progress;
        const newIndex = mapProgressToFrameIndex(progress);

        if (newIndex !== targetIndexRef.current) {
          targetIndexRef.current = newIndex;
          drawFrameDirect(newIndex);
          if (onFrameChange) {
            onFrameChange(newIndex, progress);
          }
        }
      },
      getCurrentFrameIndex: () => targetIndexRef.current,
      isReady: () => firstFrameLoaded,
    }),
    [mapProgressToFrameIndex, drawFrameDirect, onFrameChange, firstFrameLoaded]
  );

  // Progressive Frame Loader
  useEffect(() => {
    isComponentMountedRef.current = true;
    let loadedCount = 0;
    let activeDownloads = 0;
    let nextIndexToQueue = 1;

    // Load Frame 1 immediately
    const frame1 = new Image();
    frame1.decoding = "async";
    frame1.src = getFramePath(1);

    const onFrame1Ready = () => {
      if (!isComponentMountedRef.current) return;
      imagesRef.current[0] = frame1;
      loadedFlagsRef.current[0] = true;
      loadedCount++;
      setFirstFrameLoaded(true);
      drawFrameDirect(0);

      // Start queuing remaining frames
      pumpQueue();
    };

    if (frame1.complete && frame1.naturalWidth > 0) {
      onFrame1Ready();
    } else {
      frame1.onload = onFrame1Ready;
      frame1.onerror = () => {
        console.warn("[Furnix] Failed to load frame 1");
      };
    }

    // Queue worker
    function pumpQueue() {
      if (!isComponentMountedRef.current) return;

      while (
        activeDownloads < CONCURRENT_DOWNLOADS &&
        nextIndexToQueue < TOTAL_FRAMES
      ) {
        const frameIdx = nextIndexToQueue++;
        activeDownloads++;

        const img = new Image();
        img.decoding = "async";
        img.src = getFramePath(frameIdx + 1);

        const onFrameReady = () => {
          if (!isComponentMountedRef.current) return;
          imagesRef.current[frameIdx] = img;
          loadedFlagsRef.current[frameIdx] = true;
          activeDownloads--;
          loadedCount++;

          const percent = Math.round((loadedCount / TOTAL_FRAMES) * 100);
          setLoadedPercent(percent);
          if (onLoadingProgress) {
            onLoadingProgress(loadedCount, TOTAL_FRAMES);
          }

          // Trigger redraw so current view reflects newly arrived frames
          requestRedraw();

          pumpQueue();
        };

        img.onload = onFrameReady;
        img.onerror = () => {
          activeDownloads--;
          pumpQueue();
        };
      }
    }

    return () => {
      isComponentMountedRef.current = false;
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [drawFrameDirect, requestRedraw, onLoadingProgress]);

  // ResizeObserver for canvas resolution
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const displayWidth = Math.max(1, Math.round(rect.width));
      const displayHeight = Math.max(1, Math.round(rect.height));

      canvas.width = Math.round(displayWidth * dpr);
      canvas.height = Math.round(displayHeight * dpr);

      drawFrameDirect(targetIndexRef.current);
    };

    handleResize();

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [drawFrameDirect]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
    >
      {/* Preview placeholder ONLY until canvas initializes with Frame 1 */}
      {!firstFrameLoaded && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={getFramePath(1)}
          alt="Furnix Lounge Chair assembled form"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
      )}

      <canvas
        ref={canvasRef}
        className="w-full h-full block relative z-10"
        aria-label="Interactive 3D armchair exploded architectural sequence"
      />

      {/* Progressive loading progress pill */}
      {loadedPercent > 0 && loadedPercent < 100 && (
        <div
          className="absolute bottom-4 right-4 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full border border-[#E6E1D8] text-[10px] font-sans font-medium text-[#6B665E] pointer-events-none z-20 shadow-xs"
          aria-hidden="true"
        >
          Buffering sequence · {loadedPercent}%
        </div>
      )}
    </div>
  );
});

export default ChairScrollSequence;
