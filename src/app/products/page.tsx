"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Check, Heart, ArrowLeft, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import {
  addToCart,
  toggleLike,
  isItemLiked,
  subscribeToCart,
  openCartDrawer,
  cleanImageUrl,
} from "@/lib/cartStore";
import { ProductDetail } from "@/lib/products";

// Soft luxury pastel tinted backgrounds matching the aesthetic in the design reference
const PASTEL_TINTS = [
  "bg-[#E3EBE3]", // Soft Sage Green
  "bg-[#F6EED8]", // Soft Warm Butter Cream
  "bg-[#E1E8F2]", // Soft Sky Blue
  "bg-[#EBE5DC]", // Soft Oatmeal Sand
];

// Product badges for known pieces (with dynamic fallbacks for new database items)
const BADGE_MAP: Record<string, string> = {
  "day-241-shack15-armchair": "Signature 3D",
  "cyan-armchair": "Curated",
  "modular-sofa": "Plush Bouclé",
  "bergere-wingback": "Heritage",
  "dauphine-armchair": "Archival",
  "koto-lounge": "Low stock",
  "green-arm-chair": "Bestseller",
};

// Ratings map for authentic catalog presentation (with dynamic fallbacks for new database items)
const RATINGS_MAP: Record<string, { stars: number; count: number }> = {
  "day-241-shack15-armchair": { stars: 5.0, count: 428 },
  "cyan-armchair": { stars: 4.8, count: 184 },
  "modular-sofa": { stars: 4.9, count: 215 },
  "bergere-wingback": { stars: 4.9, count: 162 },
  "dauphine-armchair": { stars: 4.9, count: 96 },
  "koto-lounge": { stars: 5.0, count: 64 },
  "green-arm-chair": { stars: 4.9, count: 312 },
};

