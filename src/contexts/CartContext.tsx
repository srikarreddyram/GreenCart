import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import type { Product } from "@/hooks/useProducts";

export type { Product };

export interface CartItemEntry {
  product: Product;
  quantity: number;
  variantId?: string;
}

interface CartState {
  items: CartItemEntry[];
}

type CartAction =
  | { type: "ADD"; product: Product; quantity?: number; variantId?: string }
  | { type: "REMOVE"; productId: string; variantId?: string }
  | { type: "UPDATE_QTY"; productId: string; quantity: number; variantId?: string }
  | { type: "CLEAR" };

const STORAGE_KEY = "greencart_cart";

function cartKey(productId: string, variantId?: string) {
  return variantId ? `${productId}::${variantId}` : productId;
}

function loadFromStorage(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CartState;
  } catch {
    // ignore parse errors
  }
  return { items: [] };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      const key = cartKey(action.product.id, action.variantId);
      const exists = state.items.findIndex(
        (i) => cartKey(i.product.id, i.variantId) === key
      );
      if (exists >= 0) {
        const items = [...state.items];
        items[exists] = {
          ...items[exists],
          quantity: items[exists].quantity + (action.quantity ?? 1),
        };
        return { items };
      }
      return {
        items: [
          ...state.items,
          { product: action.product, quantity: action.quantity ?? 1, variantId: action.variantId },
        ],
      };
    }
    case "REMOVE": {
      const key = cartKey(action.productId, action.variantId);
      return { items: state.items.filter((i) => cartKey(i.product.id, i.variantId) !== key) };
    }
    case "UPDATE_QTY": {
      const key = cartKey(action.productId, action.variantId);
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => cartKey(i.product.id, i.variantId) !== key) };
      }
      return {
        items: state.items.map((i) =>
          cartKey(i.product.id, i.variantId) === key ? { ...i, quantity: action.quantity } : i
        ),
      };
    }
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItemEntry[];
  totalItems: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  isInCart: (productId: string, variantId?: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadFromStorage);

  // Persist cart to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors (e.g. private mode quota)
    }
  }, [state]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const addItem = (product: Product, quantity = 1, variantId?: string) =>
    dispatch({ type: "ADD", product, quantity, variantId });

  const removeItem = (productId: string, variantId?: string) =>
    dispatch({ type: "REMOVE", productId, variantId });

  const updateQuantity = (productId: string, quantity: number, variantId?: string) =>
    dispatch({ type: "UPDATE_QTY", productId, quantity, variantId });

  const clearCart = () => dispatch({ type: "CLEAR" });

  const isInCart = (productId: string, variantId?: string) =>
    state.items.some((i) => cartKey(i.product.id, i.variantId) === cartKey(productId, variantId));

  return (
    <CartContext.Provider
      value={{ items: state.items, totalItems, subtotal, addItem, removeItem, updateQuantity, clearCart, isInCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be used within CartProvider");
  return ctx;
}
