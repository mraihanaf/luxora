"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { CartLine } from "@/lib/types";

type CartContextValue = {
  lines: CartLine[];
  totalQty: number;
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const value = useMemo<CartContextValue>(() => {
    const totalQty = lines.reduce((sum, l) => sum + l.qty, 0);

    const add: CartContextValue["add"] = (productId, qty = 1) => {
      if (!Number.isFinite(qty) || qty <= 0) return;
      setLines((prev) => {
        const next = [...prev];
        const i = next.findIndex((l) => l.productId === productId);
        if (i >= 0) next[i] = { productId, qty: next[i].qty + qty };
        else next.push({ productId, qty });
        return next;
      });
    };

    const remove: CartContextValue["remove"] = (productId) => {
      setLines((prev) => prev.filter((l) => l.productId !== productId));
    };

    const setQty: CartContextValue["setQty"] = (productId, qty) => {
      if (!Number.isFinite(qty)) return;
      if (qty <= 0) {
        remove(productId);
        return;
      }
      setLines((prev) =>
        prev.map((l) => (l.productId === productId ? { ...l, qty } : l)),
      );
    };

    const clear: CartContextValue["clear"] = () => setLines([]);

    return { lines, totalQty, add, remove, setQty, clear };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

