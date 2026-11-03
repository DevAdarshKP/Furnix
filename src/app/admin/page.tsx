"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Box,
  RotateCcw,
  LogOut,
  RefreshCw,
  Layers,
  AlertTriangle,
  X,
  Database,
  Eye,
  Lock,
  UploadCloud,
  Image as ImageIcon,
  LayoutDashboard,
  Package,
  Tags,
  Store,
  ChevronRight,
  Sparkles,
  Check,
  Radio,
} from "lucide-react";
import { ProductDetail } from "@/lib/products";

function notifyStorefront() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("furnix:catalog-updated"));
    try {
      localStorage.setItem("furnix_catalog_timestamp", Date.now().toString());
    } catch (e) {}
  }
}

interface ProductFormData {
  id?: string;
  name: string;
  subtitle: string;
  category: string;
  price: string;
  priceNum?: number;
  sku: string;
  image: string;
  inStock: boolean;
  is3D: boolean;
  material: string;
  origin: string;
  dimensions: string;
  designer: string;
  storyContent: string;
}

const DEFAULT_FORM: ProductFormData = {
  name: "",
  subtitle: "Sculptural Lounge Edition",
  category: "Living & Lounge",
  price: "$1,250.00",
  sku: "FNX-STUDIO-01",
  image: "",
  inStock: true,
  is3D: false,
  material: "Solid European White Oak & Bouclé",
  origin: "Denmark / San Francisco",
  dimensions: "84 W × 88 D × 78 H cm",
  designer: "Studio Furnix",
  storyContent: "Sculpted with organic contours and architectural restraint for calm, enduring living spaces.",
};

