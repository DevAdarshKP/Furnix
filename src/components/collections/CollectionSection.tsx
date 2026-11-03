"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard, CollectionItem } from "./ProductCard";

const COLLECTION_ITEMS: CollectionItem[] = [
  {
    id: "cyan-armchair",
    name: "Cyan Dining Chair",
    category: "Dining & Accent",
    price: "$620",
    priceNum: 620,
    image: "/images/cyan_chair.png",
    isFeatured: false,
    material: "Powder-coated steel framing with Mediterranean wool crepe weave",
    dimensions: "58 W × 62 D × 79 H cm (Seat 46 cm)",
    description: "An energetic dining armchair with continuous tubular steel frame and ergonomically molded shell.",
    inStock: true,
  },
  {
    id: "modular-sofa",
    name: "Modular Sofa",
    category: "Living & Lounge",
    price: "$950",
    priceNum: 950,
    image: "/images/modular_blue_sofa.png",
    isFeatured: false,
    material: "Vibrant royal cobalt bouclé with sculpted ash wood dowels",
    dimensions: "82 W × 86 D × 88 H cm (Seat 44 cm)",
    description: "A plush modular armchair with deep button tufting and ergonomic contoured armrests.",
    inStock: true,
  },
  {
    id: "day-241-shack15-armchair",
    name: "Bolle Lounge Chair",
    category: "Living & Lounge",
    price: "$2,850",
    priceNum: 2850,
    image: "/images/chair_thumb_yellow.png",
    isFeatured: true,
    material: "Solid European Oak with hand-tufted saffron wool bouclé",
    dimensions: "84 W × 88 D × 78 H cm (Seat 42 cm)",
    description: "Our signature archival lounge chair documented in San Francisco’s historic Ferry Building.",
    inStock: true,
  },
  {
    id: "bergere-wingback",
    name: "Bergère Wingback",
    category: "Lounge & Study",
    price: "$1,820",
    priceNum: 1820,
    image: "/images/wingback_chair.png",
    isFeatured: false,
    material: "Cognac full-grain saddle leather with natural linen deep-tufted inner shell",
    dimensions: "78 W × 85 D × 102 H cm (Seat 44 cm)",
    description: "A timeless wingback armchair balancing heritage button-tufting with contemporary leather wraps.",
    inStock: true,
  },
  {
    id: "dauphine-armchair",
    name: "Dauphine Armchair",
    category: "Accent & Library",
    price: "$1,450",
    priceNum: 1450,
    image: "/images/wood_armchair.png",
    isFeatured: false,
    material: "Carved walnut framing with amber velvet cushion upholstery",
    dimensions: "68 W × 74 D × 76 H cm (Seat 40 cm)",
    description: "Sculptural wooden silhouette with organic curved armrests and luxurious amber velvet seating.",
    inStock: true,
  },
  {
    id: "koto-lounge",
    name: "Koto Low Lounge",
    category: "Sofa & Lounge",
    price: "$2,100",
    priceNum: 2100,
    image: "/images/midcentury_sofa.png",
    isFeatured: false,
    material: "Bleached ash legs with ivory ribbed grid upholstery and contrast backing",
    dimensions: "92 W × 96 D × 72 H cm (Seat 38 cm)",
    description: "A minimalist low-slung lounge armchair inspired by Japanese mid-century pavilion architecture.",
    inStock: true,
  },
];

function mapToCollectionItem(p: any): CollectionItem {
  const isDefault3D = p.id === "day-241-shack15-armchair" || Boolean(p.is3D);
  return {
    id: p.id,
    name: p.name,
    category: p.category || "Living & Lounge",
    subtitle: p.subtitle,
    price: p.price,
    priceNum:
      typeof p.priceNum === "number"
        ? p.priceNum
        : parseFloat(String(p.price).replace(/[^0-9.]/g, "")) || 0,
    image: p.image || "/images/chair_thumb_yellow.png",
    isFeatured: isDefault3D,
    is3D: isDefault3D,
    material: p.quickSpecs?.material || p.material || "",
    dimensions: p.quickSpecs?.dimensions || p.dimensions || "",
    description: p.story?.content || p.description || p.subtitle || "",
    inStock: p.inStock ?? true,
  };
}

