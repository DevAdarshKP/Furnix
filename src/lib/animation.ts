import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let isScrollTriggerRegistered = false;

/**
 * Ensures GSAP plugins like ScrollTrigger are safely registered in browser environments.
 * Safe to call multiple times; registers only once on client side.
 */
export function getRegisteredGSAP() {
  if (typeof window !== "undefined") {
    if (!isScrollTriggerRegistered) {
      gsap.registerPlugin(ScrollTrigger);
      isScrollTriggerRegistered = true;
    }
    (window as any).gsap = gsap;
    (window as any).ScrollTrigger = ScrollTrigger;
  }
  return { gsap, ScrollTrigger };
}

/**
 * Computes 2D bounding rectangle in viewport pixel coordinates.
 */
export function getElementViewportCoordinates(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
  };
}

/**
 * Mathematically transforms 2D screen coordinates (pixels relative to viewport)
 * into exact 3D camera world coordinates at a given target Z depth plane.
 */
export function screenToWorldCoordinate(
  screenX: number,
  screenY: number,
  targetZ: number,
  camera: { position: { z: number }; fov: number },
  viewportWidth: number,
  viewportHeight: number
) {
  const distance = Math.max(0.1, camera.position.z - targetZ);
  const vFovRad = (camera.fov * Math.PI) / 180;
  const visibleHeight = 2 * Math.tan(vFovRad / 2) * distance;
  const visibleWidth = visibleHeight * (viewportWidth / Math.max(1, viewportHeight));

  const worldX = (screenX - viewportWidth / 2) * (visibleWidth / viewportWidth);
  const worldY = (viewportHeight / 2 - screenY) * (visibleHeight / viewportHeight);

  return { x: worldX, y: worldY, z: targetZ };
}

/**
 * Calculates the appropriate 3D model scale to comfortably fit inside a DOM element.
 */
export function calculateFitScale(
  targetPixelHeight: number,
  modelUnitHeight: number,
  targetZ: number,
  camera: { position: { z: number }; fov: number },
  viewportHeight: number,
  paddingFactor = 0.85
) {
  const distance = Math.max(0.1, camera.position.z - targetZ);
  const vFovRad = (camera.fov * Math.PI) / 180;
  const visibleHeight = 2 * Math.tan(vFovRad / 2) * distance;
  const targetWorldHeight = (targetPixelHeight / Math.max(1, viewportHeight)) * visibleHeight;
  return (targetWorldHeight / Math.max(0.01, modelUnitHeight)) * paddingFactor;
}

/**
 * Creates a React Strict Mode-safe GSAP context wrapper for animations and ScrollTriggers.
 */
export function createAnimationContext(
  scope: HTMLElement | React.RefObject<HTMLElement | null>,
  effect: (context: gsap.Context) => void
) {
  const ctx = gsap.context(effect, scope as Element | undefined);
  return () => ctx.revert();
}
