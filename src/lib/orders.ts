import type { BasketLine } from "./basket";

export interface Order {
  id: string;
  createdAt: string;
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered";
  customer: {
    name: string;
    mobile: string;
    email: string;
    address: string;
    postcode: string;
    area: string;
  };
  delivery: {
    date: string; // ISO date
    slot: "lunch" | "dinner";
    notes?: string;
  };
  lines: (BasketLine & { name: string; pricePence: number })[];
  subtotalPence: number;
  deliveryFeePence: number;
  totalPence: number;
}

const KEY = "hpk.orders.v1";

function read(): Order[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function write(orders: Order[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(orders));
  } catch {
    /* ignore */
  }
}

export function saveOrder(order: Order) {
  const orders = read();
  orders.unshift(order);
  write(orders.slice(0, 25));
}

export function getOrder(id: string): Order | undefined {
  return read().find((o) => o.id === id);
}

export function newOrderId(): string {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const ts = Date.now().toString(36).slice(-4).toUpperCase();
  return `HPK-${ts}${rand}`;
}
