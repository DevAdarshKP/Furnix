"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Heart, ShoppingBag, Check, ArrowUpRight } from "lucide-react";
import {
  CollectionItem,
  getQuickViewItem,
  closeQuickView,
  addToCart,
  toggleLike,
  isItemLiked,
  subscribeToCart,
} from "@/lib/cartStore";

export function QuickViewModal() {
  const [item, setItem] = useState<CollectionItem | null>(getQuickViewItem());
  const [isLiked, setIsLiked] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    return subscribeToCart(() => {
      const current = getQuickViewItem();
      setItem(current);
      if (current) {
        setIsLiked(isItemLiked(current.id));
      }
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && item) {
        closeQuickView();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item]);

  if (!item) return null;

  const handleAddToCart = () => {
    addToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleToggleLike = () => {
    toggleLike(item);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto select-none flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      {/* Dark frosted overlay */}
      <div
        onClick={closeQuickView}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-[#F7F4ED] rounded-[2.5rem] border border-[#DDD3C4] shadow-2xl overflow-hidden z-10 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeQuickView}
          aria-label="Close details"
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#141210] flex items-center justify-center shadow-xs transition-transform hover:scale-105 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Product Visual */}
          <div className="bg-[#E3DACD] p-8 flex items-center justify-center relative min-h-[300px] sm:min-h-[380px]">
            {item.image ? (
              <div className="relative w-full h-[260px] sm:h-[320px]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <span className="font-serif text-2xl font-bold text-[#141210]/40">FURNIX</span>
            )}

            {/* Like icon inside visual */}
            <button
              type="button"
              onClick={handleToggleLike}
              aria-label={isLiked ? `Remove ${item.name} from wishlist` : `Add ${item.name} to wishlist`}
              className="absolute bottom-5 left-5 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#141210] shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isLiked ? "fill-rose-500 text-rose-500" : "text-[#141210]/70"
                }`}
              />
            </button>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {item.category && (
                <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#8C8477] font-semibold block">
                  {item.category}
                </span>
              )}

              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#141210] tracking-tight">
                {item.name}
              </h3>

              <p className="font-sans font-bold text-xl text-[#141210]">
                {item.price}
              </p>

              <p className="font-sans text-xs sm:text-sm text-[#6B665E] leading-relaxed">
                {item.description ||
                  "A calm sculptural seating piece documented for the Furnix collection. Crafted with architectural precision, tactile comfort, and joinery intended to last across generations."}
              </p>

              {/* Specs */}
              <div className="space-y-2 pt-2 border-t border-[#DDD3C4]/70 text-xs">
                {item.material && (
                  <div>
                    <span className="text-[#8C8477] font-semibold block">Materiality</span>
                    <span className="text-[#141210] font-medium">{item.material}</span>
                  </div>
                )}
                {item.dimensions && (
                  <div>
                    <span className="text-[#8C8477] font-semibold block">Dimensions</span>
                    <span className="text-[#141210] font-medium">{item.dimensions}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-3.5 px-6 rounded-full bg-[#141210] hover:bg-black text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag · {item.price}</span>
                  </>
                )}
              </button>
            </div>

            {/* Link to Full Single Product Page */}
            <div className="pt-2 text-center">
              <Link
                href={`/products/${item.id}`}
                onClick={closeQuickView}
                className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#8C8477] hover:text-[#141210] uppercase tracking-wider transition-colors py-1 group"
              >
                <span>View Full Details & Specs</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickViewModal;
