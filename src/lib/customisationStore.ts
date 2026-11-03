/**
 * Lightweight store for synchronizing the 3D chair colorway customisation
 * between ChairCustomisationSection (swatch buttons) and ChairScene (Three.js useFrame loop).
 *
 * Provides immediate state updates with 0-lag 60/120fps direct Three.js material interpolation.
 */

export type ChairColorId = "yellow" | "light-green" | "grey";

export interface ChairColorOption {
  id: ChairColorId;
  name: string;
  tagline: string;
  swatchHex: string;
  tintHex: string;
  bgHex: string;
  description: string;
  image: string;
}

export const CHAIR_COLORS: Record<ChairColorId, ChairColorOption> = {
  yellow: {
    id: "yellow",
    name: "Yellow",
    tagline: "Warm vibrant golden yellow",
    swatchHex: "#FAB005",
    tintHex: "#FFB800",
    bgHex: "#E9D9A8",
    description: "Vibrant golden sunflower wool offering an inviting focal accent with luminous Nordic warmth.",
    image: "/images/chair_thumb_yellow.png",
  },
  "light-green": {
    id: "light-green",
    name: "Light Green",
    tagline: "Muted sage green",
    swatchHex: "#738473",
    tintHex: "#758E75",
    bgHex: "#D5DFCF",
    description: "Muted botanical sage green woven with tranquil organic fibres for balanced presence.",
    image: "/images/chair_thumb_light_green.png",
  },
  grey: {
    id: "grey",
    name: "Grey",
    tagline: "Neutral medium grey",
    swatchHex: "#5E6166",
    tintHex: "#7C7E84",
    bgHex: "#D8D8D6",
    description: "Subtle textural depth woven with heathered slate fibres for rich architectural presence.",
    image: "/images/chair_thumb_grey.png",
  },
};

export const CHAIR_COLOR_LIST: ChairColorOption[] = [
  CHAIR_COLORS["yellow"],
  CHAIR_COLORS["light-green"],
  CHAIR_COLORS["grey"],
];

let activeColorId: ChairColorId = "yellow";
const listeners = new Set<(color: ChairColorOption) => void>();

export function getChairColor(): ChairColorOption {
  return CHAIR_COLORS[activeColorId];
}

export function setChairColor(id: ChairColorId): void {
  if (!CHAIR_COLORS[id] || activeColorId === id) return;
  activeColorId = id;
  const color = CHAIR_COLORS[id];
  listeners.forEach((fn) => fn(color));
}

export function subscribeToChairColor(
  fn: (color: ChairColorOption) => void
): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
