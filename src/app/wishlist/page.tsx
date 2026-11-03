"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Heart,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastNotification } from "@/components/cart/ToastNotification";
import {
  WishlistItem,
  getWishlistItems,
  getWishlistCount,
  removeFromWishlist,
  moveWishlistToCart,
  moveAllWishlistToCart,
  clearWishlist,
  subscribeToCart,
  addToCart,
  addToWishlist,
  openCartDrawer,
  cleanImageUrl,
} from "@/lib/cartStore";
import { getAllProducts, ProductDetail } from "@/lib/products";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [count, setCount] = useState(0);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [liveCatalog, setLiveCatalog] = useState<ProductDetail[]>([]);

  useEffect(() => {
    // Initial sync
    setItems([...getWishlistItems()]);
    setCount(getWishlistCount());

    const loadLiveProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setLiveCatalog(data.products);
          setItems((current) =>
            current.map((it) => {
              const live = data.products.find((p: ProductDetail) => p.id === it.id);
              return {
                ...it,
                image: cleanImageUrl(live?.image || it.image, it.id),
              };
            })
          );
        }
      } catch (err) {}
    };

    loadLiveProducts();

    // Subscribe to store updates
    const unsubscribe = subscribeToCart(() => {
      setItems([...getWishlistItems()]);
      setCount(getWishlistCount());
    });

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
      unsubscribe();
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("furnix:catalog-updated", handleSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleAddToCart = (item: WishlistItem) => {
    addToCart(item, 1);
    setAddedIds((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 1500);
  };

  const handleMoveToCart = (item: WishlistItem) => {
    moveWishlistToCart(item);
  };

  // Recommendations when empty
  const catalog = liveCatalog.length > 0 ? liveCatalog : getAllProducts();
  const recommendedItems = catalog.filter(
    (p) => !items.some((w) => w.id === p.id)
  ).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#141210] selection:bg-[#141210] selection:text-white">
      {/* Global Interactive Navigation & Notifications */}
      <CartDrawer />
      <ToastNotification />
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumbs"
            className="flex items-center space-x-2 text-[11px] font-sans uppercase tracking-[0.16em] text-[#8C8477] mb-8"
          >
            <Link href="/" className="hover:text-[#141210] transition-colors">
              HOME
            </Link>
            <span>/</span>
            <span className="text-[#141210] font-semibold">SAVED OBJECTS & WISHLIST</span>
            <span className="text-xs bg-[#EFEAE2] text-[#141210] font-mono px-2 py-0.5 rounded-full ml-1">
              {count}
            </span>
          </nav>

          {/* Page Heading & Action Controls */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b border-[#EBE5DC]">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C8477]">
                  CURATED ARCHIVE
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#BA4C35]" />
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#141210] font-normal tracking-tight">
                Saved Objects & Wishlist
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#7D766B] max-w-xl">
                Your personal collection of calm forms, preserved for deliberate consideration.
              </p>
            </div>

            {items.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={moveAllWishlistToCart}
                  className="px-5 py-3 bg-[#141210] hover:bg-black text-white text-xs font-bold uppercase tracking-[0.16em] transition-all flex items-center space-x-2 shadow-xs cursor-pointer active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move All to Bag</span>
                </button>

                <button
                  type="button"
                  onClick={clearWishlist}
                  className="px-4 py-3 border border-[#D5CEC2] hover:bg-[#EFEAE2] text-[#6B655C] hover:text-[#BA4C35] text-xs font-medium uppercase tracking-[0.14em] transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Main Body: Wishlist Grid or Empty State */}
          {items.length === 0 ? (
            /* Empty State */
            <div className="py-20 space-y-16">
              <div className="text-center max-w-md mx-auto space-y-5">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#EFEAE2] flex items-center justify-center text-[#8C8477]">
                  <Heart className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#141210]">
                  Your wishlist is awaiting pieces.
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#7D766B] leading-relaxed">
                  Click the heart icon on any piece across our collection or single product pages to keep track of objects you love.
                </p>
                <div className="pt-2">
                  <Link
                    href="/products"
                    className="inline-flex items-center space-x-2 px-6 py-3.5 bg-[#141210] hover:bg-black text-white text-xs font-bold uppercase tracking-[0.16em] transition-colors active:scale-95 shadow-xs"
                  >
                    <span>EXPLORE ARCHIVAL OBJECTS</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Recommended Items to Save */}
              {recommendedItems.length > 0 && (
                <div className="pt-12 border-t border-[#EBE5DC] space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl text-[#141210]">
                        Curated Suggestions
                      </h3>
                      <p className="text-xs text-[#8C8477] mt-1">
                        Thoughtfully crafted pieces from our Scandinavian and Japanese collection.
                      </p>
                    </div>
                    <Link
                      href="/products"
                      className="text-xs font-sans font-semibold text-[#8C8477] hover:text-[#141210] transition-colors"
                    >
                      VIEW ALL →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {recommendedItems.map((prod) => (
                      <div
                        key={prod.id}
                        className="group bg-white border border-[#EBE5DC] p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-md"
                      >
                        <div className="relative aspect-square bg-[#F7F4ED] flex items-center justify-center p-4 overflow-hidden">
                          <Link href={`/products/${prod.id}`} className="w-full h-full relative">
                            <Image
                              src={prod.image}
                              alt={prod.name}
                              fill
                              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              addToWishlist({
                                id: prod.id,
                                name: prod.name,
                                category: prod.category,
                                price: prod.price,
                                priceNum: prod.priceNum,
                                image: prod.image,
                              })
                            }
                            aria-label={`Save ${prod.name} to wishlist`}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-[#141210] shadow-xs transition-colors cursor-pointer"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold">
                            {prod.category}
                          </span>
                          <Link
                            href={`/products/${prod.id}`}
                            className="font-serif text-base text-[#141210] group-hover:text-amber-900 transition-colors block"
                          >
                            {prod.name}
                          </Link>
                          <p className="font-sans text-sm font-semibold text-[#BA4C35]">
                            {prod.price}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              addToWishlist({
                                id: prod.id,
                                name: prod.name,
                                category: prod.category,
                                price: prod.price,
                                priceNum: prod.priceNum,
                                image: prod.image,
                              })
                            }
                            className="flex-1 py-2.5 bg-[#141210] hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Save to Wishlist
                          </button>
                          <Link
                            href={`/products/${prod.id}`}
                            className="p-2.5 border border-[#141210] text-[#141210] hover:bg-[#141210] hover:text-white transition-colors"
                            aria-label={`View ${prod.name}`}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Wishlist Items Grid */
            <div className="mt-10 space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {items.map((item) => {
                  const isAdded = addedIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="group bg-white border border-[#EBE5DC] flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:border-[#D5CEC2]"
                    >
                      {/* Product Thumbnail & Top Badge */}
                      <div className="relative aspect-square bg-[#F5F1EB] flex items-center justify-center p-6 overflow-hidden">
                        <Link
                          href={`/products/${item.id}`}
                          className="w-full h-full relative flex items-center justify-center"
                        >
                          <Image
                            src={cleanImageUrl(item.image, item.id)}
                            alt={item.name}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-contain p-3 group-hover:scale-105 transition-transform duration-500 ease-out"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              const fallback = cleanImageUrl("", item.id);
                              if (target.src !== fallback) {
                                target.src = fallback;
                              }
                            }}
                          />
                        </Link>

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                          <span className="px-2 py-0.5 bg-white/90 backdrop-blur-xs text-[9px] uppercase tracking-wider font-bold text-[#141210]">
                            IN STOCK
                          </span>
                        </div>

                        {/* Remove from Wishlist Heart Button */}
                        <button
                          type="button"
                          onClick={() => removeFromWishlist(item.id)}
                          aria-label={`Remove ${item.name} from wishlist`}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-[#E04F44] shadow-xs transition-transform active:scale-90 cursor-pointer"
                        >
                          <Heart className="w-4 h-4 fill-current text-[#E04F44]" />
                        </button>
                      </div>

                      {/* Content Area */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] uppercase tracking-[0.14em] text-[#8C8477] font-semibold block">
                            {item.category || "Living & Lounge"}
                          </span>
                          <Link
                            href={`/products/${item.id}`}
                            className="font-serif text-lg text-[#141210] hover:text-[#BA4C35] transition-colors block line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          {item.material && (
                            <p className="text-[11px] text-[#7D766B] line-clamp-1">
                              {item.material}
                            </p>
                          )}
                          <p className="font-sans text-base font-bold text-[#BA4C35] pt-1">
                            {item.price}
                          </p>
                        </div>

                        {/* Actions Row */}
                        <div className="pt-2 border-t border-[#F2ECE3] flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(item)}
                            className="flex-1 py-2.5 px-3 bg-[#141210] hover:bg-black text-white text-[11px] font-bold uppercase tracking-[0.14em] transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>ADDED</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>ADD TO BAG</span>
                              </>
                            )}
                          </button>

                          <Link
                            href={`/products/${item.id}`}
                            className="p-2.5 border border-[#D5CEC2] hover:border-[#141210] text-[#141210] transition-colors"
                            aria-label={`View full details of ${item.name}`}
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-8 border-t border-[#EBE5DC] flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-[#141210] hover:text-[#BA4C35] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Discover More Pieces</span>
                </Link>

                <div className="flex items-center space-x-4">
                  <Link
                    href="/cart"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#EFEAE2] hover:bg-[#E5DFD5] text-[#141210] text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>View Shopping Bag</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Global Architectural Footer */}
      <Footer />
    </div>
  );
}
