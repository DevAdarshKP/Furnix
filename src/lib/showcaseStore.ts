/**
 * Lightweight store for synchronizing the scroll-driven material showcase
 * between ProductDetailSection (GSAP ScrollTrigger) and ChairScene (Three.js useFrame loop).
 * 
 * Allows 60/120fps direct Three.js animation updates with zero React re-render overhead.
 */

let currentProgress = 0;
const subscribers = new Set<(progress: number) => void>();

export function setShowcaseProgress(progress: number): void {
  const clamped = Math.max(0, Math.min(1, progress));
  currentProgress = clamped;
  subscribers.forEach((callback) => callback(clamped));
}

export function getShowcaseProgress(): number {
  return currentProgress;
}

export function subscribeToShowcaseProgress(callback: (progress: number) => void): () => void {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}
