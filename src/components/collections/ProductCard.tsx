"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Heart, ShoppingBag, Check } from "lucide-react";
import {
  CollectionItem,
  addToCart,
  toggleLike,
  isItemLiked,
  subscribeToCart,
  cleanImageUrl,
} from "@/lib/cartStore";

export type { CollectionItem };

interface ProductCardProps {
  item: CollectionItem;
  className?: string;
  isHovered?: boolean;
  onHover?: (id: string | null) => void;
}

export function ProductCard({
  item,
  className = "",
  isHovered = false,
  onHover,
}: ProductCardProps) {
  const router = useRouter();
  const isFeatured = item.isFeatured;
  const is3D = Boolean(item.is3D || item.isFeatured || item.id === "day-241-shack15-armchair");
  const [isLiked, setIsLiked] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  useEffect(() => {
    setIsLiked(isItemLiked(item.id));
    return subscribeToCart(() => {
      setIsLiked(isItemLiked(item.id));
    });
  }, [item.id]);

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/products/${item.id}`);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(item);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(item);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => onHover?.(item.id)}
      onMouseLeave={() => onHover?.(null)}
      id={isFeatured ? "featured-chair-target" : undefined}
      className={`group flex flex-col w-full cursor-pointer focus:outline-none transition-all duration-300 ease-out select-none scale-100 z-10 ${className}`}
      role="article"
      aria-label={`${item.name} - ${item.price}`}
    >
      {/* Visual Product Image Area / 3D Model Reception Viewport */}
      <div
        id={isFeatured ? "chair-card-destination" : undefined}
        className="w-full aspect-square rounded-[28px] sm:rounded-[32px] bg-[#D8CEC0] relative flex items-center justify-center overflow-hidden transition-all duration-300 shadow-md group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.45)]"
      >
        {/* Out of Stock / Archival Status Badge */}
        {item.inStock === false && (
          <div className="absolute top-3.5 left-3.5 sm:top-4 sm:left-4 z-20 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[9px] uppercase font-bold tracking-wider text-[#FAF8F5] shadow-xs border border-white/10">
            Waitlist
          </div>
        )}

        {/* Wishlist Heart Button Matching Previous Design */}
        <button
          type="button"
          onClick={handleToggleLike}
          aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/75 hover:bg-white backdrop-blur-md flex items-center justify-center transition-all duration-200 text-[#141210] shadow-xs active:scale-90"
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${
              isLiked ? "fill-[#E04F44] text-[#E04F44]" : "text-[#141210]/70"
            }`}
          />
        </button>

        {/* Genuine transparent product cutout sitting directly against the warm sand card surface */}
        <div
          id={isFeatured ? "collection-chair-target" : undefined}
          className="relative w-full h-full p-4 sm:p-5 flex items-center justify-center"
        >
          {item.image ? (
            <div
              className={`relative w-full h-full flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105 ${
                isFeatured ? "opacity-0" : ""
              }`}
            >
              <Image
                src={cleanImageUrl(item.image, item.id)}
                alt={item.name}
                fill
                unoptimized
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 320px, 360px"
                className="object-contain pointer-events-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.12)] select-none"
                priority
                loading="eager"
                draggable={false}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  const fallback = cleanImageUrl("", item.id);
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full border border-white/20 bg-white/80 flex items-center justify-center text-[#141210]/60 font-sans font-bold text-xs">
              FURNIX
            </div>
          )}
        </div>
      </div>

      {/* Product Information Row with Title, Price, Bag Button, and Shop Now - Permanently visible */}
      <div className="mt-3 sm:mt-4 flex items-center justify-between gap-2 px-1 relative z-20 min-h-[48px]">
        <div className="min-w-0 flex-1">
          <h3 className="font-sans font-bold text-sm sm:text-base lg:text-base xl:text-lg text-white tracking-tight truncate">
            {item.name}
          </h3>
          <div className="flex items-center space-x-2 mt-0.5">
            <p className="font-sans font-medium text-xs sm:text-sm xl:text-base text-white/75">
              {item.price}
            </p>
            {item.inStock === false && (
              <span className="text-[10px] text-amber-400 font-mono tracking-wider font-semibold">
                · Waitlist
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons: Add to Cart Bag Button + Shop Now Pill */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={`Add ${item.name} to cart`}
            className={`w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 rounded-full flex items-center justify-center border transition-all duration-200 cursor-pointer active:scale-95 ${
              addedAnim
                ? "bg-[#34C759] border-[#34C759] text-white"
                : "border-white/30 text-white hover:border-white hover:bg-white/10"
            }`}
          >
            {addedAnim ? (
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
          <Link
            href={`/products/${item.id}`}
            aria-label={`View ${item.name} details`}
            className="inline-flex items-center space-x-1 px-2.5 sm:px-3 xl:px-3.5 py-1.5 sm:py-2 rounded-full border border-white/40 text-[11px] sm:text-xs font-semibold text-white hover:bg-white hover:text-black transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
          >
            <span>Shop</span>
            <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