const SAMPLE_PRESET_IMAGES = [
  { label: "Ochre / Yellow Chair", url: "/images/chair_thumb_yellow.png" },
  { label: "Azure / Blue Chair", url: "/images/chair_thumb_blue.png" },
  { label: "Green Olive Armchair", url: "/images/atelier_green_armchair.jpg" },
  { label: "Sculptural Walnut Armchair", url: "/images/wood_armchair.png" },
  { label: "Modern Midcentury Lounge", url: "/images/midcentury_sofa.png" },
  { label: "Bergère Leather Wingback", url: "/images/wingback_chair.png" },
  { label: "Nordic Minimalist Armchair", url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80" },
  { label: "Sculptural Oak Lounge", url: "https://images.unsplash.com/photo-1580481077195-c3a8b4e7a2c2?w=800&q=80" },
];

// Decorative mini sparkline waveforms matching the reference dashboard
function Sparkline({ color = "emerald" }: { color?: "emerald" | "amber" | "rose" | "gray" }) {
  const strokeClass =
    color === "emerald"
      ? "text-emerald-500"
      : color === "amber"
      ? "text-amber-500"
      : color === "rose"
      ? "text-rose-400"
      : "text-[#8C8477]";

  return (
    <svg
      className={`w-14 sm:w-16 h-5 ${strokeClass} stroke-current fill-none stroke-[2] opacity-80`}
      viewBox="0 0 60 20"
      aria-hidden="true"
    >
      <path
        d="M 2 12 Q 8 6, 14 10 T 26 8 T 38 14 T 50 6 T 58 10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();

  // Auth & Session
  const [authChecking, setAuthChecking] = useState(true);
  const [userEmail, setUserEmail] = useState("admin@furnix.studio");

  // Dynamic Date & Greeting
  const [todayStr, setTodayStr] = useState("Wednesday, October 14");
  const [greeting, setGreeting] = useState("Good afternoon");

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "categories">("overview");

  // Product Data
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbSource, setDbSource] = useState<string>("connecting");
  const [actionError, setActionError] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string>("");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<ProductDetail | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Seeding
  const [seeding, setSeeding] = useState(false);

  // Date formatting & greeting on mount
  useEffect(() => {
    const now = new Date();
    setTodayStr(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );
    const hour = now.getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
  }, []);

  // 1. Verify Session
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch("/api/admin/check");
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }
        const data = await res.json();
        setUserEmail(data.user?.email || "admin@furnix.studio");
        setAuthChecking(false);
        fetchProducts();
      } catch (err) {
        router.replace("/admin/login");
      }
    }
    verifyAuth();
  }, [router]);

  // 2. Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    setActionError("");
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
        setDbSource(data.source || "database");
      } else {
        setActionError("Failed to load products from API.");
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to connect to catalog API.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
    } catch (err) {
      router.push("/admin/login");
    }
  };

  // 4. File Upload
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setActionError("Please choose a valid image file (PNG, JPG, WEBP, or SVG).");
      return;
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, image: localPreviewUrl }));
    setIsUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (res.ok && json.success && json.url) {
        setFormData((prev) => ({ ...prev, image: json.url }));
        setUploadProgress(null);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setFormData((prev) => ({ ...prev, image: reader.result as string }));
          }
        };
        reader.readAsDataURL(file);
        setUploadProgress(null);
      }
    } catch (err) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setFormData((prev) => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
      setUploadProgress(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  // 5. Open Modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      ...DEFAULT_FORM,
      sku: `FNX-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setUploadProgress(null);
    setShowUrlInput(false);
    setIsDragging(false);
    setIsModalOpen(true);
  };

  // 6. Open Modal for Edit
  const handleOpenEdit = (p: ProductDetail) => {
    setEditingProduct(p);
    setFormData({
      id: p.id,
      name: p.name,
      subtitle: p.subtitle || "",
      category: p.category || "Living & Lounge",
      price: p.price,
      priceNum: p.priceNum,
      sku: p.sku || `FNX-${Math.floor(1000 + Math.random() * 9000)}`,
      image: p.image || "/images/chair_thumb_yellow.png",
      inStock: p.inStock ?? true,
      is3D: Boolean(p.is3D),
      material: p.quickSpecs?.material || "Solid European Oak",
      origin: p.quickSpecs?.origin || "Denmark",
      dimensions: p.quickSpecs?.dimensions || "84 W × 88 D × 78 H cm",
      designer: p.quickSpecs?.designer || "Studio Furnix",
      storyContent: p.story?.content || "",
    });
    setUploadProgress(null);
    setShowUrlInput(false);
    setIsDragging(false);
    setIsModalOpen(true);
  };

  // 7. Handle Create / Edit Submission
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError("");
    setActionSuccess("");

    try {
      const isDefault3D = editingProduct
        ? editingProduct.id === "day-241-shack15-armchair"
        : formData.id === "day-241-shack15-armchair";

      const payload = {
        id: formData.id,
        name: formData.name,
        subtitle: formData.subtitle,
        category: formData.category,
        breadcrumbCategory: formData.category.toUpperCase(),
        price: formData.price,
        sku: formData.sku,
        image: formData.image,
        inStock: formData.inStock,
        is3D: isDefault3D ? true : false,
        modelUrl: isDefault3D ? "/models/arm_chair__furniture.glb" : undefined,
        quickSpecs: {
          designer: formData.designer,
          produced: "2026 Studio",
          released: "2026 Collection",
          origin: formData.origin,
          material: formData.material,
          dimensions: formData.dimensions,
        },
        story: {
          title: "Design Heritage",
          content: formData.storyContent,
          linkText: "EXPLORE ARCHIVE",
          linkHref: "/#collections",
        },
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (res.ok && resData.success) {
        setActionSuccess(
          editingProduct
            ? `“${formData.name}” updated successfully.`
            : `“${formData.name}” created and added to database.`
        );
        setIsModalOpen(false);
        fetchProducts();
        notifyStorefront();
      } else {
        setActionError(resData.error || "Failed to save product.");
      }
    } catch (err: any) {
      setActionError(err.message || "Network error while saving product.");
    } finally {
      setSubmitting(false);
    }
  };

  // 8. Instant Toggle Stock
  const handleToggleStock = async (product: ProductDetail) => {
    const updatedStatus = !product.inStock;

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((item) => (item.id === product.id ? { ...item, inStock: updatedStatus } : item))
    );

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: updatedStatus }),
      });
      if (!res.ok) {
        throw new Error("Failed to update stock status");
      }
      setActionSuccess(`Stock status for “${product.name}” set to ${updatedStatus ? "IN STOCK" : "OUT OF STOCK"}.`);
      notifyStorefront();
    } catch (err) {
      // Rollback
      setProducts((prev) =>
        prev.map((item) => (item.id === product.id ? { ...item, inStock: !updatedStatus } : item))
      );
      setActionError("Failed to update stock on server.");
    }
  };

  // 9. Delete Product
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.id === "day-241-shack15-armchair") {
      setActionError("The default 3D showroom model (Bolle Lounge Chair) is permanent and cannot be deleted.");
      setDeleteTarget(null);
      return;
    }

    setDeleting(true);
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch(`/api/products/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setActionSuccess(`“${deleteTarget.name}” removed from archive.`);
        setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
        notifyStorefront();
      } else {
        setActionError(data.error || "Failed to delete product.");
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to delete product.");
    } finally {
      setDeleting(false);
    }
  };

  // 10. Reset / Seed Archival Catalog
  const handleSeedCatalog = async () => {
    if (!confirm("This will restore the original Furnix archival products into MongoDB. Proceed?")) {
      return;
    }
    setSeeding(true);
    setActionError("");
    setActionSuccess("");

    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`Database seeded: ${data.count} archival items restored.`);
        fetchProducts();
        notifyStorefront();
      } else {
        setActionError(data.error || "Failed to seed database.");
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to seed database.");
    } finally {
      setSeeding(false);
    }
  };

  // Filtered & Searched Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      if (stockFilter === "inStock" && !p.inStock) return false;
      if (stockFilter === "outOfStock" && p.inStock) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSku = p.sku?.toLowerCase().includes(query);
        const matchesCategory = p.category?.toLowerCase().includes(query);
        return matchesName || matchesSku || matchesCategory;
      }
      return true;
    });
  }, [products, categoryFilter, stockFilter, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = products.length;
    const inStockCount = products.filter((p) => p.inStock).length;
    const outOfStockCount = total - inStockCount;
    const threeDCount = products.filter((p) => p.is3D).length;
    return { total, inStockCount, outOfStockCount, threeDCount };
  }, [products]);

  // Unique categories for filter
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#F3EFE6] flex items-center justify-center text-[#141210] font-sans">
        <div className="flex items-center space-x-3 text-sm text-[#7A7367]">
          <div className="w-5 h-5 rounded-full border-2 border-[#DDD6CA] border-t-[#141210] animate-spin" />
          <span>Loading Furnix Studio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#141210] font-sans selection:bg-[#141210] selection:text-white flex">
      {/* ── LEFT SIDEBAR NAVIGATION (Matching design reference) ───────── */}
      <aside className="w-64 shrink-0 hidden md:flex flex-col justify-between py-6 pl-6 pr-3 min-h-screen sticky top-0">
        <div className="space-y-7">
          {/* Brand Logo & Studio Pill */}
          <div className="flex items-center justify-between pr-2">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 rounded-full bg-[#141210] text-[#FAF8F5] flex items-center justify-center font-bold text-xs tracking-tight transition-transform group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M12 2L4 9v13h16V9l-8-7zm0 3.2L18 10v10H6V10l6-4.8z" />
                </svg>
              </div>
              <span className="font-sans text-lg font-bold tracking-[0.08em] text-[#141210]">
                FURNIX
              </span>
            </Link>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wide bg-[#E8E2D8] text-[#5C564E] font-medium">
              STUDIO
            </span>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5" aria-label="Admin Navigation">
            <button
              onClick={() => {
                setActiveTab("overview");
                setCategoryFilter("all");
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#141210] text-white shadow-xs"
                  : "text-[#6B655B] hover:text-[#141210] hover:bg-black/5"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("products");
                setCategoryFilter("all");
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                activeTab === "products"
                  ? "bg-[#141210] text-white shadow-xs"
                  : "text-[#6B655B] hover:text-[#141210] hover:bg-black/5"
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Products ({products.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("categories");
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                activeTab === "categories"
                  ? "bg-[#141210] text-white shadow-xs"
                  : "text-[#6B655B] hover:text-[#141210] hover:bg-black/5"
              }`}
            >
              <Tags className="w-4 h-4" />
              <span>Categories ({categories.length})</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-medium text-[#6B655B] hover:text-[#141210] hover:bg-black/5 transition-all"
            >
              <div className="flex items-center space-x-3">
                <Store className="w-4 h-4" />
                <span>Storefront</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </Link>
          </nav>
        </div>

        {/* Sidebar Bottom Widgets */}
        <div className="space-y-3 pt-6 border-t border-[#E8E2D8]">
          {/* Live Sync Status Card */}
          <div className="p-3 bg-white/70 backdrop-blur-xs rounded-2xl border border-[#E8E2D8]/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[11px] font-semibold text-[#141210]">Live Catalog</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                Online
              </span>
            </div>
            <p className="text-[10px] text-[#7A7367] leading-relaxed">
              MongoDB Atlas cluster connected with real-time updates.
            </p>
          </div>

          {/* User Profile Pill Card */}
          <div className="p-2.5 bg-white rounded-2xl border border-[#E8E2D8] flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#141210] text-white flex items-center justify-center font-bold text-xs shrink-0">
                AD
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#141210] block truncate">
                  Studio Admin
                </span>
                <span className="text-[10px] text-[#7A7367] block truncate">
                  {userEmail}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 text-[#8C8477] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Logout from Admin Studio"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN DASHBOARD AREA ────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Header Row */}
        <header className="px-6 lg:px-10 pt-7 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-[#8C8477] font-medium block">
              {todayStr}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141210]">
              {greeting}, Studio Admin
            </h1>
          </div>

          {/* Quick Filter / State Switcher Pills */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={() => setStockFilter("all")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                stockFilter === "all"
                  ? "bg-[#141210] text-white shadow-xs"
                  : "bg-white text-[#7A7367] hover:text-[#141210] border border-[#E8E2D8]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStockFilter("inStock")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                stockFilter === "inStock"
                  ? "bg-[#141210] text-white shadow-xs"
                  : "bg-white text-[#7A7367] hover:text-[#141210] border border-[#E8E2D8]"
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setStockFilter("outOfStock")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                stockFilter === "outOfStock"
                  ? "bg-[#141210] text-white shadow-xs"
                  : "bg-white text-[#7A7367] hover:text-[#141210] border border-[#E8E2D8]"
              }`}
            >
              Waitlist
            </button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="px-6 lg:px-10 pb-12 space-y-7 flex-1">
          {/* Notifications */}
          {actionSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center justify-between transition-all shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{actionSuccess}</span>
              </div>
              <button
                onClick={() => setActionSuccess("")}
                className="text-emerald-700/70 hover:text-emerald-900 cursor-pointer p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {actionError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center justify-between transition-all shadow-2xs">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{actionError}</span>
              </div>
              <button
                onClick={() => setActionError("")}
                className="text-rose-700/70 hover:text-rose-900 cursor-pointer p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ── 4 STAT METRIC CARDS (Matching reference design) ──────────── */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Total Catalog */}
            <div className="p-5 bg-white rounded-3xl border border-[#E8E2D8] shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-[#8C8477]">
                <span className="text-xs font-semibold">Total Catalog</span>
                <div className="w-7 h-7 rounded-xl bg-[#F4EFEA] flex items-center justify-center text-[#5C564E]">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141210]">
                {metrics.total}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                  <span>↗</span> 100%
                </span>
                <Sparkline color="emerald" />
              </div>
            </div>

            {/* Card 2: In Stock */}
            <div className="p-5 bg-white rounded-3xl border border-[#E8E2D8] shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-[#8C8477]">
                <span className="text-xs font-semibold">In Stock</span>
                <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-700">
                {metrics.inStockCount}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                  <span>↗</span> Live
                </span>
                <Sparkline color="emerald" />
              </div>
            </div>

            {/* Card 3: Out of Stock */}
            <div className="p-5 bg-white rounded-3xl border border-[#E8E2D8] shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-[#8C8477]">
                <span className="text-xs font-semibold">Out of Stock</span>
                <div className="w-7 h-7 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <XCircle className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-rose-700">
                {metrics.outOfStockCount}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                  Waitlist
                </span>
                <Sparkline color="rose" />
              </div>
            </div>

            {/* Card 4: 3D Interactive */}
            <div className="p-5 bg-white rounded-3xl border border-[#E8E2D8] shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-[#8C8477]">
                <span className="text-xs font-semibold">3D Showroom</span>
                <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                  <Box className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-700">
                {metrics.threeDCount}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                  Three.js 360°
                </span>
                <Sparkline color="amber" />
              </div>
            </div>
          </section>

          {/* ── TOOLBAR: Search, Category Filter, and Add Product ─────────── */}
          <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              {/* Search Field */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-[#8C8477] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by title, SKU, or category..."
                  className="w-full bg-white border border-[#E8E2D8] rounded-2xl text-xs text-[#141210] placeholder-[#8C8477] pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#141210] transition-colors shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8477] hover:text-[#141210]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Dropdown */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-[#E8E2D8] rounded-2xl text-xs text-[#141210] px-3.5 py-2.5 focus:outline-none focus:border-[#141210] cursor-pointer shadow-2xs font-medium"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Reset Archive Button */}
              <button
                onClick={handleSeedCatalog}
                disabled={seeding}
                className="px-3.5 py-2.5 bg-white hover:bg-[#FAF8F5] border border-[#E8E2D8] rounded-2xl text-xs text-[#5C564E] hover:text-[#141210] transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-2xs font-medium"
                title="Restore default catalog items"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${seeding ? "animate-spin" : ""}`} />
                <span className="hidden lg:inline">Re-Seed</span>
              </button>

              {/* Refresh Button */}
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="p-2.5 bg-white hover:bg-[#FAF8F5] border border-[#E8E2D8] rounded-2xl text-[#5C564E] hover:text-[#141210] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                title="Refresh from MongoDB"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Add Product Button */}
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 bg-[#141210] hover:bg-black text-[#FAF8F5] rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer active:scale-98 self-end sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </section>

          {/* ── CATALOG PRODUCTS TABLE ───────────────────────────────────── */}
          <section className="bg-white rounded-3xl border border-[#E8E2D8] shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8E2D8] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h2 className="text-sm font-bold text-[#141210]">Catalog Products</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4EFEA] text-[#5C564E]">
                  {filteredProducts.length} items
                </span>
              </div>
              <div className="flex items-center space-x-1 font-mono text-[10px] text-[#7A7367]">
                <Database className="w-3 h-3 text-emerald-600" />
                <span>MongoDB Atlas</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E2D8] bg-[#FAF8F5]/60 text-[#8C8477] text-[10px] uppercase font-bold tracking-[0.14em]">
                    <th className="py-4 px-6">Product</th>
                    <th className="py-4 px-4">SKU / ID</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Price</th>
                    <th className="py-4 px-4 text-center">Stock Availability</th>
                    <th className="py-4 px-4 text-center">3D Mode</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EFEAE2]">
                  {loading && products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-[#7A7367]">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-5 h-5 rounded-full border-2 border-[#DDD6CA] border-t-[#141210] animate-spin" />
                          <span className="text-xs">Connecting to MongoDB Atlas...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-[#7A7367]">
                        <p className="text-sm text-[#141210] font-semibold">No products found</p>
                        <p className="text-xs mt-1 text-[#8C8477]">
                          Try adjusting your search query or reset the category filter.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-[#FAF8F5]/80 transition-colors group"
                      >
                        {/* Thumbnail & Title */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center space-x-3.5">
                            <div className="w-12 h-12 bg-[#F4EFEA] rounded-2xl flex-shrink-0 flex items-center justify-center p-1.5 overflow-hidden border border-[#E8E2D8]/60">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.image || "/images/chair_thumb_yellow.png"}
                                alt={product.name}
                                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-sm text-[#141210] block truncate">
                                {product.name}
                              </span>
                              <span className="text-[11px] text-[#7A7367] block truncate">
                                {product.subtitle || "Curated Archival Edition"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#7A7367]">
                          <span className="text-[#141210] font-medium block">{product.sku || "FNX-001"}</span>
                          <span className="text-[10px] text-[#8C8477] truncate block max-w-[120px]">
                            /{product.id}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-[#5C564E]">
                          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold bg-[#F4EFEA] text-[#5C564E]">
                            {product.category || "Living & Lounge"}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#141210]">
                          {product.price}
                        </td>

                        {/* Stock Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleStock(product)}
                            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                              product.inStock
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                            }`}
                            title="Click to toggle stock status"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                product.inStock ? "bg-emerald-600" : "bg-rose-600"
                              }`}
                            />
                            <span>{product.inStock ? "IN STOCK" : "OUT OF STOCK"}</span>
                          </button>
                        </td>

                        {/* 3D Indicator */}
                        <td className="py-3.5 px-4 text-center">
                          {product.id === "day-241-shack15-armchair" ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-amber-50 border border-amber-300 text-amber-900 font-semibold shadow-2xs">
                              <Lock className="w-3 h-3 text-amber-700" />
                              <span>Default 3D</span>
                            </span>
                          ) : product.is3D ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-mono bg-amber-50/80 border border-amber-200 text-amber-800 font-medium">
                              <Box className="w-3 h-3" />
                              <span>3D Mode</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#8C8477] font-mono">2D Still</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-6 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <Link
                              href={`/products/${product.id}`}
                              target="_blank"
                              className="p-2 text-[#7A7367] hover:text-[#141210] hover:bg-[#F4EFEA] rounded-xl transition-colors"
                              title="View on storefront"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => handleOpenEdit(product)}
                              className="p-2 text-[#7A7367] hover:text-[#141210] hover:bg-[#F4EFEA] rounded-xl transition-colors cursor-pointer"
                              title="Edit specifications"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {product.id === "day-241-shack15-armchair" ? (
                              <button
                                disabled
                                className="p-2 text-[#C4BCB0] cursor-not-allowed opacity-40 rounded-xl"
                                title="Default 3D model is permanent and cannot be deleted"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setDeleteTarget(product)}
                                className="p-2 text-[#7A7367] hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                title="Delete product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-4 bg-[#FAF8F5]/80 border-t border-[#E8E2D8] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A7367] gap-2">
              <span>
                Showing {filteredProducts.length} of {products.length} registered catalog products
              </span>
              <span className="font-mono text-[11px] text-[#8C8477]">
                Authenticated as: {userEmail}
              </span>
            </div>
          </section>
        </main>
      </div>

      {/* ── CREATE / EDIT PRODUCT MODAL (Matching cool & calm aesthetic) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#141210]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-[#E8E2D8] shadow-2xl rounded-3xl relative my-8 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E8E2D8] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8C8477] block">
                  {editingProduct ? "ARCHIVAL UPDATE" : "NEW ARCHIVAL RECORD"}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-[#141210]">
                  {editingProduct ? `Edit “${editingProduct.name}”` : "Create New Catalog Product"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#7A7367] hover:text-[#141210] transition-colors cursor-pointer rounded-xl hover:bg-[#EFEAE2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Product Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#7A7367]">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Day 241 Shack15 Armchair"
                    className="w-full bg-[#FAF8F5] border border-[#DDD6CA] text-xs text-[#141210] px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#141210] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#7A7367]">
                    Subtitle / Edition
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Calm Scandinavian Lounge"
                    className="w-full bg-[#FAF8F5] border border-[#DDD6CA] text-xs text-[#141210] px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#141210] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Price, SKU & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#7A7367]">
                    Price (USD) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="$1,420.00"
                    className="w-full bg-[#FAF8F5] border border-[#DDD6CA] text-xs font-mono text-[#141210] px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#141210] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#7A7367]">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="FNX-ARCHIVE-01"
                    className="w-full bg-[#FAF8F5] border border-[#DDD6CA] text-xs font-mono text-[#141210] px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#141210] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#7A7367]">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#DDD6CA] text-xs text-[#141210] px-3 py-2.5 rounded-xl focus:outline-none focus:border-[#141210] focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="Living & Lounge">Living & Lounge</option>
                    <option value="Seating">Seating</option>
                    <option value="Armchairs">Armchairs</option>
                    <option value="Dining & Accent">Dining & Accent</option>
                    <option value="Tables & Surfaces">Tables & Surfaces</option>
                    <option value="Lighting">Lighting</option>
                  </select>
                </div>
              </div>

              {/* Image Uploader & Device Chooser */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#7A7367]">
                    Product Image (Choose From Device) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[10px] text-[#7A7367] hover:text-[#141210] underline cursor-pointer"
                  >
                    {showUrlInput ? "Hide manual URL" : "Or enter URL / pick preset"}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed p-4 transition-all duration-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4 ${
                    isDragging
                      ? "border-[#141210] bg-[#FAF8F5]"
                      : "border-[#DDD6CA] bg-[#FAF8F5] hover:border-[#141210]"
                  }`}
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-[#EFEAE2] border border-[#DDD6CA] rounded-2xl flex items-center justify-center p-2 flex-shrink-0 overflow-hidden">
                    {formData.image ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.image}
                          alt="Selected product preview"
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                        {isUploading && (
                          <div className="absolute inset-0 bg-[#141210]/60 backdrop-blur-xs flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#8C8477] space-y-1">
                        <ImageIcon className="w-7 h-7" />
                        <span className="text-[9px] uppercase tracking-wider font-semibold">No Image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                    <div>
                      <span className="text-xs font-semibold text-[#141210] block">
                        {formData.image ? "Image Ready for Archive" : "Select an image from your device"}
                      </span>
                      <span className="text-[11px] text-[#7A7367] block mt-0.5">
                        PNG, JPG, WEBP, or SVG. Drag & drop here or click below.
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#141210] hover:bg-black text-[#FAF8F5] hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{formData.image ? "Choose Different Image" : "Choose Image From Device"}</span>
                      </button>

                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: "" })}
                          className="px-2.5 py-1.5 bg-[#EFEAE2] hover:bg-[#DDD6CA] text-[#5C564E] hover:text-[#141210] rounded-xl text-xs transition-colors cursor-pointer font-medium"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {uploadProgress && (
                      <div className="text-[10px] text-amber-700 font-mono flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full border border-amber-600/30 border-t-amber-600 animate-spin" />
                        <span>{uploadProgress}</span>
                      </div>
                    )}
                  </div>
                </div>

                {showUrlInput && (
                  <div className="p-3.5 bg-[#FAF8F5] border border-[#E6DFD5] rounded-2xl space-y-2.5 mt-2 animate-in fade-in duration-150">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#7A7367]">
                      Direct Image URL or Path
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="/images/chair_thumb_yellow.png or https://..."
                      className="w-full bg-white border border-[#DDD6CA] text-xs font-mono text-[#141210] px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#141210]"
                    />

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-[#7A7367] font-medium">Presets:</span>
                      {SAMPLE_PRESET_IMAGES.map((preset) => (
                        <button
                          type="button"
                          key={preset.url}
                          onClick={() => setFormData({ ...formData, image: preset.url })}
                          className={`text-[10px] px-2.5 py-1 border rounded-xl cursor-pointer transition-colors ${
                            formData.image === preset.url
                              ? "bg-[#141210] border-[#141210] text-[#FAF8F5]"
                              : "bg-white border-[#DDD6CA] text-[#5C564E] hover:text-[#141210] hover:border-[#141210]"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Specs: Material, Origin, Dimensions, Designer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E8E2D8]">
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#7A7367]">
                    Material & Finish
                  </label>
                  <input
                    type="text"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    placeholder="e.g. Solid European Oak & Bouclé"
                    className="w-full bg-[#FAF8F5] border border-[#DDD6CA] text-xs text-[#141210] px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#141210] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#7A7367]">
                    Dimensions
                  </label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="e.g. 84 W × 88 D × 78 H cm"
                    className="w-full bg-[#FAF8F5] border border-[#DDD6CA] text-xs text-[#141210] px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#141210] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#7A7367]">
                    Origin / Workshop
                  </label>
                  <input
                    type="text"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    placeholder="e.g. Copenhagen, Denmark"
                    className="w-full bg-[#FAF8F5] border border-[#DDD6CA] text-xs text-[#141210] px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#141210] focus:bg-white transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#7A7367]">
                    Lead Designer
                  </label>
                  <input
                    type="text"
                    value={formData.designer}
                    onChange={(e) => setFormData({ ...formData, designer: e.target.value })}
                    placeholder="e.g. Studio Furnix"
                    className="w-full bg-[#FAF8F5] border border-[#DDD6CA] text-xs text-[#141210] px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#141210] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Story */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#7A7367]">
                  Design Philosophy & Story
                </label>
                <textarea
                  rows={3}
                  value={formData.storyContent}
                  onChange={(e) => setFormData({ ...formData, storyContent: e.target.value })}
                  placeholder="Describe the craftsmanship, tactile materials, and heritage..."
                  className="w-full bg-[#FAF8F5] border border-[#DDD6CA] text-xs text-[#141210] p-3 rounded-xl focus:outline-none focus:border-[#141210] focus:bg-white transition-colors resize-none"
                />
              </div>

              {/* Availability */}
              <div className="pt-2 border-t border-[#E8E2D8]">
                <label className="flex items-center space-x-3 p-3.5 bg-[#FAF8F5] border border-[#E6DFD5] cursor-pointer hover:border-[#141210] rounded-2xl transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4 accent-[#141210] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-semibold text-[#141210] block">
                      In Stock for Immediate Delivery
                    </span>
                    <span className="text-[10px] text-[#7A7367] block mt-0.5">
                      When enabled, users can purchase immediately. When unchecked, product displays as Archival Waitlist on the storefront.
                    </span>
                  </div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-[#E8E2D8] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs text-[#7A7367] hover:text-[#141210] transition-colors cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#141210] hover:bg-black text-[#FAF8F5] hover:text-white text-xs font-bold uppercase tracking-widest rounded-2xl transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2 shadow-sm active:scale-98"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>SAVING TO ATLAS...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? "SAVE SPECIFICATIONS" : "CREATE PRODUCT"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION DIALOG ────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-[#141210]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-rose-200 p-6 shadow-2xl rounded-3xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0 text-rose-600">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#141210]">Confirm Product Deletion</h3>
                <p className="text-xs text-[#7A7367] leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <strong className="text-[#141210]">“{deleteTarget.name}”</strong> (SKU:{" "}
                  {deleteTarget.sku}) from the MongoDB Atlas database?
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E2D8] rounded-2xl text-[11px] text-[#5C564E]">
              You can restore the default catalog at any time using the{" "}
              <strong className="text-[#141210]">“Re-Seed”</strong> button.
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs text-[#7A7367] hover:text-[#141210] transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2 shadow-sm active:scale-98"
              >
                {deleting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>DELETING...</span>
                  </>
                ) : (
                  <span>CONFIRM DELETE</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
