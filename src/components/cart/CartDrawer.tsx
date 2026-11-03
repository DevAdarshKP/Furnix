"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import {
  CartItem,
  getCartItems,
  getCartCount,
  getCartSubtotal,
  isDrawerOpen,
  closeCartDrawer,
  updateCartQuantity,
  removeFromCart,
  subscribeToCart,
  showToast,
  cleanImageUrl,
} from "@/lib/cartStore";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [count, setCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    setIsOpen(isDrawerOpen());
    setItems([...getCartItems()]);
    setCount(getCartCount());
    setSubtotal(getCartSubtotal());

    return subscribeToCart(() => {
      setIsOpen(isDrawerOpen());
      setItems([...getCartItems()]);
      setCount(getCartCount());
      setSubtotal(getCartSubtotal());
    });
  }, []);

  // Keyboard escape listener to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCartDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      showToast("Order simulated! Thank you for purchasing from Furnix.");
      closeCartDrawer();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none" aria-modal="true" role="dialog">
      {/* Dark Frosted Backdrop */}
      <div
        onClick={closeCartDrawer}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F7F4ED] border-l border-[#DED7CD] shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out">
          {/* Header */}
          <div className="p-6 border-b border-[#DED7CD] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-[#141210] flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#141210]">
                Your Bag ({count})
              </h2>
            </div>

            <button
              type="button"
              onClick={closeCartDrawer}
              aria-label="Close bag drawer"
              className="p-2 rounded-full text-[#141210]/60 hover:text-[#141210] hover:bg-[#EBE6DC] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#E8E1D5] flex items-center justify-center text-[#141210]/40">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-sans font-bold text-[#141210] text-base">Your bag is empty</p>
                  <p className="font-sans text-xs text-[#6B665E]">
                    Explore our curated collection and add signature furniture pieces.
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={closeCartDrawer}
                  className="mt-2 inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#141210] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#EFECE3] border border-[#DDD3C4]/70 shadow-2xs"
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/cart/${item.id}`}
                    onClick={closeCartDrawer}
                    className="w-18 h-18 rounded-xl bg-[#E3DACD] relative overflow-hidden shrink-0 flex items-center justify-center p-1.5 border border-[#DDD3C4]/50 group"
                  >
                    <Image
                      src={cleanImageUrl(item.image, item.id)}
                      alt={item.name}
                      fill
                      unoptimized
                      sizes="72px"
                      className="object-contain p-1 transition-transform group-hover:scale-105"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        const fallback = cleanImageUrl("", item.id);
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/cart/${item.id}`}
                      onClick={closeCartDrawer}
                      className="font-sans font-bold text-sm text-[#141210] truncate block hover:text-[#BA4C35] transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="font-sans font-semibold text-xs text-[#141210]/80 mt-0.5">
                      {item.price}
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center border border-[#141210]/20 rounded-full bg-white/70 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="px-2 py-0.5 text-[#141210] hover:bg-[#141210]/10 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#141210]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="px-2 py-0.5 text-[#141210] hover:bg-[#141210]/10 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="p-1 text-[#141210]/40 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#DED7CD] bg-[#F2EFE9] space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-sans text-[#6B665E]">Estimated Subtotal</span>
                <span className="font-sans font-bold text-lg text-[#141210]">
                  ${subtotal.toLocaleString()}
                </span>
              </div>

              <p className="font-sans text-[11px] text-[#8C8477] leading-relaxed">
                Taxes and complimentary white-glove architectural delivery calculated at checkout.
              </p>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-4 rounded-full bg-[#141210] hover:bg-black text-white text-sm font-semibold flex items-center justify-center space-x-2 transition-all shadow-md active:scale-98 cursor-pointer"
              >
                {isCheckingOut ? (
                  <span>Securing Order...</span>
                ) : (
                  <>
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 flex items-center justify-between text-xs font-sans">
                <Link
                  href="/cart"
                  onClick={closeCartDrawer}
                  className="font-semibold text-[#141210] hover:text-[#BA4C35] transition-colors underline underline-offset-4"
                >
                  View Full Bag Page →
                </Link>

                <Link
                  href="/wishlist"
                  onClick={closeCartDrawer}
                  className="text-[#6B665E] hover:text-[#141210] transition-colors"
                >
                  Saved Wishlist
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
