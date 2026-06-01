// Delivery rules for Homemade Pakistani Kitchen
// Areas: Byfleet, West Byfleet, Woking, Weybridge
// Cut-off for same-day: 10:30 Europe/London

export const DELIVERY_FEE_PENCE = 199;
export const MIN_ORDER_PENCE = 1500; // £15 minimum

export const DELIVERY_AREAS = [
  { name: "Byfleet", postcodes: ["KT14"] },
  { name: "West Byfleet", postcodes: ["KT14"] },
  { name: "Woking", postcodes: ["GU21", "GU22"] },
  { name: "Weybridge", postcodes: ["KT13"] },
] as const;

export const SUPPORTED_POSTCODE_PREFIXES = Array.from(
  new Set(DELIVERY_AREAS.flatMap((a) => a.postcodes)),
);

export const DELIVERY_SLOTS = [
  { id: "lunch", label: "Lunch · 12:00 – 14:00" },
  { id: "dinner", label: "Dinner · 18:00 – 20:30" },
] as const;
export type DeliverySlotId = (typeof DELIVERY_SLOTS)[number]["id"];

export const SAME_DAY_CUTOFF_HOUR = 10;
export const SAME_DAY_CUTOFF_MINUTE = 30;

export function normalisePostcode(raw: string): string {
  return raw.toUpperCase().replace(/\s+/g, "");
}

/** Returns the matched area if the postcode is in our delivery zone. */
export function findDeliveryArea(rawPostcode: string) {
  const pc = normalisePostcode(rawPostcode);
  return DELIVERY_AREAS.find((area) =>
    area.postcodes.some((prefix) => pc.startsWith(prefix)),
  );
}

export function isPostcodeSupported(rawPostcode: string): boolean {
  return Boolean(findDeliveryArea(rawPostcode));
}

/** True if right-now (Europe/London) is before the same-day cut-off. */
export function isBeforeSameDayCutoff(now: Date = new Date()): boolean {
  // Best-effort London time; client browser tz used.
  const h = now.getHours();
  const m = now.getMinutes();
  return h < SAME_DAY_CUTOFF_HOUR ||
    (h === SAME_DAY_CUTOFF_HOUR && m < SAME_DAY_CUTOFF_MINUTE);
}

/** Earliest selectable delivery date. */
export function earliestDeliveryDate(now: Date = new Date()): Date {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  if (!isBeforeSameDayCutoff(now)) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

/** Disable predicate for the date picker. */
export function isDateDisabled(date: Date, now: Date = new Date()): boolean {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  const earliest = earliestDeliveryDate(now);
  const horizon = new Date(earliest);
  horizon.setDate(horizon.getDate() + 14); // up to 2 weeks ahead
  return day < earliest || day > horizon;
}
