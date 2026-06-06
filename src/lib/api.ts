// Thin client for our Azure Functions backend. Falls back gracefully when the
// API is unreachable (e.g. during Lovable preview without /api) so the UI
// stays usable; the server still enforces the hard rules at order time.

import type { DeliverySlotId } from "./delivery";

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

export interface SlotAvailability {
  slot: DeliverySlotId;
  used: number;
  remaining: number;
  full: boolean;
  closedByAdmin: boolean;
}

export interface DateAvailability {
  date: string;                    // YYYY-MM-DD
  closed: boolean;                 // entire date closed by admin
  slots: SlotAvailability[];
}

function ymd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function fetchSlotAvailability(date: Date): Promise<DateAvailability | null> {
  try {
    const r = await fetch(`${BASE}/slots?date=${ymd(date)}`, { headers: { accept: "application/json" } });
    if (!r.ok) return null;
    return (await r.json()) as DateAvailability;
  } catch {
    return null;
  }
}
