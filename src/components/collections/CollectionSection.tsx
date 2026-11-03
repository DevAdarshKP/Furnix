"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductCard, CollectionItem } from "./ProductCard";

const COLLECTION_ITEMS: CollectionItem[] = [
  {
    id: "day-241-shack15-armchair",
    name: "Bolle Lounge Chair",
    category: "Living & Lounge",
    price: "$2,850",
    priceNum: 2850,
    image: "/images/bolle_lounge_chair.png",
    isFeatured: true,
    material: "Solid European Oak with hand-tufted saffron wool bouclé",
    dimensions: "84 W × 88 D × 78 H cm (Seat 42 cm)",
    description: "Our signature archival lounge chair documented in San Francisco’s historic Ferry Building.",
    inStock: true,
  },
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
  const isDefault3D = p.id === "day-241-shack15-armchair";
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
    image: p.image || "/images/bolle_lounge_chair.png",
    isFeatured: isDefault3D,
    is3D: isDefault3D,
    material: p.quickSpecs?.material || p.material || "",
    dimensions: p.quickSpecs?.dimensions || p.dimensions || "",
    description: p.story?.content || p.description || p.subtitle || "",
    inStock: p.inStock ?? true,
  };
}

export function CollectionSection() {
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
          // Always ensure the signature 3D Bolle Lounge Chair remains Card 1 (index 0)
          const featuredIdx = liveItems.findIndex((it: CollectionItem) => it.id === "day-241-shack15-armchair");
          if (featuredIdx > 0) {
            const [featuredItem] = liveItems.splice(featuredIdx, 1);
            liveItems.unshift(featuredItem);
          }
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

  // Display only the first 4 chairs including the 3D chair at index 0
  const displayedItems = items.slice(0, 4);

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
                href="/products"
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full border border-white/40 text-xs font-semibold text-white hover:bg-white hover:text-black transition-all duration-200 cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Explore Collection</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="max-w-sm sm:max-w-md pt-2 md:pt-4">
            <p className="font-sans text-sm sm:text-base text-[#9E988F] leading-relaxed font-normal text-left md:text-right">
              Explore our curated categories of luxury furniture, where every piece is thoughtfully crafted to elevate and enrich your living spaces.
            </p>
          </div>
        </div>
      </div>

      {/* Curated 4-Chair Collection Display */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-6 lg:gap-6 xl:gap-8">
          {displayedItems.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              isHovered={hoveredCardId === item.id}
              onHover={setHoveredCardId}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CollectionSection;
