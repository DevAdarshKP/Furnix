"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, Menu, X, Heart } from "lucide-react";
import { getCartCount, getWishlistCount, openCartDrawer, subscribeToCart } from "@/lib/cartStore";

const NAV_SECTIONS = [
  { label: "Overview", href: "/#hero" },
  { label: "Crafted", href: "/#crafted-editorial" },
  { label: "Detailing", href: "/#details" },
  { label: "Collections", href: "/products" },
];

export function Navbar() {
  const pathname = usePathname() || "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [activeSection, setActiveSection] = useState("Overview");
  const [mounted, setMounted] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    setCartCount(getCartCount());
    setWishlistCount(getWishlistCount());

    return subscribeToCart(() => {
      setCartCount(getCartCount());
      setWishlistCount(getWishlistCount());
    });
  }, []);

  // Sync active section based on current route
  useEffect(() => {
    if (pathname.startsWith("/product")) {
      setActiveSection("Collections");
      return;
    }
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }
    setActiveSection("Overview");
  }, [pathname]);

  // Track scroll position and direction
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateNavbar = () => {
      const scrollY = window.scrollY;
      const diff = scrollY - lastScrollY;

      setIsScrolled(scrollY > 40);

      // Always show when near the very top of the page
      if (scrollY <= 60) {
        setIsVisible(true);
      } else if (Math.abs(diff) >= 6) {
        // Scrolling DOWN -> hide navbar
        if (diff > 0) {
          setIsVisible(false);
          setMobileMenuOpen(false);
        }
        // Scrolling UP -> smoothly reveal navbar
        else if (diff < 0) {
          setIsVisible(true);
        }
      }

      lastScrollY = scrollY;
      ticking = false;

      // On home page, determine active section based on scroll position
      if (pathname === "/") {
        const craftedEl = document.getElementById("crafted-editorial");
        const detailsEl = document.getElementById("product-detail-track");
        const collectionsEl = document.getElementById("collections");

        const vhThird = window.innerHeight * 0.40;

        if (collectionsEl && collectionsEl.getBoundingClientRect().top <= vhThird) {
          setActiveSection("Collections");
        } else if (detailsEl && detailsEl.getBoundingClientRect().top <= vhThird) {
          setActiveSection("Detailing");
        } else if (craftedEl && craftedEl.getBoundingClientRect().top <= vhThird) {
          setActiveSection("Crafted");
        } else {
          setActiveSection("Overview");
        }
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateNavbar);
      }
    };

    updateNavbar();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, item: { label: string; href: string }) => {
      setMobileMenuOpen(false);

      if (item.label === "Collections") {
        if (pathname === "/products") {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        // If on another page, Link takes them straight to /products
        return;
      }

      // For anchor links (Overview, Crafted, Detailing) on home page:
      if (pathname === "/") {
        const hash = item.href.includes("#") ? item.href.substring(item.href.indexOf("#")) : null;
        if (hash) {
          const target = document.querySelector(hash);
          if (target) {
            e.preventDefault();
            if (typeof window !== "undefined" && (window as any).lenis) {
              (window as any).lenis.scrollTo(target, { offset: 0, duration: 1.2 });
            } else {
              target.scrollIntoView({ behavior: "smooth" });
            }
          }
        }
      }
      // If on another page (e.g. /products), Link naturally navigates to /#section
    },
    [pathname]
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 w-full z-40 select-none transform transition-all will-change-transform ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto"
          : "-translate-y-full opacity-0 scale-[0.98] duration-300 ease-in pointer-events-none"
      } ${
        isScrolled
          ? "bg-[#F7F4ED]/85 backdrop-blur-md border-b border-[#DED7CD]/50 shadow-[0_4px_24px_rgba(25,24,23,0.03)] py-3 sm:py-3.5"
          : "bg-transparent border-b border-transparent shadow-none py-5 sm:py-7"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand Logo: Circular Mark + Wordmark */}
        <Link
          href="/"
          className="flex items-center space-x-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#191817] rounded-lg"
          aria-label="FURNIX Home - Return to Overview"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#191817] flex items-center justify-center text-white text-xs font-bold tracking-tight transition-transform duration-300 group-hover:scale-105 shadow-xs">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current">
              <path d="M12 2L4 9v13h16V9l-8-7zm0 3.2L18 10v10H6V10l6-4.8z" />
            </svg>
          </div>
          <span className="font-sans text-lg sm:text-xl font-bold tracking-[0.06em] text-[#191817]">
            FURNIX
          </span>
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav
          className="hidden md:flex items-center space-x-7 lg:space-x-9 font-sans text-[13px]"
          aria-label="Main Section Navigation"
        >
          {NAV_SECTIONS.map((sec) => {
            const isActive = activeSection === sec.label;
            return (
              <Link
                key={sec.label}
                href={sec.href}
                onClick={(e) => handleNavClick(e, sec)}
                className={`transition-colors py-1 relative focus:outline-none focus-visible:underline cursor-pointer ${
                  isActive
                    ? "font-semibold text-[#191817]"
                    : "font-medium text-[#191817]/75 hover:text-[#191817]"
                }`}
              >
                {sec.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#191817]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls: User + Wishlist + Black Bag Pill */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link
            href="/wishlist"
            className="relative p-2 text-[#191817]/75 hover:text-[#191817] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#191817] rounded-full cursor-pointer group"
            aria-label={mounted && wishlistCount > 0 ? `View Saved Wishlist (${wishlistCount} items)` : "View Saved Wishlist"}
          >
            <Heart className="w-4 h-4 transition-transform group-hover:scale-110" strokeWidth={1.8} />
            {mounted && wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#BA4C35] text-white text-[9px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/admin"
            className="hidden sm:inline-flex p-2 text-[#191817]/75 hover:text-[#191817] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#191817] rounded-full cursor-pointer"
            aria-label="Admin Studio"
            title="Furnix Studio Admin"
          >
            <User className="w-4 h-4" strokeWidth={1.8} />
          </Link>

          <Link
            href="/cart"
            className="inline-flex items-center space-x-2 px-3.5 sm:px-4 py-2 bg-[#191817] text-white rounded-full text-xs font-semibold hover:bg-black transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#191817] cursor-pointer shadow-xs active:scale-95"
            aria-label={mounted && cartCount > 0 ? `View Shopping Bag (${cartCount} items)` : "View Shopping Bag"}
          >
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>Bag</span>
            <span className={`text-[11px] font-bold ml-0.5 px-1.5 py-0.2 rounded-full ${mounted && cartCount > 0 ? "bg-white text-[#191817]" : ""}`}>
              {mounted ? cartCount : 0}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#191817] hover:text-black transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#191817] rounded-full cursor-pointer"
            aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mx-4 mt-2 p-6 bg-[#F7F4ED]/95 backdrop-blur-xl rounded-2xl border border-[#E5DFD5] shadow-xl space-y-4">
          <nav className="flex flex-col space-y-3 font-sans text-sm font-semibold text-[#191816]">
            {NAV_SECTIONS.map((sec) => (
              <Link
                key={sec.label}
                href={sec.href}
                onClick={(e) => handleNavClick(e, sec)}
                className={`py-1 flex items-center justify-between transition-colors ${
                  activeSection === sec.label ? "text-[#191817] font-bold" : "text-[#191817]/75 hover:text-[#191817]"
                }`}
              >
                <span>{sec.label}</span>
                {activeSection === sec.label && (
                  <span className="w-2 h-2 rounded-full bg-[#191817]" />
                )}
              </Link>
            ))}

            <div className="pt-3 border-t border-[#E5DFD5] flex flex-col space-y-2">
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 flex items-center justify-between text-[#191817] hover:text-black font-medium"
              >
                <span className="flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shopping Bag</span>
                </span>
                <span className="text-xs bg-[#191817] text-white px-2 py-0.5 rounded-full">
                  {mounted ? cartCount : 0}
                </span>
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 flex items-center justify-between text-[#191817] hover:text-black font-medium"
              >
                <span className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-[#BA4C35]" />
                  <span>Saved Wishlist</span>
                </span>
                <span className="text-xs bg-[#EFEAE2] text-[#191817] px-2 py-0.5 rounded-full font-mono">
                  {mounted ? wishlistCount : 0}
                </span>
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 flex items-center justify-between text-[#191817] hover:text-black font-medium"
              >
                <span className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Studio Admin</span>
                </span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
