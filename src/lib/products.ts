export interface QuickSpecs {
  designer: string;
  produced: string;
  released: string;
  origin: string;
  material: string;
  dimensions: string;
}

export interface SpecItem {
  label: string;
  value: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  breadcrumbCategory: string;
  sku: string;
  inStock: boolean;
  price: string;
  priceNum: number;
  image: string;
  is3D?: boolean;
  modelUrl?: string;
  quickSpecs: QuickSpecs;
  story: {
    title: string;
    content: string;
    linkText: string;
    linkHref: string;
  };
  additionalInfo: SpecItem[];
  relatedProductIds: string[];
}

export const PRODUCTS_CATALOG: ProductDetail[] = [
  {
    id: "day-241-shack15-armchair",
    name: "Bolle Lounge Chair",
    subtitle: "Archival Saffron Bouclé Edition",
    category: "Living & Lounge",
    breadcrumbCategory: "LOUNGE & LIVING",
    sku: "FNX-2410-OAK",
    inStock: true,
    price: "$2,850.00",
    priceNum: 2850,
    image: "/images/chair_thumb_yellow.png",
    is3D: true,
    modelUrl: "/models/arm_chair__furniture.glb",
    quickSpecs: {
      designer: "Studio Furnix",
      produced: "2024 Archival",
      released: "2026 Collection",
      origin: "Denmark / SF",
      material: "European White Oak",
      dimensions: "84 W × 88 D × 78 H cm",
    },
    story: {
      title: "Design & Heritage Story",
      content:
        "The Bolle Lounge Chair was originally documented inside San Francisco's historic Ferry Building as an architectural study in slow living. Crafted with a continuous sculptural oak joinery system and layered multi-density natural latex core, each chair balances an enclosing ergonomic contour with tactile warmth. Hand-tufted in archival saffron bouclé crepe weave, the piece is designed to age gracefully and ground calm spaces across generations.",
      linkText: "READ MORE ABOUT THE FURNIX ARCHIVAL COLLECTION",
      linkHref: "/#crafted-editorial",
    },
    additionalInfo: [
      { label: "ARCHIVAL LOT", value: "Lot 241-SF" },
      { label: "SOLID TIMBER", value: "100% Certified Oak" },
      { label: "JOINERY", value: "Mortise & Tenon" },
      { label: "GRAIN CUT", value: "Quarter-Sawn" },
      { label: "NET WEIGHT", value: "24 kg" },
      { label: "UPHOLSTERY", value: "Category 4 Bouclé" },
      { label: "OIL FINISH", value: "Organic Matte Oil" },
      { label: "ASSEMBLY", value: "White-Glove Included" },
    ],
    relatedProductIds: [
      "cyan-armchair",
      "modular-sofa",
      "bergere-wingback",
      "dauphine-armchair",
    ],
  },
  {
    id: "cyan-armchair",
    name: "Cyan Dining Chair",
    subtitle: "Continuous Tubular Steel & Wool Weave",
    category: "Dining & Accent",
    breadcrumbCategory: "DINING & ACCENT",
    sku: "FNX-1180-CYN",
    inStock: true,
    price: "$620.00",
    priceNum: 620,
    image: "/images/cyan_chair.png",
    is3D: false,
    quickSpecs: {
      designer: "Studio Furnix",
      produced: "2024",
      released: "2026 Collection",
      origin: "Milan / Copenhagen",
      material: "Powder-Coated Steel",
      dimensions: "58 W × 62 D × 79 H cm",
    },
    story: {
      title: "Design Philosophy",
      content:
        "An energetic dining armchair built around a seamless, continuous tubular steel frame and an ergonomically molded inner shell. Designed for lingering dinner conversations, it pairs architectural lightness with a Mediterranean wool crepe upholstery that resists wear while providing breathable, tactile comfort.",
      linkText: "EXPLORE DINING SEATING CONCEPTS",
      linkHref: "/#collections",
    },
    additionalInfo: [
      { label: "FRAME SPEC", value: "18mm Tubular Steel" },
      { label: "SHELL CORE", value: "Molded Polymer" },
      { label: "FABRIC WEAVE", value: "Mediterranean Crepe" },
      { label: "STACKABLE", value: "Up to 4 Units" },
      { label: "NET WEIGHT", value: "7.2 kg" },
      { label: "FLOOR GLIDES", value: "Acoustic Felt Pods" },
      { label: "PATIO USE", value: "Covered Spaces Only" },
      { label: "WARRANTY", value: "5-Year Structural" },
    ],
    relatedProductIds: [
      "day-241-shack15-armchair",
      "modular-sofa",
      "bergere-wingback",
      "dauphine-armchair",
    ],
  },
  {
    id: "modular-sofa",
    name: "Modular Sofa",
    subtitle: "Plush Royal Cobalt Bouclé Armchair",
    category: "Living & Lounge",
    breadcrumbCategory: "LIVING & LOUNGE",
    sku: "FNX-3200-BLU",
    inStock: true,
    price: "$950.00",
    priceNum: 950,
    image: "/images/modular_blue_sofa.png",
    is3D: false,
    quickSpecs: {
      designer: "Studio Furnix",
      produced: "2023",
      released: "2026 Collection",
      origin: "Stockholm",
      material: "Royal Cobalt Bouclé",
      dimensions: "82 W × 86 D × 88 H cm",
    },
    story: {
      title: "Tufted Comfort & Form",
      content:
        "Deep button tufting combines with sculpted natural ash dowels to create an anchoring living room silhouette. The contoured armrests support focused reading and relaxed repose with equal grace, grounded in dense pocket-spring suspension.",
      linkText: "DISCOVER MODULAR LIVING PIECES",
      linkHref: "/#collections",
    },
    additionalInfo: [
      { label: "BASE WOOD", value: "Solid Nordic Ash" },
      { label: "CUSHION CORE", value: "Feather & Down Layer" },
      { label: "BUTTON TUFT", value: "Hand-Tensioned Deep" },
      { label: "CONNECTORS", value: "Concealed Steel Latches" },
      { label: "NET WEIGHT", value: "31 kg" },
      { label: "RUB COUNT", value: "80,000 Martindale" },
      { label: "CARE TYPE", value: "Professional Dry Clean" },
      { label: "WARRANTY", value: "10-Year Frame" },
    ],
    relatedProductIds: [
      "day-241-shack15-armchair",
      "cyan-armchair",
      "bergere-wingback",
      "koto-lounge",
    ],
  },
  {
    id: "bergere-wingback",
    name: "Bergère Wingback",
    subtitle: "Cognac Saddle Leather & Natural Linen",
    category: "Lounge & Study",
    breadcrumbCategory: "LOUNGE & STUDY",
    sku: "FNX-4100-SAD",
    inStock: true,
    price: "$1,820.00",
    priceNum: 1820,
    image: "/images/wingback_chair.png",
    is3D: false,
    quickSpecs: {
      designer: "Studio Furnix",
      produced: "2024",
      released: "2026 Collection",
      origin: "Lyon / Gothenburg",
      material: "Full-Grain Leather",
      dimensions: "78 W × 85 D × 102 H cm",
    },
    story: {
      title: "Heritage Study & Acoustic Privacy",
      content:
        "A deliberate reinterpretation of the 18th-century French bergère armchair. Saddle-stitched cognac leather wraps an inner deep-tufted Belgian linen core, creating an acoustic sanctuary for private reading and contemplative study.",
      linkText: "VIEW STUDY & READING SEATING",
      linkHref: "/#collections",
    },
    additionalInfo: [
      { label: "LEATHER", value: "Cognac Waxed Full-Grain" },
      { label: "INNER LINEN", value: "100% Belgian Flax" },
      { label: "LEGS", value: "Walnut Stained Beech" },
      { label: "WING ANGLE", value: "15° Acoustic Shield" },
      { label: "NET WEIGHT", value: "28 kg" },
      { label: "SEAT FILL", value: "Feather-Wrapped Latex" },
      { label: "PATINA", value: "Develops with Age" },
      { label: "WARRANTY", value: "10-Year Guarantee" },
    ],
    relatedProductIds: [
      "day-241-shack15-armchair",
      "dauphine-armchair",
      "koto-lounge",
      "modular-sofa",
    ],
  },
  {
    id: "dauphine-armchair",
    name: "Dauphine Armchair",
    subtitle: "Carved Solid Walnut & Amber Velvet",
    category: "Accent & Library",
    breadcrumbCategory: "ACCENT & LIBRARY",
    sku: "FNX-5050-AMB",
    inStock: true,
    price: "$1,450.00",
    priceNum: 1450,
    image: "/images/wood_armchair.png",
    is3D: false,
    quickSpecs: {
      designer: "Studio Furnix",
      produced: "2024",
      released: "2026 Collection",
      origin: "Kyoto / Copenhagen",
      material: "American Black Walnut",
      dimensions: "68 W × 74 D × 76 H cm",
    },
    story: {
      title: "Sculptural Joinery & Warmth",
      content:
        "Continuous organic carved walnut armrests curve around the sitter in a singular sweeping line. Upholstered in lustrous amber cotton velvet that catches natural daylight, the Dauphine armchair is equal parts sculpture and functional comfort.",
      linkText: "EXPLORE ACCENT & LIBRARY OBJECTS",
      linkHref: "/#collections",
    },
    additionalInfo: [
      { label: "SOLID WOOD", value: "American Black Walnut" },
      { label: "VELVET FABRIC", value: "100% Cotton Velvet" },
      { label: "JOINERY", value: "Hand-Shaped Lap Joint" },
      { label: "WAX FINISH", value: "Carnauba & Beeswax" },
      { label: "NET WEIGHT", value: "16 kg" },
      { label: "RUB COUNT", value: "60,000 Martindale" },
      { label: "SEAT DEPTH", value: "54 cm Relaxed" },
      { label: "WARRANTY", value: "10-Year Frame" },
    ],
    relatedProductIds: [
      "day-241-shack15-armchair",
      "bergere-wingback",
      "koto-lounge",
      "cyan-armchair",
    ],
  },
  {
    id: "koto-lounge",
    name: "Koto Low Lounge",
    subtitle: "Bleached Nordic Ash & Ribbed Grid Weave",
    category: "Sofa & Lounge",
    breadcrumbCategory: "SOFA & LOUNGE",
    sku: "FNX-6200-ASH",
    inStock: true,
    price: "$2,100.00",
    priceNum: 2100,
    image: "/images/midcentury_sofa.png",
    is3D: false,
    quickSpecs: {
      designer: "Studio Furnix",
      produced: "2025",
      released: "2026 Collection",
      origin: "Tokyo / Oslo",
      material: "Bleached Nordic Ash",
      dimensions: "92 W × 96 D × 72 H cm",
    },
    story: {
      title: "Architectural Pavilion Minimalism",
      content:
        "Inspired by Japanese post-and-beam tea pavilions. Grounded close to the floor to create visual breathing room and a calm horizontal horizon in minimalist open-plan interiors.",
      linkText: "DISCOVER LOW-SLUNG ARCHITECTURAL SEATING",
      linkHref: "/#collections",
    },
    additionalInfo: [
      { label: "TIMBER", value: "Bleached Nordic Ash" },
      { label: "GRID WEAVE", value: "Ivory Textured Wool" },
      { label: "SEAT HEIGHT", value: "38 cm Low Profile" },
      { label: "RECLINE", value: "12° Ergonomic Slope" },
      { label: "NET WEIGHT", value: "26 kg" },
      { label: "CERTIFIED", value: "FSC 100% Timber" },
      { label: "JOINERY", value: "Concealed Brass Tenon" },
      { label: "WARRANTY", value: "10-Year Structural" },
    ],
    relatedProductIds: [
      "day-241-shack15-armchair",
      "dauphine-armchair",
      "bergere-wingback",
      "modular-sofa",
    ],
  },
  {
    id: "green-arm-chair",
    name: "Green Arm Chair",
    subtitle: "Olive Wool & Sculpted Solid Walnut",
    category: "Seating",
    breadcrumbCategory: "SEATING",
    sku: "FNX-9340-OLV",
    inStock: true,
    price: "$1,250.00",
    priceNum: 1250,
    image: "/images/atelier_green_armchair.jpg",
    is3D: false,
    quickSpecs: {
      designer: "Studio Furnix",
      produced: "2025",
      released: "2026 Collection",
      origin: "Copenhagen",
      material: "Solid Walnut & Olive Wool",
      dimensions: "72 W × 78 D × 80 H cm",
    },
    story: {
      title: "Tactile Organic Contours",
      content:
        "Crafted with hand-rubbed walnut joinery and woven olive bouclé wool. The ergonomic reclined backrest provides enduring support for tranquil reading spaces.",
      linkText: "EXPLORE STUDIO SEATING",
      linkHref: "/products",
    },
    additionalInfo: [
      { label: "TIMBER", value: "Solid Black Walnut" },
      { label: "FABRIC", value: "100% Virgin Olive Wool" },
      { label: "WARRANTY", value: "10-Year Guarantee" },
    ],
    relatedProductIds: ["day-241-shack15-armchair", "dauphine-armchair", "stubbe-stool"],
  },
  {
    id: "linne-table-lamp",
    name: "Linne Table Lamp",
    subtitle: "Pleated Linen Shade & Sculpted Beech",
    category: "Lighting",
    breadcrumbCategory: "LIGHTING",
    sku: "FNX-LNN-189",
    inStock: true,
    price: "$189.00",
    priceNum: 189,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
    is3D: false,
    quickSpecs: {
      designer: "Studio Furnix",
      produced: "2025",
      released: "2026 Lighting",
      origin: "Stockholm",
      material: "Pleated Linen & Solid Beech",
      dimensions: "28 W × 28 D × 48 H cm",
    },
    story: {
      title: "Diffused Ambient Glow",
      content:
        "Sculpted with a gentle droplet beechwood stem and accordion-pleated linen drum. Diffuses warm, glare-free lumination for nightstands and study desks.",
      linkText: "EXPLORE ARCHIVAL LIGHTING",
      linkHref: "/products",
    },
    additionalInfo: [
      { label: "BULB", value: "Warm LED E27 Included" },
      { label: "CORD", value: "Braided Beige Cloth (2.2m)" },
      { label: "SWITCH", value: "Solid Brass In-Line Dial" },
    ],
    relatedProductIds: ["moln-pendant", "stubbe-stool", "koto-lounge"],
  },
  {
    id: "moln-pendant",
    name: "Moln Pendant",
    subtitle: "Ribbed Washi Paper & Brass Finial",
    category: "Lighting",
    breadcrumbCategory: "LIGHTING",
    sku: "FNX-MLN-249",
    inStock: true,
    price: "$249.00",
    priceNum: 249,
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80",
    is3D: false,
    quickSpecs: {
      designer: "Studio Furnix",
      produced: "2025",
      released: "2026 Lighting",
      origin: "Kyoto / Malmö",
      material: "Washi Rice Paper & Spun Brass",
      dimensions: "44 W × 44 D × 38 H cm",
    },
    story: {
      title: "Weightless Horizon Illumination",
      content:
        "Handmade washi rice paper suspended by a natural braided cable and spun brass cap. Casts a soft, cloud-like luminescence across dining tables and lounge areas.",
      linkText: "EXPLORE PENDANT FIXTURES",
      linkHref: "/products",
    },
    additionalInfo: [
      { label: "SUSPENSION", value: "3m Braided Cord & Ceiling Rose" },
      { label: "SOCKET", value: "E26/E27 Max 60W" },
      { label: "DIMMABLE", value: "Yes, with compatible switch" },
    ],
    relatedProductIds: ["linne-table-lamp", "cyan-armchair", "stubbe-stool"],
  },
  {
    id: "stubbe-stool",
    name: "Stubbe Stool",
    subtitle: "Turned White Oak Monolithic Seat",
    category: "Seating",
    breadcrumbCategory: "SEATING",
    sku: "FNX-STB-210",
    inStock: true,
    price: "$210.00",
    priceNum: 210,
    image: "https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80",
    is3D: false,
    quickSpecs: {
      designer: "Studio Furnix",
      produced: "2024",
      released: "2026 Objects",
      origin: "Copenhagen",
      material: "Solid European White Oak",
      dimensions: "36 W × 36 D × 46 H cm",
    },
    story: {
      title: "Sculptural Utility",
      content:
        "Turned from solid European oak with three gently splayed dowel legs and a concave ergonomic seat dishing. Functions effortlessly as additional seating or an architectural side pedestal.",
      linkText: "VIEW OBJECTS & PEDESTALS",
      linkHref: "/products",
    },
    additionalInfo: [
      { label: "TIMBER", value: "100% Solid European Oak" },
      { label: "FINISH", value: "Matte Organic Oil" },
      { label: "WEIGHT", value: "4.8 kg" },
    ],
    relatedProductIds: ["green-arm-chair", "linne-table-lamp", "koto-lounge"],
  },
];

export function getProductById(id: string): ProductDetail | undefined {
  return PRODUCTS_CATALOG.find((p) => p.id === id);
}

export function getAllProducts(): ProductDetail[] {
  return PRODUCTS_CATALOG;
}

export function getPrevAndNextProduct(currentId: string): {
  prev: ProductDetail;
  next: ProductDetail;
} {
  const index = PRODUCTS_CATALOG.findIndex((p) => p.id === currentId);
  const safeIndex = index === -1 ? 0 : index;
  const prevIndex = (safeIndex - 1 + PRODUCTS_CATALOG.length) % PRODUCTS_CATALOG.length;
  const nextIndex = (safeIndex + 1) % PRODUCTS_CATALOG.length;
  return {
    prev: PRODUCTS_CATALOG[prevIndex],
    next: PRODUCTS_CATALOG[nextIndex],
  };
}
