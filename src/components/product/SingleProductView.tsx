"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
  Copy,
  Heart,
} from "lucide-react";
import { ProductDetail, getPrevAndNextProduct, getProductById, getAllProducts } from "@/lib/products";
import { Product3DViewer } from "./Product3DViewer";
import { addToCart, openCartDrawer, isItemLiked, toggleLike, subscribeToCart } from "@/lib/cartStore";

interface SingleProductViewProps {
  product: ProductDetail;
}

export function SingleProductView({ product }: SingleProductViewProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductDetail[]>([]);

  useEffect(() => {
    setIsLiked(isItemLiked(product.id));
    const unsubscribe = subscribeToCart(() => {
      setIsLiked(isItemLiked(product.id));
    });

    const loadLiveProducts = async () => {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          setAllProducts(data.products);
        }
      } catch (err) {}
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
      unsubscribe();
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("furnix:catalog-updated", handleSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, [product.id]);

  const catalogList = allProducts.length > 0 ? allProducts : getAllProducts();
  const safeIndex = catalogList.findIndex((p: ProductDetail) => p.id === product.id);
  const prev =
    safeIndex > 0
      ? catalogList[safeIndex - 1]
      : catalogList[catalogList.length - 1] || product;
  const next =
    safeIndex !== -1 && safeIndex < catalogList.length - 1
      ? catalogList[safeIndex + 1]
      : catalogList[0] || product;

  // Map related products dynamically from live catalog
  const relatedProducts = (product.relatedProductIds || [])
    .map((id) => catalogList.find((p: ProductDetail) => p.id === id) || getProductById(id))
    .filter((p): p is ProductDetail => Boolean(p))
    .slice(0, 4);

  const handleDecrement = () => {
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleIncrement = () => {
    setQuantity((q) => q + 1);
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      priceNum: product.priceNum,
      image: product.image,
      category: product.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      priceNum: product.priceNum,
      image: product.image,
      category: product.category,
    });
    openCartDrawer();
  };

  const handleToggleWishlist = () => {
    toggleLike({
      id: product.id,
      name: product.name,
      subtitle: product.subtitle,
      category: product.category,
      price: product.price,
      priceNum: product.priceNum,
      image: product.image,
      material: product.quickSpecs.material,
      dimensions: product.quickSpecs.dimensions,
      inStock: product.inStock,
    });
  };

  const handleCopyShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1800);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-[#141210] font-sans antialiased selection:bg-[#EAE4D8]">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-24 sm:pt-28 pb-20">
        
        {/* =====================================================================
            1. BREADCRUMBS & PREV/NEXT PRODUCT NAV BAR
            ===================================================================== */}
        <div className="flex items-center justify-between pb-8 sm:pb-12 border-b border-[#EBE5DC] text-[11px] sm:text-xs text-[#8C8477] uppercase tracking-[0.14em]">
          {/* Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2.5 truncate pr-4">
            <Link href="/" className="hover:text-[#141210] transition-colors">
              HOME
            </Link>
            <span className="text-[#C5BEB3]">/</span>
            <Link href="/#collections" className="hover:text-[#141210] transition-colors">
              COLLECTION
            </Link>
            <span className="text-[#C5BEB3]">/</span>
            <Link href="/#collections" className="hover:text-[#141210] transition-colors">
              {product.breadcrumbCategory}
            </Link>
            <span className="text-[#C5BEB3]">/</span>
            <span className="font-semibold text-[#141210] truncate">
              {product.name}
            </span>
          </nav>

          {/* Prev / Next Pagination Controls Matching Reference */}
          <div className="flex items-center space-x-2 shrink-0">
            <Link
              href={`/products/${prev.id}`}
              title={`Previous: ${prev.name}`}
              className="w-8 h-8 rounded-full border border-[#DED7CD] flex items-center justify-center hover:bg-[#141210] hover:text-white hover:border-[#141210] transition-all cursor-pointer active:scale-95"
              aria-label="Previous product"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
            <Link
              href={`/products/${next.id}`}
              title={`Next: ${next.name}`}
              className="w-8 h-8 rounded-full border border-[#DED7CD] flex items-center justify-center hover:bg-[#141210] hover:text-white hover:border-[#141210] transition-all cursor-pointer active:scale-95"
              aria-label="Next product"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* =====================================================================
            2. HERO PRODUCT DISPLAY (2 COLUMNS)
            ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-10 sm:pt-14 pb-16 lg:pb-20">
          
          {/* Left Column: Product Visual Presentation / 3D Model View */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <Product3DViewer product={product} />
          </div>

          {/* Right Column: Title, SKU, Price, Specs Table, Add to Cart, Share */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:pl-4">
            
            {/* Title */}
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[42px] leading-[1.12] text-[#141210] font-normal tracking-[-0.02em]">
                {product.name}
              </h1>
              {product.subtitle && (
                <p className="font-sans text-xs text-[#8C8477] uppercase tracking-wider mt-1 font-medium">
                  {product.subtitle}
                </p>
              )}
            </div>

            {/* SKU and Stock Status Row */}
            <div className="flex items-center space-x-4 text-xs font-sans tracking-wider">
              <span className="text-[#8C8477] font-medium">
                SKU: <span className="text-[#141210] font-semibold">{product.sku}</span>
              </span>
              <span className="text-[#D8D0C3]">|</span>
              {product.inStock !== false ? (
                <span className="inline-flex items-center space-x-1.5 text-emerald-700 font-semibold text-[11px] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span>IN STOCK</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 text-[#BA4C35] font-semibold text-[11px] uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#BA4C35]" />
                  <span>ARCHIVAL WAITLIST / OUT OF STOCK</span>
                </span>
              )}
            </div>

            {/* Price Display in Signature Editorial Warm Terracotta */}
            <div className="pt-1">
              <span className="font-sans text-3xl sm:text-4xl font-semibold text-[#BA4C35] tracking-tight">
                {product.price}
              </span>
            </div>

            {/* Quick Specs Grid (3 Columns x 2 Rows) Matching Reference Layout */}
            <div className="grid grid-cols-3 gap-x-6 gap-y-5 py-6 border-y border-[#EBE5DC]">
              {/* Designer */}
              <div className="space-y-1">
                <span className="block font-sans text-[10px] uppercase tracking-[0.14em] text-[#8C8477] font-semibold">
                  DESIGNER
                </span>
                <Link
                  href="/#crafted-editorial"
                  className="inline-block font-sans text-xs sm:text-sm font-semibold text-[#141210] underline underline-offset-4 decoration-[#141210]/30 hover:decoration-[#141210] transition-colors"
                >
                  {product.quickSpecs.designer}
                </Link>
              </div>

              {/* Produced */}
              <div className="space-y-1">
                <span className="block font-sans text-[10px] uppercase tracking-[0.14em] text-[#8C8477] font-semibold">
                  PRODUCED
                </span>
                <span className="block font-sans text-xs sm:text-sm font-medium text-[#141210]">
                  {product.quickSpecs.produced}
                </span>
              </div>

              {/* Released */}
              <div className="space-y-1">
                <span className="block font-sans text-[10px] uppercase tracking-[0.14em] text-[#8C8477] font-semibold">
                  RELEASED
                </span>
                <span className="block font-sans text-xs sm:text-sm font-medium text-[#141210]">
                  {product.quickSpecs.released}
                </span>
              </div>

              {/* Origin */}
              <div className="space-y-1">
                <span className="block font-sans text-[10px] uppercase tracking-[0.14em] text-[#8C8477] font-semibold">
                  ORIGIN
                </span>
                <span className="block font-sans text-xs sm:text-sm font-medium text-[#141210]">
                  {product.quickSpecs.origin}
                </span>
              </div>

              {/* Material */}
              <div className="space-y-1">
                <span className="block font-sans text-[10px] uppercase tracking-[0.14em] text-[#8C8477] font-semibold">
                  MATERIAL
                </span>
                <span className="block font-sans text-xs sm:text-sm font-medium text-[#141210] truncate">
                  {product.quickSpecs.material}
                </span>
              </div>

              {/* Dimensions */}
              <div className="space-y-1">
                <span className="block font-sans text-[10px] uppercase tracking-[0.14em] text-[#8C8477] font-semibold">
                  DIMENSIONS
                </span>
                <span className="block font-sans text-xs sm:text-sm font-medium text-[#141210] truncate">
                  {product.quickSpecs.dimensions}
                </span>
              </div>
            </div>

            {/* Action Buttons Row: Quantity + ADD TO CART + BUY NOW */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Quantity Selector Matching Reference [ - 1 + ] */}
              <div className="flex items-center justify-between border border-[#D5CEC2] bg-white h-12 px-3 rounded-none w-full sm:w-28 shrink-0">
                <button
                  type="button"
                  onClick={handleDecrement}
                  aria-label="Decrease quantity"
                  className="w-7 h-7 flex items-center justify-center text-[#141210] hover:bg-[#F4EFEA] transition-colors cursor-pointer text-sm font-bold"
                >
                  −
                </button>
                <span className="font-sans text-xs font-semibold text-[#141210] px-2">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  aria-label="Increase quantity"
                  className="w-7 h-7 flex items-center justify-center text-[#141210] hover:bg-[#F4EFEA] transition-colors cursor-pointer text-sm font-bold"
                >
                  +
                </button>
              </div>

              {/* Add To Cart Outline Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 h-12 px-6 border border-[#141210] bg-white hover:bg-[#141210] hover:text-white text-[#141210] transition-all duration-200 text-xs font-bold uppercase tracking-[0.18em] cursor-pointer flex items-center justify-center space-x-2 active:scale-98"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>ADDED TO BAG</span>
                  </>
                ) : (
                  <span>ADD TO CART</span>
                )}
              </button>

              {/* Buy Now Solid Dark Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                className={`flex-1 h-12 px-6 transition-all duration-200 text-xs font-bold uppercase tracking-[0.18em] cursor-pointer flex items-center justify-center active:scale-98 shadow-sm ${
                  product.inStock !== false
                    ? "bg-[#211E1B] hover:bg-black text-white"
                    : "bg-[#7A3626] hover:bg-[#662C1E] text-white"
                }`}
              >
                <span>{product.inStock !== false ? "BUY NOW" : "RESERVE WAITLIST"}</span>
              </button>

              {/* Wishlist Heart Button */}
              <button
                type="button"
                onClick={handleToggleWishlist}
                aria-label={isLiked ? "Remove from wishlist" : "Save to wishlist"}
                className={`w-12 h-12 border border-[#D5CEC2] flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 ${
                  isLiked
                    ? "bg-[#FAF0EE] border-[#BA4C35] text-[#BA4C35]"
                    : "bg-white hover:bg-[#F7F4ED] text-[#141210]"
                }`}
                title={isLiked ? "Saved to Wishlist" : "Save to Wishlist"}
              >
                <Heart
                  className={`w-4 h-4 transition-transform ${
                    isLiked ? "fill-current text-[#BA4C35] scale-110" : ""
                  }`}
                />
              </button>
            </div>

            {/* Social Share Row Matching Reference */}
            <div className="pt-4 flex items-center space-x-3 text-xs text-[#8C8477]">
              <span className="font-sans font-semibold uppercase tracking-wider text-[10px]">
                SHARE:
              </span>
              <div className="flex items-center space-x-3 text-[#141210]/60">
                <button
                  type="button"
                  onClick={handleCopyShare}
                  title="Copy link"
                  className="hover:text-[#141210] transition-colors cursor-pointer"
                >
                  {copiedLink ? (
                    <span className="text-emerald-700 font-bold text-[10px]">COPIED!</span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    product.name + " - Furnix Studio"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#141210] transition-colors text-xs font-semibold"
                >
                  X
                </a>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#141210] transition-colors text-xs font-semibold"
                >
                  P
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#141210] transition-colors text-xs font-semibold"
                >
                  F
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            3. DISTILLERY INFO / STORY & CRAFT SECTION (Matching Reference)
            ===================================================================== */}
        <section className="py-12 sm:py-16 border-t border-[#EBE5DC]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Label */}
            <div className="md:col-span-3">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#141210] font-normal tracking-tight">
                Studio & Craft
              </h2>
            </div>

            {/* Right Story Description with Read More Link */}
            <div className="md:col-span-9 space-y-4 max-w-3xl">
              <p className="font-sans text-sm sm:text-[15px] text-[#4A453E] leading-[1.8] font-normal">
                <strong className="font-bold text-[#141210]">{product.name}</strong>{" "}
                {product.story.content}
              </p>
              <div>
                <Link
                  href={product.story.linkHref}
                  className="inline-flex items-center space-x-1.5 font-sans text-xs font-semibold text-[#BA4C35] hover:text-[#9A3924] uppercase tracking-wider transition-colors pt-2 group"
                >
                  <span>{product.story.linkText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            4. ADDITIONAL INFO / TECHNICAL SPECIFICATIONS (Matching Reference)
            ===================================================================== */}
        <section className="py-12 sm:py-16 border-t border-[#EBE5DC]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Label */}
            <div className="md:col-span-3">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#141210] font-normal tracking-tight">
                Additional Info
              </h2>
            </div>

            {/* Right 4-Column Structured Technical Data Table */}
            <div className="md:col-span-9">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-7">
                {product.additionalInfo.map((info, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="block font-sans text-[10px] uppercase tracking-[0.14em] text-[#8C8477] font-semibold">
                      {info.label}
                    </span>
                    <span className="block font-sans text-xs sm:text-sm font-semibold text-[#141210]">
                      {info.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            5. RELATED PRODUCTS (Matching Reference 4-Item Row)
            ===================================================================== */}
        <section className="py-14 sm:py-18 border-t border-[#EBE5DC]">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#141210] font-normal tracking-tight">
              Related Products
            </h2>
            <Link
              href="/#collections"
              className="inline-flex items-center space-x-1 font-sans text-xs font-semibold text-[#BA4C35] hover:text-[#9A3924] uppercase tracking-wider transition-colors"
            >
              <span>VIEW MORE IN THIS CATEGORY</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4-Item Horizontal Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {relatedProducts.map((rel) => (
              <Link
                key={rel.id}
                href={`/products/${rel.id}`}
                className="group flex flex-col items-center text-center cursor-pointer"
              >
                {/* Product Image Stage */}
                <div className="relative w-full aspect-square rounded-2xl bg-[#F4EFEA] border border-[#E8E2D8] flex items-center justify-center p-6 transition-all duration-300 group-hover:shadow-md group-hover:border-[#DDD5C7] overflow-hidden">
                  <div className="relative w-full h-full flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={rel.image}
                      alt={rel.name}
                      fill
                      sizes="(max-width: 640px) 160px, (max-width: 1024px) 240px, 280px"
                      className="object-contain pointer-events-none select-none mix-blend-multiply"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3.5 space-y-0.5">
                  <h3 className="font-sans text-xs sm:text-sm font-semibold text-[#141210] group-hover:text-[#BA4C35] transition-colors truncate max-w-[220px]">
                    {rel.name}
                  </h3>
                  <p className="font-sans text-xs font-medium text-[#8C8477]">
                    {rel.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
