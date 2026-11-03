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
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastNotification } from "@/components/cart/ToastNotification";
import {
  CartItem,
  getCartItems,
  getCartSubtotal,
  updateCartQuantity,
  removeFromCart,
  addToWishlist,
  clearCart,
  subscribeToCart,
  showToast,
  addToCart,
} from "@/lib/cartStore";
import { getAllProducts, ProductDetail } from "@/lib/products";

const FREE_SHIPPING_THRESHOLD = 3000;

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [liveCatalog, setLiveCatalog] = useState<ProductDetail[]>([]);

  useEffect(() => {
    // Initial sync
    setItems([...getCartItems()]);
    setSubtotal(getCartSubtotal());

    const loadLiveProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setLiveCatalog(data.products);
        }
      } catch (err) {}
    };

    loadLiveProducts();

    // Subscribe to store updates and catalog updates
    const unsubscribe = subscribeToCart(() => {
      setItems([...getCartItems()]);
      setSubtotal(getCartSubtotal());
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

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    const cleaned = promoCode.trim().toUpperCase();
    if (cleaned === "SLOWHOME" || cleaned === "FURNIX10") {
      setDiscountPercent(10);
      setPromoApplied(true);
      showToast("10% Atelier Archival Privilege Applied!");
    } else if (cleaned === "ARCHIVE20") {
      setDiscountPercent(20);
      setPromoApplied(true);
      showToast("20% Collector Privilege Applied!");
    } else {
      setPromoError("Invalid code. Try code: SLOWHOME for 10% off");
    }
  };

  const handleMoveToWishlist = (item: CartItem) => {
    addToWishlist({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      priceNum: item.priceNum,
      image: item.image,
    });
    removeFromCart(item.id);
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);
      clearCart();
    }, 1400);
  };

  // Calculations
  const discountAmount = (subtotal * discountPercent) / 100;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee = items.length === 0 || isFreeShipping ? 0 : 140;
  const estimatedTax = (subtotal - discountAmount) * 0.08;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee + estimatedTax);
  const progressToFree = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  // Recommendations for empty cart or upsell
  const catalog = liveCatalog.length > 0 ? liveCatalog : getAllProducts();
  const recommendedItems = catalog.filter(
    (p) => !items.some((cartItem) => cartItem.id === p.id)
  ).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#141210] selection:bg-[#141210] selection:text-white">
      {/* Global Interactive Elements */}
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
            <span className="text-[#141210] font-semibold">SHOPPING BAG</span>
            <span className="text-xs bg-[#EFEAE2] text-[#141210] font-mono px-2 py-0.5 rounded-full ml-1">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </nav>

          {/* Page Heading */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#EBE5DC]">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#141210] font-normal tracking-tight">
                Shopping Bag
              </h1>
              <p className="font-sans text-xs sm:text-sm text-[#7D766B] mt-2">
                Review your curated pieces before complimentary white-glove architectural delivery.
              </p>
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-sans text-[#8C8477] hover:text-[#BA4C35] transition-colors underline underline-offset-4 self-start sm:self-auto cursor-pointer"
              >
                Clear Entire Bag
              </button>
            )}
          </div>

          {/* Complimentary Shipping Threshold Progress Bar */}
          {items.length > 0 && (
            <div className="mt-8 p-4 sm:p-5 bg-[#F2ECE3] border border-[#E3DDD2] rounded-none space-y-2">
              <div className="flex items-center justify-between text-xs font-sans">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-[#141210]" />
                  <span className="font-medium text-[#141210]">
                    {isFreeShipping ? (
                      <span className="text-emerald-800 font-semibold">
                        You have unlocked Complimentary White-Glove In-Home Placement
                      </span>
                    ) : (
                      <>
                        Add{" "}
                        <span className="font-bold text-[#BA4C35]">
                          ${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()}
                        </span>{" "}
                        more to unlock Complimentary White-Glove Delivery
                      </>
                    )}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-[#6B655C]">
                  Threshold: ${FREE_SHIPPING_THRESHOLD.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#DFD8CC] overflow-hidden">
                <div
                  className="h-full bg-[#141210] transition-all duration-500 ease-out"
                  style={{ width: `${progressToFree}%` }}
                />
              </div>
            </div>
          )}

          {/* Checkout Complete Modal State */}
          {checkoutComplete ? (
            <div className="py-20 text-center max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#141210]">
                Order Confirmed & Placed
              </h2>
              <p className="font-sans text-sm text-[#7D766B] leading-relaxed">
                Thank you for choosing Furnix. Your pieces are being scheduled with our white-glove delivery team. A confirmation dispatch has been recorded for your archival order.
              </p>
              <div className="pt-4 flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setCheckoutComplete(false)}
                  className="px-6 py-3 bg-[#141210] hover:bg-black text-white text-xs font-bold uppercase tracking-[0.16em] transition-colors cursor-pointer"
                >
                  Return to Archive
                </button>
                <Link
                  href="/products"
                  className="px-6 py-3 border border-[#141210] hover:bg-[#141210] hover:text-white text-[#141210] text-xs font-bold uppercase tracking-[0.16em] transition-colors"
                >
                  Browse Objects
                </Link>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div className="py-20 space-y-16">
              <div className="text-center max-w-md mx-auto space-y-5">
                <div className="w-14 h-14 mx-auto rounded-full bg-[#EFEAE2] flex items-center justify-center text-[#8C8477]">
                  <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#141210]">
                  Your shopping bag is quiet.
                </h2>
                <p className="font-sans text-xs sm:text-sm text-[#7D766B] leading-relaxed">
                  Every Furnix object is made slowly with purpose. Explore our curated living and seating collections to find a piece that stays with you.
                </p>
                <div className="pt-2">
                  <Link
                    href="/products"
                    className="inline-flex items-center space-x-2 px-6 py-3.5 bg-[#141210] hover:bg-black text-white text-xs font-bold uppercase tracking-[0.16em] transition-colors active:scale-95 shadow-xs"
                  >
                    <span>EXPLORE COLLECTIONS</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Recommended Items to Quick Add */}
              {recommendedItems.length > 0 && (
                <div className="pt-12 border-t border-[#EBE5DC] space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl sm:text-2xl text-[#141210]">
                      Curated For Calm Spaces
                    </h3>
                    <Link
                      href="/products"
                      className="text-xs font-sans font-semibold text-[#8C8477] hover:text-[#141210] transition-colors"
                    >
                      VIEW ARCHIVE →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {recommendedItems.map((prod) => (
                      <div
                        key={prod.id}
                        className="group bg-white border border-[#EBE5DC] p-5 flex flex-col justify-between space-y-4 transition-shadow hover:shadow-md"
                      >
                        <Link
                          href={`/products/${prod.id}`}
                          className="aspect-square bg-[#F7F4ED] flex items-center justify-center p-4 overflow-hidden relative"
                        >
                          <Image
                            src={prod.image}
                            alt={prod.name}
                            fill
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-[#8C8477] font-semibold">
                            {prod.category}
                          </span>
                          <h4 className="font-serif text-base text-[#141210] group-hover:text-amber-900 transition-colors">
                            {prod.name}
                          </h4>
                          <p className="font-sans text-sm font-semibold text-[#BA4C35]">
                            {prod.price}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() =>
                              addToCart({
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
                            Add to Bag
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
            /* Active Cart Items Grid */
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Desktop Column Header */}
                <div className="hidden sm:grid grid-cols-12 text-[10px] uppercase tracking-[0.16em] text-[#8C8477] font-semibold pb-3 border-b border-[#EBE5DC]">
                  <div className="col-span-6">Object</div>
                  <div className="col-span-2 text-center">Unit Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Subtotal</div>
                </div>

                {/* Items */}
                <div className="divide-y divide-[#EBE5DC]">
                  {items.map((item) => {
                    const lineSubtotal = item.priceNum * item.quantity;
                    return (
                      <div
                        key={item.id}
                        className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
                      >
                        {/* Object Visual & Description */}
                        <div className="sm:col-span-6 flex items-center space-x-4">
                          <Link
                            href={`/cart/${item.id}`}
                            className="w-20 h-20 sm:w-24 sm:h-24 bg-[#EFEAE2] flex-shrink-0 relative overflow-hidden group"
                          >
                            {item.image && (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                              />
                            )}
                          </Link>

                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-[0.14em] text-[#8C8477] font-semibold block">
                              {item.category || "Living & Lounge"}
                            </span>
                            <Link
                              href={`/cart/${item.id}`}
                              className="font-serif text-base sm:text-lg text-[#141210] hover:text-[#BA4C35] transition-colors block"
                            >
                              {item.name}
                            </Link>
                            <div className="flex items-center space-x-3 pt-1 text-xs text-[#8C8477]">
                              <Link
                                href={`/cart/${item.id}`}
                                className="inline-flex items-center space-x-0.5 text-[#141210] hover:text-[#BA4C35] font-medium transition-colors"
                              >
                                <span>Item details</span>
                                <ArrowUpRight className="w-3 h-3" />
                              </Link>
                              <span>·</span>
                              <button
                                type="button"
                                onClick={() => handleMoveToWishlist(item)}
                                className="inline-flex items-center space-x-1 hover:text-[#141210] transition-colors cursor-pointer"
                              >
                                <Heart className="w-3 h-3 text-[#E04F44]" />
                                <span>Save for later</span>
                              </button>
                              <span>·</span>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="inline-flex items-center space-x-1 hover:text-[#BA4C35] transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div className="sm:col-span-2 sm:text-center text-xs font-medium text-[#6B655C]">
                          <span className="sm:hidden text-[#8C8477] mr-1">Price:</span>
                          {item.price}
                        </div>

                        {/* Quantity Modifier */}
                        <div className="sm:col-span-2 flex items-center sm:justify-center">
                          <div className="inline-flex items-center border border-[#D5CEC2] bg-white h-9 px-2 rounded-none">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="w-6 h-6 flex items-center justify-center text-[#141210] hover:bg-[#F4EFEA] transition-colors cursor-pointer text-xs font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-sans text-xs font-semibold text-[#141210] px-2.5">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="w-6 h-6 flex items-center justify-center text-[#141210] hover:bg-[#F4EFEA] transition-colors cursor-pointer text-xs font-bold"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Line Subtotal */}
                        <div className="sm:col-span-2 sm:text-right font-sans font-bold text-sm text-[#141210]">
                          <span className="sm:hidden text-[#8C8477] mr-1">Subtotal:</span>
                          ${lineSubtotal.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Back to Catalog Link */}
                <div className="pt-4 flex items-center justify-between">
                  <Link
                    href="/products"
                    className="inline-flex items-center space-x-2 text-xs font-semibold text-[#141210] hover:text-[#BA4C35] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Continue Browsing Archive</span>
                  </Link>

                  <Link
                    href="/wishlist"
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#8C8477] hover:text-[#141210] transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 text-[#E04F44]" />
                    <span>View Saved Wishlist</span>
                  </Link>
                </div>

              </div>

              {/* Right Column: Sticky Order Summary */}
              <div className="lg:col-span-4 sticky top-28 bg-[#FFFFFF] border border-[#EBE5DC] p-6 sm:p-7 shadow-xs space-y-6">
                <h3 className="font-serif text-xl text-[#141210] font-normal pb-4 border-b border-[#EBE5DC]">
                  Order Summary
                </h3>

                <div className="space-y-3 font-sans text-xs">
                  <div className="flex items-center justify-between text-[#6B655C]">
                    <span>Items Subtotal</span>
                    <span className="text-[#141210] font-medium font-mono">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex items-center justify-between text-emerald-800">
                      <span>Privilege Discount ({discountPercent}%)</span>
                      <span className="font-mono font-medium">
                        -${discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[#6B655C]">
                    <div className="flex items-center space-x-1">
                      <span>White-Glove Placement</span>
                    </div>
                    <span className="text-[#141210] font-medium font-mono">
                      {isFreeShipping ? "COMPLIMENTARY" : `$${shippingFee}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#6B655C]">
                    <span>Estimated Architectural Tax</span>
                    <span className="text-[#141210] font-medium font-mono">
                      ${Math.round(estimatedTax).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="pt-2 border-t border-[#EBE5DC] space-y-2">
                  <span className="block text-[10px] uppercase tracking-[0.14em] text-[#8C8477] font-semibold">
                    PROMO / ARCHIVAL CODE
                  </span>
                  <div className="flex">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="e.g. SLOWHOME"
                      className="flex-1 bg-[#FAF8F5] border border-[#D5CEC2] border-r-0 text-xs px-3 py-2 text-[#141210] uppercase placeholder:normal-case placeholder-[#9E968B] focus:outline-none focus:border-[#141210]"
                    />
                    <button
                      type="submit"
                      className="px-4 bg-[#141210] hover:bg-black text-white text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="text-[11px] text-emerald-700 font-medium">
                      ✓ Privilege code active: {discountPercent}% savings applied
                    </p>
                  )}
                  {promoError && (
                    <p className="text-[11px] text-[#BA4C35] font-medium">
                      {promoError}
                    </p>
                  )}
                </form>

                {/* Total */}
                <div className="pt-4 border-t border-[#EBE5DC] space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-serif text-base text-[#141210]">Estimated Total</span>
                    <span className="font-serif text-2xl font-bold text-[#BA4C35]">
                      ${Math.round(grandTotal).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8C8477]">
                    Includes all assembly, insurance, and packaging recycling.
                  </p>
                </div>

                {/* Checkout Button */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-4 bg-[#141210] hover:bg-black text-white text-xs font-bold uppercase tracking-[0.18em] transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer active:scale-98 disabled:opacity-75"
                >
                  {isCheckingOut ? (
                    <span>SECURING ORDER...</span>
                  ) : (
                    <>
                      <span>PROCEED TO CHECKOUT</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quality Reassurance Badges */}
                <div className="pt-2 border-t border-[#EBE5DC] space-y-2.5 text-[11px] text-[#7D766B]">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-[#141210] shrink-0" />
                    <span>10-Year Solid Hardwood Frame Guarantee</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-[#141210] shrink-0" />
                    <span>White-Glove Inside Placement & Unboxing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#141210] shrink-0" />
                    <span>30-Day In-Home Tactile Evaluation</span>
                  </div>
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
