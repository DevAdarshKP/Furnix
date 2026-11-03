/**
 * Reactive store for Furnix Shopping Bag & Wishlist.
 * Supports synchronous 0-latency updates across Navbar, Collection Cards,
 * Cart Drawer, Single Product View, Cart Page, and Wishlist Page.
 * Automatically synchronizes with browser localStorage.
 */

export interface CartItem {
  id: string;
  name: string;
  category?: string;
  price: string;
  priceNum: number;
  image?: string;
  quantity: number;
}

export interface CollectionItem {
  id: string;
  name: string;
  category?: string;
  subtitle?: string;
  price: string;
  priceNum: number;
  image?: string;
  isFeatured?: boolean;
  is3D?: boolean;
  material?: string;
  dimensions?: string;
  description?: string;
  inStock?: boolean;
}

export interface WishlistItem {
  id: string;
  name: string;
  subtitle?: string;
  category?: string;
  price: string;
  priceNum: number;
  image?: string;
  material?: string;
  dimensions?: string;
  inStock?: boolean;
}

type Listener = () => void;

// Default initial state
const DEFAULT_CART: CartItem[] = [];
const DEFAULT_WISHLIST: WishlistItem[] = [];

let cartItems: CartItem[] = [];
let wishlistItems: WishlistItem[] = [];
let likedItemIds = new Set<string>();
let isCartDrawerOpen = false;
let toastMessage: string | null = null;
let toastTimeout: NodeJS.Timeout | null = null;
let quickViewItem: CollectionItem | null = null;

const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error("Cart listener error:", err);
    }
  });
}

function saveToStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("furnix_cart_v2", JSON.stringify(cartItems));
    localStorage.setItem("furnix_wishlist_v2", JSON.stringify(wishlistItems));
  } catch (err) {
    console.error("Failed to save to localStorage:", err);
  }
}

// Known product image fallbacks ensuring no broken thumbnails
export const KNOWN_PRODUCT_IMAGES: Record<string, string> = {
  "day-241-shack15-armchair": "/images/chair_thumb_yellow.png",
  "cyan-armchair": "/images/cyan_chair.png",
  "modular-sofa": "/images/modular_blue_sofa.png",
  "bergere-wingback": "/images/wingback_chair.png",
  "dauphine-armchair": "/images/wood_armchair.png",
  "koto-lounge": "/images/midcentury_sofa.png",
  "green-arm-chair": "/images/atelier_green_armchair.jpg",
};

export function cleanImageUrl(url?: string, itemId?: string): string {
  if (!url || typeof url !== "string" || !url.trim() || url === "undefined" || url === "null") {
    if (itemId && KNOWN_PRODUCT_IMAGES[itemId]) {
      return KNOWN_PRODUCT_IMAGES[itemId];
    }
    return "/images/chair_thumb_yellow.png";
  }
  const cleaned = url.trim().replace(/^https?:\/\/localhost:\d+/i, "");
  if (!cleaned || cleaned === "/" || cleaned.includes("undefined")) {
    if (itemId && KNOWN_PRODUCT_IMAGES[itemId]) {
      return KNOWN_PRODUCT_IMAGES[itemId];
    }
    return "/images/chair_thumb_yellow.png";
  }
  return cleaned;
}

function loadFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const savedCart = localStorage.getItem("furnix_cart_v2");
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      if (Array.isArray(parsed)) {
        cartItems = parsed.map((item: CartItem) => ({
          ...item,
          image: cleanImageUrl(item.image, item.id),
        }));
      }
    }
    const savedWishlist = localStorage.getItem("furnix_wishlist_v2");
    if (savedWishlist) {
      const parsed = JSON.parse(savedWishlist);
      if (Array.isArray(parsed)) {
        wishlistItems = parsed.map((item: WishlistItem) => ({
          ...item,
          image: cleanImageUrl(item.image, item.id),
        }));
        likedItemIds = new Set(wishlistItems.map((i) => i.id));
      }
    }
    // Re-save sanitized data to heal local storage immediately
    saveToStorage();
  } catch (err) {
    console.error("Failed to load from localStorage:", err);
  }
}

// Hydrate on initial load in browser
if (typeof window !== "undefined") {
  loadFromStorage();
}

