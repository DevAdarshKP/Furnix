"use client";

import React, { useEffect, useState } from "react";
import { Check, Heart, ShoppingBag } from "lucide-react";
import { getToastMessage, subscribeToCart } from "@/lib/cartStore";

export function ToastNotification() {
  const [message, setMessage] = useState<string | null>(getToastMessage());

  useEffect(() => {
    return subscribeToCart(() => {
      setMessage(getToastMessage());
    });
  }, []);

  if (!message) return null;

  const isWishlist = message.toLowerCase().includes("wishlist");

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 pointer-events-auto select-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-center space-x-3 px-5 py-3.5 bg-[#141210] text-[#FAF9F6] rounded-full shadow-2xl border border-white/10 text-xs sm:text-sm font-medium tracking-tight">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isWishlist ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
          }`}
        >
          {isWishlist ? (
            <Heart className="w-3.5 h-3.5 fill-current" />
          ) : (
            <ShoppingBag className="w-3.5 h-3.5" />
          )}
        </div>
        <span>{message}</span>
      </div>
    </div>
  );
}

export default ToastNotification;
