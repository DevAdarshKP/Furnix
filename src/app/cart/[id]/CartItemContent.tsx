"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  ArrowUpRight,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ToastNotification } from "@/components/cart/ToastNotification";
import { getProductById } from "@/lib/products";
import {
  CartItem,
  getCartItems,
  updateCartQuantity,
  removeFromCart,
  addToCart,
  addToWishlist,
  isItemLiked,
  subscribeToCart,
} from "@/lib/cartStore";

interface CartItemContentProps {
  params: Promise<{ id: string }>;
}

export function CartItemContent({ params }: CartItemContentProps) {
  const { id } = use(params);
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  const [cartItem, setCartItem] = useState<CartItem | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  useEffect(() => {
    const updateItemState = () => {
      const items = getCartItems();
      const found = items.find((i) => i.id === product.id);
      setCartItem(found);
      if (found) {
        setQuantity(found.quantity);
      }
      setIsLiked(isItemLiked(product.id));
    };

    updateItemState();
    const unsubscribe = subscribeToCart(updateItemState);
    return unsubscribe;
  }, [product.id]);

  const handleUpdateQuantity = (newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(product.id);
      setCartItem(undefined);
    } else {
      updateCartQuantity(product.id, newQty);
      setQuantity(newQty);
    }
  };

  const handleAddBackToCart = () => {
    addToCart(
      {
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        priceNum: product.priceNum,
        image: product.image,
      },
      1
    );
  };

  const handleRemove = () => {
    removeFromCart(product.id);
    setCartItem(undefined);
  };

  const handleToggleWishlist = () => {
    addToWishlist({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      priceNum: product.priceNum,
      image: product.image,
      material: product.quickSpecs.material,
      dimensions: product.quickSpecs.dimensions,
    });
    setIsLiked(true);
  };

  const handleInstantCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);
    }, 1200);
  };

  const isInCart = Boolean(cartItem);
  const currentQuantity = isInCart ? cartItem!.quantity : quantity;
  const lineTotal = product.priceNum * currentQuantity;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#141210] selection:bg-[#141210] selection:text-white">
      {/* Global Interactive Layers */}
      <CartDrawer />
      <ToastNotification />
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Breadcrumbs Navigation */}
          <nav
            aria-label="Breadcrumbs"
            className="flex items-center space-x-2 text-[11px] font-sans uppercase tracking-[0.16em] text-[#8C8477] mb-8"
          >
            <Link href="/" className="hover:text-[#141210] transition-colors">
              HOME
            </Link>
            <span>/</span>
            <Link href="/cart" className="hover:text-[#141210] transition-colors">
              SHOPPING BAG
            </Link>
            <span>/</span>
            <span className="text-[#141210] font-semibold truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </nav>

          {/* Checkout Complete Notification */}
          {checkoutComplete ? (
            <div className="py-20 text-center max-w-xl mx-auto space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#141210]">
                Checkout Secured
              </h2>
              <p className="font-sans text-sm text-[#7D766B] leading-relaxed">
                Thank you for your order of the {product.name}. Our white-glove logistics team will coordinate delivery scheduling with you directly.
              </p>
              <div className="pt-4 flex justify-center space-x-4">
                <Link
                  href="/cart"
                  className="px-6 py-3 bg-[#141210] hover:bg-black text-white text-xs font-bold uppercase tracking-[0.16em] transition-colors"
                >
                  View Remaining Bag
                </Link>
                <Link
                  href="/products"
                  className="px-6 py-3 border border-[#141210] hover:bg-[#141210] hover:text-white text-[#141210] text-xs font-bold uppercase tracking-[0.16em] transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
              {/* Left Column: High-Res Object Presentation */}
              <div className="lg:col-span-7 space-y-6">
                {/* Visual Frame */}
                <div className="relative aspect-square sm:aspect-[4/3] bg-[#F4EFEA] border border-[#EBE5DC] flex items-center justify-center p-8 sm:p-12 overflow-hidden shadow-xs">
                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[10px] uppercase font-bold tracking-wider text-[#141210] shadow-2xs">
                      {isInCart ? "IN YOUR BAG" : "PREVIOUSLY IN BAG"}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-950/10 text-emerald-800 text-[10px] uppercase font-bold tracking-wider">
                      IN STOCK
                    </span>
                  </div>

                  {product.image && (
                    <div className="w-full h-full relative">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain p-4 transition-transform duration-500 hover:scale-105"
                        priority
                      />
                    </div>
                  )}

                  <Link
                    href={`/products/${product.id}`}
                    className="absolute bottom-4 right-4 inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-white/90 hover:bg-white text-[#141210] text-[11px] font-semibold uppercase tracking-wider backdrop-blur-xs transition-colors shadow-xs"
                  >
                    <span>3D Orbit View</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Archival Material & Wood Finish Options */}
                <div className="p-6 bg-white border border-[#EBE5DC] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-[0.16em] font-bold text-[#8C8477]">
                      ARCHIVAL SPECIFICATIONS
                    </span>
                    <span className="text-xs text-[#BA4C35] font-semibold">
                      Lot {product.sku}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs font-sans">
                    <div>
                      <span className="block text-[#8C8477] text-[10px] uppercase tracking-wider">
                        Material
                      </span>
                      <span className="font-medium text-[#141210]">
                        {product.quickSpecs.material}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[#8C8477] text-[10px] uppercase tracking-wider">
                        Dimensions
                      </span>
                      <span className="font-medium text-[#141210]">
                        {product.quickSpecs.dimensions}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[#8C8477] text-[10px] uppercase tracking-wider">
                        Craft Origin
                      </span>
                      <span className="font-medium text-[#141210]">
                        {product.quickSpecs.origin}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery & Warranty Guarantees */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans text-[#6B655C]">
                  <div className="p-4 bg-white border border-[#EBE5DC] flex items-start space-x-3">
                    <Truck className="w-4 h-4 text-[#141210] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#141210] text-[11px] uppercase font-bold">
                        White-Glove Delivery
                      </strong>
                      <span>Inside placement and complete packaging recycling included.</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-[#EBE5DC] flex items-start space-x-3">
                    <ShieldCheck className="w-4 h-4 text-[#141210] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#141210] text-[11px] uppercase font-bold">
                        10-Year Warranty
                      </strong>
                      <span>Guaranteed solid hardwood structural integrity.</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white border border-[#EBE5DC] flex items-start space-x-3">
                    <Sparkles className="w-4 h-4 text-[#141210] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[#141210] text-[11px] uppercase font-bold">
                        30-Day Trial
                      </strong>
                      <span>Experience the piece in your natural lighting and space.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Cart Item Configuration & Actions */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-7 sm:p-8 bg-white border border-[#EBE5DC] shadow-xs space-y-6">
                  {/* Category & Title */}
                  <div className="space-y-1.5 pb-5 border-b border-[#EBE5DC]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C8477]">
                        {product.category}
                      </span>
                      <span className="font-mono text-xs text-[#8C8477]">
                        SKU: {product.sku}
                      </span>
                    </div>
                    <h1 className="font-serif text-3xl sm:text-4xl text-[#141210] font-normal tracking-tight">
                      {product.name}
                    </h1>
                    <p className="font-sans text-xs text-[#7D766B]">
                      {product.subtitle}
                    </p>
                  </div>

                  {/* Pricing Overview */}
                  <div className="flex items-baseline justify-between py-2 border-b border-[#EBE5DC]">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-[#8C8477] block">
                        Unit Price
                      </span>
                      <span className="font-sans text-sm font-medium text-[#6B655C]">
                        {product.price}
                      </span>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-[#8C8477] block">
                        Item Subtotal ({currentQuantity} {currentQuantity > 1 ? "units" : "unit"})
                      </span>
                      <span className="font-serif text-2xl font-bold text-[#BA4C35]">
                        ${lineTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Modifier */}
                  <div className="space-y-2">
                    <span className="block text-[10px] uppercase tracking-[0.14em] text-[#8C8477] font-semibold">
                      QUANTITY IN SHOPPING BAG
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="inline-flex items-center border border-[#D5CEC2] bg-[#FAF8F5] h-11 px-3">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(currentQuantity - 1)}
                          disabled={!isInCart || currentQuantity <= 1}
                          aria-label="Decrease quantity"
                          className="w-7 h-7 flex items-center justify-center text-[#141210] hover:bg-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-sans text-sm font-bold text-[#141210] px-4 font-mono">
                          {currentQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(currentQuantity + 1)}
                          disabled={!isInCart}
                          aria-label="Increase quantity"
                          className="w-7 h-7 flex items-center justify-center text-[#141210] hover:bg-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {isInCart ? (
                        <button
                          type="button"
                          onClick={handleRemove}
                          className="p-3 text-[#8C8477] hover:text-[#BA4C35] transition-colors cursor-pointer border border-[#D5CEC2] hover:border-[#BA4C35]"
                          title="Remove from bag"
                          aria-label="Remove item from bag"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleAddBackToCart}
                          className="px-4 py-3 bg-[#141210] text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors"
                        >
                          Add Back to Bag
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleToggleWishlist}
                        className={`p-3 border transition-colors cursor-pointer ${
                          isLiked
                            ? "bg-[#FAF0EE] border-[#BA4C35] text-[#BA4C35]"
                            : "border-[#D5CEC2] text-[#8C8477] hover:text-[#141210]"
                        }`}
                        title={isLiked ? "Saved to Wishlist" : "Save to Wishlist"}
                        aria-label="Save item to wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? "fill-current text-[#BA4C35]" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 space-y-3">
                    <button
                      type="button"
                      onClick={handleInstantCheckout}
                      disabled={isCheckingOut}
                      className="w-full py-4 bg-[#141210] hover:bg-black text-white text-xs font-bold uppercase tracking-[0.18em] transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer active:scale-98"
                    >
                      {isCheckingOut ? (
                        <span>SECURING ORDER...</span>
                      ) : (
                        <>
                          <span>INSTANT CHECKOUT FOR THIS ITEM</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <Link
                      href="/cart"
                      className="w-full py-3.5 border border-[#141210] hover:bg-[#141210] hover:text-white text-[#141210] text-xs font-bold uppercase tracking-[0.16em] transition-all flex items-center justify-center space-x-2"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>VIEW FULL SHOPPING BAG</span>
                    </Link>
                  </div>

                  {/* Return Navigation */}
                  <div className="pt-2 flex items-center justify-between text-xs font-sans text-[#8C8477]">
                    <Link
                      href="/cart"
                      className="inline-flex items-center space-x-1.5 hover:text-[#141210] transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Bag Overview</span>
                    </Link>

                    <Link
                      href={`/products/${product.id}`}
                      className="hover:text-[#141210] transition-colors underline underline-offset-4"
                    >
                      View Full Product Page →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Global Architectural Clean Footer */}
      <Footer />
    </div>
  );
}
