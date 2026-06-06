// Delivery rules for Homemade Pakistani Kitchen
// Areas: Byfleet, West Byfleet, Woking, Weybridge
// Slots: Lunch 11:30–14:30, Dinner 16:30–19:30
// Order must be placed at least 2 hours before the slot start time.
// Capacity: 4 orders per slot.

export const DELIVERY_FEE_PENCE = 199;
export const MIN_ORDER_PENCE = 1000;          // £10 excl delivery
export const MAX_ORDERS_PER_SLOT = 4;
export const CUTOFF_HOURS_BEFORE_SLOT = 2;

export const DELIVERY_AREAS = [
  { name: "Byfleet", postcodes: ["KT14"] },
  { name: "West Byfleet", postcodes: ["KT14"] },
  { name: "Woking", postcodes: ["GU21", "GU22"] },
  { name: "Weybridge", postcodes: ["KT13"] },
] as const;

export const SUPPORTED_POSTCODE_PREFIXES = Array.from(
  new Set(DELIVERY_AREAS.flatMap((a) => a.postcodes)),
);

export type DeliverySlotId = "lunch" | "dinner";

export interface SlotDef {
  id: DeliverySlotId;
  label: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export const DELIVERY_SLOTS: SlotDef[] = [
  { id: "lunch",  label: "Lunch · 11:30 – 14:30",  startHour: 11, startMinute: 30, endHour: 14, endMinute: 30 },
  { id: "dinner", label: "Dinner · 16:30 – 19:30", startHour: 16, startMinute: 30, endHour: 19, endMinute: 30 },
];

export function getSlot(id: DeliverySlotId): SlotDef {
  return DELIVERY_SLOTS.find((s) => s.id === id) ?? DELIVERY_SLOTS[0];
}

export function normalisePostcode(raw: string): string {
  return raw.toUpperCase().replace(/\s+/g, "");
}

export function findDeliveryArea(rawPostcode: string) {
  const pc = normalisePostcode(rawPostcode);
  return DELIVERY_AREAS.find((area) =>
    area.postcodes.some((prefix) => pc.startsWith(prefix)),
  );
}

export function isPostcodeSupported(rawPostcode: string): boolean {
  return Boolean(findDeliveryArea(rawPostcode));
}

/** Build a Date for the given delivery day + slot start time. */
export function slotStartDate(day: Date, slotId: DeliverySlotId): Date {
  const s = getSlot(slotId);
  const d = new Date(day);
  d.setHours(s.startHour, s.startMinute, 0, 0);
  return d;
}

/** True if `now` is at least CUTOFF_HOURS_BEFORE_SLOT before the slot start. */
export function isBeforeSlotCutoff(day: Date, slotId: DeliverySlotId, now: Date = new Date()): boolean {
  const start = slotStartDate(day, slotId);
  const cutoff = new Date(start.getTime() - CUTOFF_HOURS_BEFORE_SLOT * 60 * 60 * 1000);
  return now <= cutoff;
}

/** Earliest selectable delivery date (today if any slot still open, else tomorrow). */
export function earliestDeliveryDate(now: Date = new Date()): Date {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const anyOpen = DELIVERY_SLOTS.some((s) => isBeforeSlotCutoff(today, s.id, now));
  if (anyOpen) return today;
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

export function isDateDisabled(date: Date, now: Date = new Date()): boolean {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const earliest = earliestDeliveryDate(now);
  const horizon = new Date(earliest);
  horizon.setDate(horizon.getDate() + 14);
  return day < earliest || day > horizon;
}

/** Partition key for slot capacity in Cosmos: `2026-06-10_lunch`. */
export function slotKey(day: Date | string, slotId: DeliverySlotId): string {
  const d = typeof day === "string" ? new Date(day) : day;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}_${slotId}`;
}

export interface SlotStatus {
  id: DeliverySlotId;
  label: string;
  remaining: number;            // 0..MAX_ORDERS_PER_SLOT
  full: boolean;
  pastCutoff: boolean;
  closedByAdmin: boolean;
  available: boolean;           // !full && !pastCutoff && !closedByAdmin
  reason?: string;
}

/** Compute slot statuses for a date given counts/admin overrides (typically from API). */
export function computeSlotStatuses(
  day: Date,
  counts: Partial<Record<DeliverySlotId, number>> = {},
  closed: Partial<Record<DeliverySlotId, boolean>> = {},
  now: Date = new Date(),
): SlotStatus[] {
  return DELIVERY_SLOTS.map((s) => {
    const used = counts[s.id] ?? 0;
    const remaining = Math.max(0, MAX_ORDERS_PER_SLOT - used);
    const full = remaining <= 0;
    const pastCutoff = !isBeforeSlotCutoff(day, s.id, now);
    const closedByAdmin = Boolean(closed[s.id]);
    const available = !full && !pastCutoff && !closedByAdmin;
    const reason = closedByAdmin
      ? "Closed by kitchen"
      : full
      ? "Full"
      : pastCutoff
      ? "Too late — needs 2 hrs notice"
      : undefined;
    return { id: s.id, label: s.label, remaining, full, pastCutoff, closedByAdmin, available, reason };
  });
}
