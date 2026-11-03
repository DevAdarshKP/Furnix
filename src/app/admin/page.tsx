"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
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
  Sparkles,
  AlertTriangle,
  X,
  ChevronDown,
  Database,
  Eye,
  Check,
  Lock,
  UploadCloud,
  Image as ImageIcon,
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
  { label: "Nordic Minimalist Armchair", url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80" },
  { label: "Sculptural Oak Lounge", url: "https://images.unsplash.com/photo-1580481077195-c3a8b4e7a2c2?w=800&q=80" },
  { label: "Minimalist Birch Desk", url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80" },
  { label: "Ceramic Pedestal Table", url: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80" },
];

export default function AdminDashboardPage() {
  const router = useRouter();

  // Auth & Session
  const [authChecking, setAuthChecking] = useState(true);
  const [userEmail, setUserEmail] = useState("");

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
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setActionError("Please choose a valid image file (PNG, JPG, WEBP, or SVG).");
      return;
    }

    // Instant local preview
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
        // Fallback to Base64 Data URL if server upload had an issue
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
      // Fallback to Base64 Data URL
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
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Delete Confirmation
  const [deleteTarget, setDeleteTarget] = useState<ProductDetail | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Seeding
  const [seeding, setSeeding] = useState(false);

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

  // 4. Open Modal for Create
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

  // 5. Open Modal for Edit
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

  // 6. Handle Create / Edit Submission
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError("");
    setActionSuccess("");

    try {
      // The default 3D showroom armchair is permanent and cannot be changed or untoggled
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

  // 7. Instant Toggle Stock
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

  // 8. Delete Product
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    // Protect default 3D showroom model from deletion
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

  // 9. Reset / Seed Archival Catalog
  const handleSeedCatalog = async () => {
    if (!confirm("This will restore the 6 original Furnix archival products into MongoDB. Proceed?")) {
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
      // Category filter
      if (categoryFilter !== "all" && p.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      // Stock filter
      if (stockFilter === "inStock" && !p.inStock) return false;
      if (stockFilter === "outOfStock" && p.inStock) return false;

      // Query filter
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
      <div className="min-h-screen bg-[#F7F4ED] flex items-center justify-center text-[#141210] font-sans">
        <div className="flex items-center space-x-3 text-sm text-[#7A7367]">
          <div className="w-4 h-4 rounded-full border-2 border-[#DDD6CA] border-t-[#141210] animate-spin" />
          <span>Verifying Admin Studio Access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#141210] font-sans selection:bg-[#141210] selection:text-white">
      {/* ── TOP NAV BAR ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E6DFD5] px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-7 h-7 rounded-full bg-[#141210] text-[#FAF8F5] flex items-center justify-center font-bold text-xs tracking-tight transition-transform group-hover:scale-105">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                  <path d="M12 2L4 9v13h16V9l-8-7zm0 3.2L18 10v10H6V10l6-4.8z" />
                </svg>
              </div>
              <span className="font-sans text-base font-bold tracking-[0.08em] text-[#141210]">
                FURNIX
              </span>
            </Link>
            <span className="text-[#DDD6CA]">/</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-[#7A7367]">
                Archival Studio Admin
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono tracking-wide bg-[#EFEAE2] border border-[#DDD6CA] text-[#5C564E]">
                v2.6 Atlas
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Live Database status pill */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white border border-[#E6DFD5] text-xs shadow-2xs">
              <div
                className={`w-2 h-2 rounded-full ${
                  dbSource === "database"
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                }`}
              />
              <span className="text-[11px] font-mono text-[#5C564E]">
                {dbSource === "database" ? "MongoDB Atlas Connected" : "Local Fallback Active"}
              </span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="text-xs text-[#5C564E] hover:text-[#141210] transition-colors flex items-center space-x-1 py-1.5 px-3 rounded-lg bg-white border border-[#DDD6CA] hover:border-[#141210] shadow-2xs"
            >
              <span>View Store</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs text-[#7A7367] hover:text-rose-700 transition-colors flex items-center space-x-1.5 py-1.5 px-3 rounded-lg bg-white border border-[#DDD6CA] hover:border-rose-300 cursor-pointer shadow-2xs"
              title="Sign out of Admin Studio"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-8">
        
        {/* Top Notification Alerts */}
        {actionSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between transition-all shadow-2xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{actionSuccess}</span>
            </div>
            <button
              onClick={() => setActionSuccess("")}
              className="text-emerald-700/70 hover:text-emerald-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between transition-all shadow-2xs">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError("")}
              className="text-rose-700/70 hover:text-rose-900 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── METRICS OVERVIEW CARDS ───────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-5 bg-white border border-[#E6DFD5] rounded-2xl shadow-[0_2px_12px_rgba(20,18,16,0.03)] space-y-2">
            <div className="flex items-center justify-between text-[#8C8477]">
              <span className="text-[10px] uppercase font-bold tracking-[0.16em]">Total Catalog</span>
              <Layers className="w-4 h-4 text-[#8C8477]" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif text-[#141210]">{metrics.total}</div>
            <div className="text-[11px] text-[#8C8477]">Items in active database</div>
          </div>

          <div className="p-5 bg-white border border-[#E6DFD5] rounded-2xl shadow-[0_2px_12px_rgba(20,18,16,0.03)] space-y-2">
            <div className="flex items-center justify-between text-[#8C8477]">
              <span className="text-[10px] uppercase font-bold tracking-[0.16em]">In Stock</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif text-emerald-700">{metrics.inStockCount}</div>
            <div className="text-[11px] text-[#8C8477]">Available for immediate order</div>
          </div>

          <div className="p-5 bg-white border border-[#E6DFD5] rounded-2xl shadow-[0_2px_12px_rgba(20,18,16,0.03)] space-y-2">
            <div className="flex items-center justify-between text-[#8C8477]">
              <span className="text-[10px] uppercase font-bold tracking-[0.16em]">Out of Stock</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif text-rose-700">{metrics.outOfStockCount}</div>
            <div className="text-[11px] text-[#8C8477]">Archival / Waitlist status</div>
          </div>

          <div className="p-5 bg-white border border-[#E6DFD5] rounded-2xl shadow-[0_2px_12px_rgba(20,18,16,0.03)] space-y-2">
            <div className="flex items-center justify-between text-[#8C8477]">
              <span className="text-[10px] uppercase font-bold tracking-[0.16em]">3D Interactive</span>
              <Box className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif text-[#BA4C35]">{metrics.threeDCount}</div>
            <div className="text-[11px] text-[#8C8477]">Three.js 360° viewport ready</div>
          </div>
        </section>

        {/* ── TOOLBAR & ACTIONS ─────────────────────────────────── */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-1 flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-[#8C8477] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, SKU, or category..."
                className="w-full bg-white border border-[#DDD6CA] text-xs text-[#141210] placeholder-[#8C8477] pl-9 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-[#141210] transition-colors shadow-2xs"
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

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-[#DDD6CA] text-xs text-[#141210] px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#141210] cursor-pointer shadow-2xs"
            >
              <option value="all">All Categories ({products.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Stock Filter */}
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="bg-white border border-[#DDD6CA] text-xs text-[#141210] px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-[#141210] cursor-pointer shadow-2xs"
            >
              <option value="all">Stock: All</option>
              <option value="inStock">In Stock Only</option>
              <option value="outOfStock">Out of Stock Only</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 self-end md:self-auto">
            {/* Reset / Re-seed Button */}
            <button
              onClick={handleSeedCatalog}
              disabled={seeding}
              className="px-3.5 py-2.5 bg-white hover:bg-[#FAF8F5] border border-[#DDD6CA] text-xs text-[#5C564E] hover:text-[#141210] rounded-xl transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Reset or re-seed default 6 Furnix products to MongoDB"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${seeding ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Re-Seed Archive</span>
            </button>

            {/* Refresh from DB */}
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="p-2.5 bg-white hover:bg-[#FAF8F5] border border-[#DDD6CA] text-[#5C564E] hover:text-[#141210] rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              title="Refresh product list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>

            {/* Add New Product Button */}
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-[#141210] hover:bg-black text-[#FAF8F5] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center space-x-2 shadow-sm cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </section>

        {/* ── PRODUCTS TABLE ────────────────────────────────────── */}
        <section className="bg-white border border-[#E6DFD5] rounded-2xl shadow-[0_2px_16px_rgba(20,18,16,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E6DFD5] bg-[#FAF8F5] text-[#7A7367] text-[10px] uppercase font-bold tracking-[0.14em]">
                  <th className="py-3.5 px-4">Item</th>
                  <th className="py-3.5 px-4">SKU / ID</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">3D Mode</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EFEAE2]">
                {loading && products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-[#7A7367]">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-5 h-5 rounded-full border-2 border-[#DDD6CA] border-t-[#141210] animate-spin" />
                        <span className="text-xs">Accessing MongoDB Atlas collection...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-[#7A7367]">
                      <p className="text-sm text-[#141210] font-serif">No products matched your criteria</p>
                      <p className="text-xs mt-1 text-[#8C8477]">
                        Try refining your search query or reset the filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-[#FAF7F2] transition-colors group"
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-12 h-12 bg-[#EFEAE2] border border-[#DDD6CA] rounded-xl flex-shrink-0 flex items-center justify-center p-1 overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={product.image || "/images/chair_thumb_yellow.png"}
                              alt={product.name}
                              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="font-serif text-sm text-[#141210] font-medium block truncate">
                              {product.name}
                            </span>
                            <span className="text-[11px] text-[#7A7367] block truncate">
                              {product.subtitle || "Curated Edition"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU / Slug */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-[#7A7367]">
                        <span className="text-[#141210] font-medium">{product.sku || "FNX-001"}</span>
                        <span className="block text-[10px] text-[#8C8477] truncate max-w-[140px]">
                          /{product.id}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-[#5C564E]">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] bg-[#FAF8F5] border border-[#E6DFD5] text-[#5C564E]">
                          {product.category || "Living & Lounge"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono font-medium text-[#141210]">
                        {product.price}
                      </td>

                      {/* Stock Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleStock(product)}
                          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                            product.inStock
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100"
                          }`}
                          title="Click to toggle stock availability"
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
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono bg-amber-50 border border-amber-300 text-amber-900 font-semibold shadow-2xs">
                            <Lock className="w-3 h-3 text-amber-700" />
                            <span>Default 3D</span>
                          </span>
                        ) : product.is3D ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-50/80 border border-amber-200 text-amber-800">
                            <Box className="w-3 h-3" />
                            <span>3D Mode</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#8C8477] font-mono">2D Still</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Live preview */}
                          <Link
                            href={`/products/${product.id}`}
                            target="_blank"
                            className="p-1.5 text-[#7A7367] hover:text-[#141210] hover:bg-[#FAF8F5] rounded-lg border border-transparent hover:border-[#DDD6CA] transition-colors"
                            title="View on storefront"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 text-[#7A7367] hover:text-[#141210] hover:bg-[#FAF8F5] rounded-lg border border-transparent hover:border-[#DDD6CA] transition-colors cursor-pointer"
                            title="Edit product specifications"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          {product.id === "day-241-shack15-armchair" ? (
                            <button
                              disabled
                              className="p-1.5 text-[#C4BCB0] cursor-not-allowed opacity-40 rounded-lg"
                              title="Default 3D showroom model is locked and cannot be deleted"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setDeleteTarget(product)}
                              className="p-1.5 text-[#7A7367] hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
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

          {/* Table Footer info */}
          <div className="p-4 border-t border-[#E6DFD5] bg-[#FAF8F5] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#7A7367] gap-2">
            <span>
              Showing {filteredProducts.length} of {products.length} registered products
            </span>
            <div className="flex items-center space-x-1 font-mono text-[10px] text-[#5C564E]">
              <Database className="w-3 h-3 text-emerald-600" />
              <span>MongoDB Atlas: collection.furnix.products</span>
            </div>
          </div>
        </section>
      </main>

      {/* ── CREATE / EDIT PRODUCT MODAL ───────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#141210]/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-[#E6DFD5] shadow-2xl rounded-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E6DFD5] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#8C8477] block">
                  {editingProduct ? "ARCHIVAL UPDATE" : "NEW ARCHIVAL RECORD"}
                </span>
                <h2 className="text-xl font-serif text-[#141210]">
                  {editingProduct ? `Edit “${editingProduct.name}”` : "Create New Catalog Product"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#7A7367] hover:text-[#141210] transition-colors cursor-pointer rounded-lg hover:bg-[#EFEAE2]"
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
                    <option value="Armchairs">Armchairs</option>
                    <option value="Dining & Studio">Dining & Studio</option>
                    <option value="Tables & Surfaces">Tables & Surfaces</option>
                    <option value="Lighting & Objects">Lighting & Objects</option>
                  </select>
                </div>
              </div>

              {/* Manual Device Image Chooser & Preview */}
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

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Drag & Drop / Device Chooser Card */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed p-4 transition-all duration-200 rounded-xl flex flex-col sm:flex-row items-center gap-4 ${
                    isDragging
                      ? "border-[#141210] bg-[#FAF8F5]"
                      : "border-[#DDD6CA] bg-[#FAF8F5] hover:border-[#141210]"
                  }`}
                >
                  {/* Image Preview or Placeholder */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-[#EFEAE2] border border-[#DDD6CA] rounded-xl flex items-center justify-center p-2 flex-shrink-0 overflow-hidden">
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

                  {/* Actions & Instructions */}
                  <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                    <div>
                      <span className="text-xs font-medium text-[#141210] block">
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
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#141210] hover:bg-black text-[#FAF8F5] hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>{formData.image ? "Choose Different Image" : "Choose Image From Device"}</span>
                      </button>

                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: "" })}
                          className="px-2.5 py-1.5 bg-[#EFEAE2] hover:bg-[#DDD6CA] text-[#5C564E] hover:text-[#141210] rounded-lg text-xs transition-colors cursor-pointer font-medium"
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

                {/* Optional Manual URL & Presets accordion */}
                {showUrlInput && (
                  <div className="p-3.5 bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl space-y-2.5 mt-2 animate-in fade-in duration-150">
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-[#7A7367]">
                      Direct Image URL or Path
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="/images/chair_thumb_yellow.png or https://..."
                      className="w-full bg-white border border-[#DDD6CA] text-xs font-mono text-[#141210] px-3.5 py-2 rounded-lg focus:outline-none focus:border-[#141210]"
                    />

                    {/* Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-[#7A7367] font-medium">Presets:</span>
                      {SAMPLE_PRESET_IMAGES.map((preset) => (
                        <button
                          type="button"
                          key={preset.url}
                          onClick={() => setFormData({ ...formData, image: preset.url })}
                          className={`text-[10px] px-2.5 py-1 border rounded-lg cursor-pointer transition-colors ${
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E6DFD5]">
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

              {/* Story / Design Philosophy */}
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

              {/* Availability & Stock Status */}
              <div className="pt-2 border-t border-[#E6DFD5]">
                <label className="flex items-center space-x-3 p-3.5 bg-[#FAF8F5] border border-[#E6DFD5] cursor-pointer hover:border-[#141210] rounded-xl transition-colors">
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

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-[#E6DFD5] flex items-center justify-end space-x-3">
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
                  className="px-6 py-2.5 bg-[#141210] hover:bg-black text-[#FAF8F5] hover:text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2 shadow-sm active:scale-98"
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
          <div className="w-full max-w-md bg-white border border-rose-200 p-6 shadow-2xl rounded-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0 text-rose-600">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg text-[#141210]">Confirm Product Deletion</h3>
                <p className="text-xs text-[#7A7367] leading-relaxed">
                  Are you sure you want to permanently delete{" "}
                  <strong className="text-[#141210]">“{deleteTarget.name}”</strong> (SKU:{" "}
                  {deleteTarget.sku}) from the MongoDB Atlas database?
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl text-[11px] text-[#5C564E]">
              You can restore the default catalog at any time using the{" "}
              <strong className="text-[#141210]">“Re-Seed Archive”</strong> button.
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
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2 shadow-sm active:scale-98"
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

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="mt-16 border-t border-[#E6DFD5] bg-[#FAF8F5] py-6 px-6 lg:px-12 text-center text-xs text-[#7A7367]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FURNIX ARCHIVAL STUDIO CMS · Studio Operations</span>
          <span className="font-mono text-[11px] text-[#8C8477]">Logged in as: {userEmail}</span>
        </div>
      </footer>
    </div>
  );
}