export function subscribeToCart(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCartItems(): CartItem[] {
  return cartItems;
}

export function getCartCount(): number {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(): number {
  return cartItems.reduce((total, item) => total + item.priceNum * item.quantity, 0);
}

export function getWishlistItems(): WishlistItem[] {
  return wishlistItems;
}

export function getWishlistCount(): number {
  return wishlistItems.length;
}

export function getLikedItemIds(): Set<string> {
  return likedItemIds;
}

export function isItemLiked(id: string): boolean {
  return likedItemIds.has(id);
}

export function isItemInWishlist(id: string): boolean {
  return likedItemIds.has(id);
}

export function isDrawerOpen(): boolean {
  return isCartDrawerOpen;
}

export function getToastMessage(): string | null {
  return toastMessage;
}

export function getQuickViewItem(): CollectionItem | null {
  return quickViewItem;
}

export function openCartDrawer() {
  isCartDrawerOpen = true;
  notify();
}

export function closeCartDrawer() {
  isCartDrawerOpen = false;
  notify();
}

export function toggleCartDrawer() {
  isCartDrawerOpen = !isCartDrawerOpen;
  notify();
}

export function openQuickView(item: CollectionItem) {
  quickViewItem = item;
  notify();
}

export function closeQuickView() {
  quickViewItem = null;
  notify();
}

export function showToast(message: string) {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  toastMessage = message;
  notify();

  toastTimeout = setTimeout(() => {
    toastMessage = null;
    notify();
  }, 2800);
}

export function addToCart(item: CollectionItem | WishlistItem, quantity = 1) {
  const existingIndex = cartItems.findIndex((i) => i.id === item.id);
  const resolvedImage = cleanImageUrl(item.image, item.id);
  if (existingIndex > -1) {
    cartItems[existingIndex].quantity += quantity;
    if (!cartItems[existingIndex].image || cartItems[existingIndex].image === "/images/chair_thumb_yellow.png") {
      cartItems[existingIndex].image = resolvedImage;
    }
  } else {
    cartItems.push({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      priceNum: item.priceNum || parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0,
      image: resolvedImage,
      quantity,
    });
  }
  saveToStorage();
  showToast(`Added to bag: ${item.name} (${item.price})`);
  notify();
}

export function removeFromCart(itemId: string) {
  const removed = cartItems.find((i) => i.id === itemId);
  cartItems = cartItems.filter((i) => i.id !== itemId);
  saveToStorage();
  if (removed) {
    showToast(`Removed from bag: ${removed.name}`);
  }
  notify();
}

export function updateCartQuantity(itemId: string, newQuantity: number) {
  if (newQuantity <= 0) {
    removeFromCart(itemId);
    return;
  }
  const item = cartItems.find((i) => i.id === itemId);
  if (item) {
    item.quantity = newQuantity;
    saveToStorage();
    notify();
  }
}

export function clearCart() {
  cartItems = [];
  saveToStorage();
  showToast("Shopping bag cleared");
  notify();
}

export function toggleLike(item: CollectionItem | WishlistItem) {
  if (likedItemIds.has(item.id)) {
    removeFromWishlist(item.id);
  } else {
    addToWishlist(item);
  }
}

export function addToWishlist(item: CollectionItem | WishlistItem) {
  if (!likedItemIds.has(item.id)) {
    likedItemIds.add(item.id);
    const wishlistItem: WishlistItem = {
      id: item.id,
      name: item.name,
      subtitle: item.subtitle,
      category: item.category,
      price: item.price,
      priceNum: item.priceNum || parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0,
      image: cleanImageUrl(item.image, item.id),
      material: item.material,
      dimensions: item.dimensions,
      inStock: item.inStock ?? true,
    };
    wishlistItems.push(wishlistItem);
    saveToStorage();
    showToast(`Saved to wishlist: ${item.name}`);
    notify();
  }
}

export function removeFromWishlist(itemId: string) {
  if (likedItemIds.has(itemId)) {
    likedItemIds.delete(itemId);
    const removed = wishlistItems.find((i) => i.id === itemId);
    wishlistItems = wishlistItems.filter((i) => i.id !== itemId);
    saveToStorage();
    if (removed) {
      showToast(`Removed from wishlist: ${removed.name}`);
    }
    notify();
  }
}

export function clearWishlist() {
  likedItemIds.clear();
  wishlistItems = [];
  saveToStorage();
  showToast("Wishlist cleared");
  notify();
}

export function moveWishlistToCart(item: WishlistItem) {
  addToCart(item, 1);
  removeFromWishlist(item.id);
  showToast(`Moved to bag: ${item.name}`);
}

export function moveAllWishlistToCart() {
  if (wishlistItems.length === 0) return;
  const count = wishlistItems.length;
  wishlistItems.forEach((item) => {
    const existing = cartItems.find((c) => c.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cartItems.push({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.price,
        priceNum: item.priceNum,
        image: item.image,
        quantity: 1,
      });
    }
  });
  wishlistItems = [];
  likedItemIds.clear();
  saveToStorage();
  showToast(`Moved ${count} item${count > 1 ? "s" : ""} from wishlist to bag`);
  notify();
}
