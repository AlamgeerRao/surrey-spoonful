// Slot capacity helpers.
// Storage model:
//   container "slots" partitioned on /pk where pk = `${date}_${slotId}`.
//   Two doc kinds per partition:
//     - kind="counter", id=pk, used: number
//     - kind="override", id=`override:${pk}`, closed: bool, reason?
//   Plus per-date overrides at id=`dateOverride:${date}` (partition pk=date) for full-day closures.

import { CosmosClient } from "@azure/cosmos";

let _client;
function client() {
  if (!_client) {
    _client = new CosmosClient({
      endpoint: process.env.COSMOS_ENDPOINT,
      key: process.env.COSMOS_KEY,
    });
  }
  return _client;
}
export function getCosmos() {
  const db = client().database(process.env.COSMOS_DB || "hpk");
  return {
    menu: db.container("menu"),
    orders: db.container("orders"),
    contacts: db.container("contacts"),
    slots: db.container("slots"),
  };
}

export const MAX_ORDERS_PER_SLOT = 4;
export const SLOT_DEFS = {
  lunch:  { startHour: 11, startMinute: 30 },
  dinner: { startHour: 16, startMinute: 30 },
};

export function slotKey(date, slot) { return `${date}_${slot}`; }

export async function readSlotState(date, slot) {
  const { slots } = getCosmos();
  const pk = slotKey(date, slot);
  let used = 0, closedByAdmin = false;
  try {
    const { resource } = await slots.item(pk, pk).read();
    if (resource?.kind === "counter") used = resource.used || 0;
  } catch { /* not found */ }
  try {
    const { resource } = await slots.item(`override:${pk}`, pk).read();
    if (resource?.closed) closedByAdmin = true;
  } catch { /* not found */ }
  return { used, closedByAdmin };
}

export async function readDateClosed(date) {
  const { slots } = getCosmos();
  try {
    const { resource } = await slots.item(`dateOverride:${date}`, date).read();
    return Boolean(resource?.closed);
  } catch { return false; }
}

/** Atomic-ish reservation: read counter, throw if full, write +1. */
export async function reserveSlot(date, slot) {
  const { slots } = getCosmos();
  const pk = slotKey(date, slot);
  const { used, closedByAdmin } = await readSlotState(date, slot);
  const dateClosed = await readDateClosed(date);
  if (closedByAdmin || dateClosed) throw new Error("Slot closed by kitchen");
  if (used >= MAX_ORDERS_PER_SLOT) throw new Error("Slot full");

  // Optimistic write — upsert with new count. Note: under heavy concurrency
  // use Cosmos optimistic concurrency (ETag) or a stored procedure.
  await slots.items.upsert({ id: pk, pk, kind: "counter", used: used + 1, updatedAt: new Date().toISOString() });
  return { used: used + 1, remaining: MAX_ORDERS_PER_SLOT - (used + 1) };
}

/** Validate that the order is placed at least 2h before the slot start. */
export function isBeforeCutoff(date /* YYYY-MM-DD */, slot, now = new Date()) {
  const def = SLOT_DEFS[slot];
  if (!def) return false;
  const [y, m, d] = date.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d, def.startHour, def.startMinute));
  // Treat slot times as UK local; rough offset (BST +1 / GMT 0). For prod use
  // a tz library — for v1 this approximation is fine.
  const offsetMs = 0;
  const cutoff = start.getTime() - 2 * 60 * 60 * 1000 - offsetMs;
  return now.getTime() <= cutoff;
}