export default function CompleteCollectionPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [toastProduct, setToastProduct] = useState<string | null>(null);
  const [addedItemAnim, setAddedItemAnim] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Strictly fetch database products from MongoDB API
  useEffect(() => {
    let isMounted = true;

    const fetchDatabaseProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) {
          if (isMounted) setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && isMounted) {
          // Exclusively use products stored in the database - no dummy data
          setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to fetch database products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDatabaseProducts();

    const handleSync = () => fetchDatabaseProducts();
    window.addEventListener("focus", handleSync);
    window.addEventListener("furnix:catalog-updated", handleSync);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "furnix_catalog_timestamp") {
        fetchDatabaseProducts();
      }
    };
    window.addEventListener("storage", handleStorage);

    const updateLikes = () => {
      const set = new Set<string>();
      products.forEach((p) => {
        if (isItemLiked(p.id)) set.add(p.id);
      });
      setLikedIds(set);
    };

    updateLikes();
    const unsubscribe = subscribeToCart(updateLikes);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("furnix:catalog-updated", handleSync);
      window.removeEventListener("storage", handleStorage);
      unsubscribe();
    };
  }, [products.length]);

  // Extract unique categories for filter tabs dynamically from live database items
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  // Apply selected category filter across all database products
  const displayedProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter(
      (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [products, selectedCategory]);

  const handleAddToCart = (e: React.MouseEvent, product: ProductDetail) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      priceNum: product.priceNum,
      image: cleanImageUrl(product.image, product.id),
    });

    setAddedItemAnim(product.id);
    setToastProduct(product.name);

    setTimeout(() => {
      setAddedItemAnim(null);
    }, 1200);

    setTimeout(() => {
      setToastProduct((prev) => (prev === product.name ? null : prev));
    }, 4500);
  };

  const handleToggleLike = (e: React.MouseEvent, product: ProductDetail) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      priceNum: product.priceNum,
      image: cleanImageUrl(product.image, product.id),
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#141210] font-sans selection:bg-[#141210] selection:text-white flex flex-col justify-between">
      {/* Site Navigation Bar */}
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 lg:px-12 pt-32 sm:pt-36 pb-24">
        {/* Breadcrumb / Return to Storefront */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs text-[#7A7367] hover:text-[#141210] transition-colors font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Return to Storefront</span>
          </Link>
        </div>

        {/* Section Header with Category Filter Tabs (Matching reference design) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-10 sm:pb-12 border-b border-[#E6DFD5]">
          <div className="space-y-2">
            <span className="text-[11px] uppercase font-bold tracking-[0.24em] text-[#8C8477] block">
              MOST LOVED
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold tracking-tight text-[#141210]">
              This week&apos;s favourites
            </h1>
            <p className="text-xs sm:text-sm text-[#7A7367] max-w-xl leading-relaxed pt-1">
              Explore our extended curation of seating, handcrafted materials, and architectural objects.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-end">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#141210] text-[#FAF8F5] shadow-xs"
                      : "bg-transparent text-[#7A7367] hover:text-[#141210] hover:bg-black/5"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7 lg:gap-8 pt-10 sm:pt-12">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col w-full animate-pulse">
                <div
                  className={`w-full aspect-square rounded-[28px] sm:rounded-[32px] ${PASTEL_TINTS[i % PASTEL_TINTS.length]} opacity-60`}
                />
                <div className="mt-4 space-y-2 px-1">
                  <div className="h-3 w-16 bg-[#DDD6CA] rounded-full" />
                  <div className="h-4 w-32 bg-[#D0C7B8] rounded-full" />
                  <div className="h-3 w-20 bg-[#DDD6CA] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <p className="font-serif text-xl text-[#141210]">No additional items found in this category</p>
            <p className="text-xs text-[#7A7367]">Try selecting “All” or exploring other categories.</p>
            <button
              onClick={() => setSelectedCategory("All")}
              className="mt-3 px-5 py-2 bg-[#141210] text-white rounded-full text-xs font-semibold cursor-pointer"
            >
              Reset Category Filter
            </button>
          </div>
        ) : (
          /* Products Grid with only Database Items */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7 lg:gap-8 pt-10 sm:pt-12">
            {displayedProducts.map((product, idx) => {
              const tint = PASTEL_TINTS[idx % PASTEL_TINTS.length];
              const badge =
                BADGE_MAP[product.id] ||
                (product.inStock === false
                  ? "Waitlist"
                  : product.is3D
                  ? "3D View"
                  : "Curated");
              const rating = RATINGS_MAP[product.id] || { stars: 4.9, count: 48 };
              const isLiked = likedIds.has(product.id);
              const isAdded = addedItemAnim === product.id;

              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/products/${product.id}`)}
                  className="group flex flex-col w-full cursor-pointer focus:outline-none transition-all duration-300 ease-out select-none"
                  role="article"
                >
                  {/* Visual Pastel Squircle Container */}
                  <div
                    className={`w-full aspect-square rounded-[28px] sm:rounded-[32px] ${tint} relative flex items-center justify-center overflow-hidden transition-all duration-300 shadow-xs group-hover:shadow-[0_16px_36px_rgba(20,18,16,0.12)]`}
                  >
                    {/* Top-Left Status Badge */}
                    <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-20 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[9px] uppercase font-bold tracking-wider text-[#141210] shadow-2xs border border-white/40">
                      {badge}
                    </div>

                    {/* Top-Right Wishlist Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleLike(e, product)}
                      aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                      className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center transition-all duration-200 text-[#141210] shadow-2xs active:scale-90"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors duration-200 ${
                          isLiked ? "fill-[#E04F44] text-[#E04F44]" : "text-[#141210]/70"
                        }`}
                      />
                    </button>

                    {/* Product Cutout Image */}
                    <div className="relative w-full h-full p-6 sm:p-7 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
                      <Image
                        src={cleanImageUrl(product.image, product.id)}
                        alt={product.name}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 360px"
                        className="object-contain pointer-events-none mix-blend-multiply select-none"
                        priority={idx < 4}
                        loading={idx < 4 ? "eager" : "lazy"}
                        draggable={false}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          const fallback = cleanImageUrl("", product.id);
                          if (target.src !== fallback) {
                            target.src = fallback;
                          }
                        }}
                      />
                    </div>

                    {/* Bottom-Right Circular Add (+) Button */}
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, product)}
                      aria-label={`Add ${product.name} to cart`}
                      className={`absolute bottom-3.5 right-3.5 sm:bottom-4 sm:right-4 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-90 ${
                        isAdded
                          ? "bg-emerald-600 text-white scale-105"
                          : "bg-[#141210] hover:bg-black text-white hover:scale-105"
                      }`}
                      title={`Add ${product.name} to bag`}
                    >
                      {isAdded ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </button>
                  </div>

                  {/* Product Details under Squircle */}
                  <div className="mt-3.5 space-y-1 px-1">
                    <span className="text-[11px] text-[#7A7367] font-medium block uppercase tracking-wider">
                      {product.category || "Seating"}
                    </span>

                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-sans font-bold text-sm sm:text-base text-[#141210] tracking-tight truncate">
                        {product.name}
                      </h3>
                      <span className="font-sans font-bold text-sm sm:text-base text-[#141210] font-mono shrink-0">
                        {product.price}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 text-xs text-[#7A7367] pt-0.5">
                      <span className="text-amber-500 text-xs">★</span>
                      <span className="font-semibold text-[#141210] text-[11px]">{rating.stars}</span>
                      <span className="text-[11px] text-[#8C8477]">({rating.count})</span>
                      {product.inStock === false && (
                        <span className="text-[10px] text-rose-700 font-mono tracking-wider font-semibold ml-2">
                          · Waitlist
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Pill Toast Notification */}
      {toastProduct && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200 pointer-events-auto"
        >
          <div className="flex items-center space-x-3 px-4 py-2.5 bg-[#141210] text-[#FAF8F5] rounded-full shadow-2xl border border-white/10 text-xs sm:text-sm font-medium">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center font-bold">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="font-sans tracking-tight">
              {toastProduct} added to your bag
            </span>
            <button
              type="button"
              onClick={() => openCartDrawer()}
              className="px-3 py-1 bg-white hover:bg-[#FAF8F5] text-[#141210] rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ml-1"
            >
              View bag
            </button>
          </div>
        </div>
      )}

      {/* Shopping Bag Drawer Component */}
      <CartDrawer />

      {/* Site Footer */}
      <Footer />
    </div>
  );
}