export function CollectionSection() {
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [items, setItems] = useState<CollectionItem[]>(COLLECTION_ITEMS);

  useEffect(() => {
    let isMounted = true;

    const loadLiveProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0 && isMounted) {
          const liveItems = data.products.map(mapToCollectionItem);
          setItems(liveItems);
        }
      } catch (err) {
        // Fallback remains as default catalog items
      }
    };

    loadLiveProducts();

    const handleSync = () => loadLiveProducts();
    window.addEventListener("focus", handleSync);
    window.addEventListener("furnix:catalog-updated", handleSync);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "furnix_catalog_timestamp") {
        loadLiveProducts();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("furnix:catalog-updated", handleSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Mouse drag-to-slide refs
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!galleryRef.current) return;
    isDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - galleryRef.current.offsetLeft;
    scrollLeftRef.current = galleryRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current || !galleryRef.current) return;
    const x = e.pageX - galleryRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    if (Math.abs(walk) > 5) {
      hasMovedRef.current = true;
    }
    galleryRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDownRef.current = false;
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasMovedRef.current = false;
    }
  };

  const scrollPrev = () => {
    if (!galleryRef.current) return;
    const card = galleryRef.current.querySelector(".collection-card-item") as HTMLElement;
    const scrollAmount = card ? card.offsetWidth + 32 : 360;
    galleryRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  };

  const scrollNext = () => {
    if (!galleryRef.current) return;
    const card = galleryRef.current.querySelector(".collection-card-item") as HTMLElement;
    const scrollAmount = card ? card.offsetWidth + 32 : 360;
    galleryRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section
      id="collections"
      className="w-full bg-[#0D0C0B] text-white py-20 lg:py-28 relative select-none overflow-hidden"
      aria-label="Our Collection"
    >
      {/* Editorial Header Section */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mb-10 sm:mb-14">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 sm:gap-10">
          <div className="space-y-4 sm:space-y-5">
            <h2 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Our collection
            </h2>
            <div className="flex items-center gap-3">
              <Link
                href="#collections"
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full border border-white/40 text-xs font-semibold text-white hover:bg-white hover:text-black transition-all duration-200 cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Explore Collection</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              {/* Side-Slide Navigation Controls */}
              <div className="flex items-center space-x-2 ml-1">
                <button
                  type="button"
                  onClick={scrollPrev}
                  aria-label="Previous products"
                  className="w-9 h-9 rounded-full border border-white/30 text-white/80 hover:text-white hover:border-white hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollNext}
                  aria-label="Next products"
                  className="w-9 h-9 rounded-full border border-white/30 text-white/80 hover:text-white hover:border-white hover:bg-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-sm sm:max-w-md pt-2 md:pt-4">
            <p className="font-sans text-sm sm:text-base text-[#9E988F] leading-relaxed font-normal text-left md:text-right">
              Explore our curated categories of luxury furniture, where every piece is thoughtfully crafted to elevate and enrich your living spaces.
            </p>
          </div>
        </div>
      </div>

      {/* Horizontal Side-Slidable Furniture Gallery (Displays 4 cards on desktop viewport) */}
      <div className="collection-gallery-wrapper w-full">
        <div
          ref={galleryRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClickCapture={handleClickCapture}
          className="w-full overflow-x-auto pt-4 pb-14 scrollbar-none snap-x snap-mandatory cursor-grab active:cursor-grabbing scroll-smooth"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex items-center gap-6 sm:gap-7 lg:gap-8 min-w-max px-6 sm:px-10 lg:px-14">
            {items.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                isHovered={hoveredCardId === item.id}
                onHover={setHoveredCardId}
                className="collection-card-item shrink-0 snap-center"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CollectionSection;
