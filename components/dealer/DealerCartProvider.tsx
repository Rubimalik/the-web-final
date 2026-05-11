"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface DealerCartProduct {
  id: number;
  name: string;
  retailPrice: number | null;
  dealerPrice: number | null;
  imageUrl?: string;
  categoryName?: string | null;
  minQuantity?: number;
}

export interface DealerCartItem {
  product: DealerCartProduct;
  quantity: number;
}

interface DealerCartContextValue {
  items: DealerCartItem[];
  itemCount: number;
  totalPrice: number;
  cartPulseKey: number;
  lastAddedProductName: string | null;
  addToDealerCart: (product: DealerCartProduct, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  clearLastAddedProductName: () => void;
}

const DEALER_CART_STORAGE_KEY = "buysupply.dealer-cart.v1";

const DealerCartContext = createContext<DealerCartContextValue | undefined>(undefined);

function getUnitPrice(product: DealerCartProduct) {
  const value = product.dealerPrice ?? product.retailPrice;
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getMinimumQuantity(product: DealerCartProduct) {
  return Math.max(1, Math.floor(product.minQuantity ?? 1));
}

export default function DealerCartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<DealerCartItem[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [cartPulseKey, setCartPulseKey] = useState(0);
  const [lastAddedProductName, setLastAddedProductName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DEALER_CART_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as DealerCartItem[];
      if (!Array.isArray(parsed)) return;

      setItems(
        parsed.filter(
          (item) =>
            item &&
            typeof item.product?.id === "number" &&
            typeof item.product?.name === "string" &&
            typeof item.quantity === "number" &&
            item.quantity > 0,
        ),
      );
    } catch {
      setItems([]);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(DEALER_CART_STORAGE_KEY, JSON.stringify(items));
  }, [hasHydrated, items]);

  const value = useMemo<DealerCartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + getUnitPrice(item.product) * item.quantity,
      0,
    );

    return {
      items,
      itemCount,
      totalPrice,
      cartPulseKey,
      lastAddedProductName,
      addToDealerCart: (product, quantity = getMinimumQuantity(product)) => {
        const minimumQuantity = getMinimumQuantity(product);
        const safeQuantity = Math.max(minimumQuantity, Math.floor(quantity));
        setItems((current) => {
          const existing = current.find((item) => item.product.id === product.id);
          if (!existing) {
            return [...current, { product, quantity: safeQuantity }];
          }

          return current.map((item) =>
            item.product.id === product.id
              ? {
                  ...item,
                  product,
                  quantity: item.quantity + safeQuantity,
                }
              : item,
          );
        });
        setCartPulseKey((current) => current + 1);
        setLastAddedProductName(product.name);
      },
      updateQuantity: (productId, quantity) => {
        setItems((current) =>
          current.flatMap((item) => {
            if (item.product.id !== productId) return [item];
            const safeQuantity = Math.floor(quantity);
            if (!Number.isFinite(safeQuantity) || safeQuantity <= 0) return [];
            return [
              {
                ...item,
                quantity: Math.max(getMinimumQuantity(item.product), safeQuantity),
              },
            ];
          }),
        );
      },
      removeFromCart: (productId) => {
        setItems((current) => current.filter((item) => item.product.id !== productId));
      },
      clearCart: () => setItems([]),
      clearLastAddedProductName: () => setLastAddedProductName(null),
    };
  }, [cartPulseKey, items, lastAddedProductName]);

  return (
    <DealerCartContext.Provider value={value}>
      {children}
    </DealerCartContext.Provider>
  );
}

export function useDealerCart() {
  const context = useContext(DealerCartContext);
  if (!context) {
    throw new Error("useDealerCart must be used within DealerCartProvider");
  }
  return context;
}
