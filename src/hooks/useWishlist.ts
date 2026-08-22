import { useCallback, useSyncExternalStore } from "react";
import type { Product } from "./useProducts";

const STORAGE_KEY = "greencart_wishlist";

// The wishlist is read by several components at once (Navbar badge, ShopPage,
// ProductDetailPage, WishlistPage). Keeping it in a module-level store rather
// than per-hook `useState` means a toggle in one of them is reflected in all of
// them immediately — the same guarantee CartContext gives the cart.
let wishlist: Product[] = load();
const listeners = new Set<() => void>();

function load(): Product[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Product[]) : [];
  } catch {
    return [];
  }
}

function setWishlist(next: Product[]) {
  wishlist = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore storage errors (e.g. private mode quota)
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return wishlist;
}

export function useWishlist() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const addToWishlist = useCallback((product: Product) => {
    if (wishlist.some((p) => p.id === product.id)) return;
    setWishlist([...wishlist, product]);
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setWishlist(wishlist.filter((p) => p.id !== id));
  }, []);

  const isInWishlist = useCallback((id: string) => items.some((p) => p.id === id), [items]);

  const toggleWishlist = useCallback((product: Product) => {
    if (wishlist.some((p) => p.id === product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }, [addToWishlist, removeFromWishlist]);

  return { wishlist: items, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist };
}
