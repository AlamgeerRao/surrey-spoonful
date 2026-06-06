import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MENU, type MenuItem } from "./menu-data";

export interface BasketLine {
  // itemId IS the variant id (e.g. "chicken-karahi-half"). Each size is its
  // own line in the basket so quantity edits don't mix sizes.
  itemId: string;
  qty: number;
}

interface BasketContextValue {
  lines: BasketLine[];
  add: (variantId: string, qty?: number) => void;
  remove: (variantId: string) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotalPence: number;
  detailed: { item: MenuItem; qty: number; linePence: number }[];
}

const BasketContext = createContext<BasketContextValue | null>(null);
const STORAGE_KEY = "hpk.basket.v2";

export function BasketProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<BasketLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* ignore */ }
  }, [lines]);

  const add = useCallback((variantId: string, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.itemId === variantId);
      if (i === -1) return [...prev, { itemId: variantId, qty }];
      const next = [...prev];
      next[i] = { ...next[i], qty: next[i].qty + qty };
      return next;
    });
  }, []);

  const remove = useCallback((variantId: string) => {
    setLines((prev) => prev.filter((l) => l.itemId !== variantId));
  }, []);

  const setQty = useCallback((variantId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.itemId !== variantId)
        : prev.map((l) => (l.itemId === variantId ? { ...l, qty } : l)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const detailed = useMemo(
    () =>
      lines
        .map((l) => {
          const item = MENU.find((m) => m.id === l.itemId);
          if (!item) return null;
          return { item, qty: l.qty, linePence: item.pricePence * l.qty };
        })
        .filter((x): x is { item: MenuItem; qty: number; linePence: number } => Boolean(x)),
    [lines],
  );

  const subtotalPence = useMemo(
    () => detailed.reduce((sum, l) => sum + l.linePence, 0),
    [detailed],
  );
  const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);

  const value = useMemo(
    () => ({ lines, add, remove, setQty, clear, count, subtotalPence, detailed }),
    [lines, add, remove, setQty, clear, count, subtotalPence, detailed],
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket() {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error("useBasket must be used inside BasketProvider");
  return ctx;
}
