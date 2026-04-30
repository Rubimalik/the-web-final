"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface CartProduct {
  id: number;
  name: string;
  price: number | null;
  imageUrl?: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  cartPulseKey: number;
  lastAddedProductName: string | null;
  addToCart: (product: CartProduct, quantity?: number) => void;
  buyNow: (product: CartProduct) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  clearLastAddedProductName: () => void;
}

const CART_STORAGE_KEY = "buysupply.cart.v1";

const CartContext = createContext<CartContextValue | undefined>(undefined);

function toPrice(value: number | null): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (item) =>
            item &&
            typeof item.product?.id === "number" &&
            typeof item.quantity === "number" &&
            item.quantity > 0
        );
      }
      return [];
    } catch {
      return [];
    }
  });
  const [cartPulseKey, setCartPulseKey] = useState(0);
  const [lastAddedProductName, setLastAddedProductName] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = items.reduce((acc, item) => acc + toPrice(item.product.price) * item.quantity, 0);

    return {
      items,
      itemCount,
      totalPrice,
      cartPulseKey,
      lastAddedProductName,
      addToCart: (product, quantity = 1) => {
        const safeQty = Math.max(1, Math.floor(quantity));
        setItems((prev) => {
          const existing = prev.find((item) => item.product.id === product.id);
          if (!existing) {
            return [...prev, { product, quantity: safeQty }];
          }
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + safeQty }
              : item
          );
        });
        setCartPulseKey((prev) => prev + 1);
        setLastAddedProductName(product.name);
      },
      buyNow: (product) => {
        setItems((prev) => {
          const existing = prev.find((item) => item.product.id === product.id);
          if (!existing) {
            return [...prev, { product, quantity: 1 }];
          }
          return prev.map((item) =>
            item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        });
        setCartPulseKey((prev) => prev + 1);
        setLastAddedProductName(product.name);
      },
      updateQuantity: (productId, quantity) => {
        const safeQty = Math.max(0, Math.floor(quantity));
        setItems((prev) => {
          if (safeQty === 0) {
            return prev.filter((item) => item.product.id !== productId);
          }
          return prev.map((item) =>
            item.product.id === productId ? { ...item, quantity: safeQty } : item
          );
        });
      },
      removeFromCart: (productId) => {
        setItems((prev) => prev.filter((item) => item.product.id !== productId));
      },
      clearCart: () => setItems([]),
      clearLastAddedProductName: () => setLastAddedProductName(null),
    };
  }, [items, cartPulseKey, lastAddedProductName]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
