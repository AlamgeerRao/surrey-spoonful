import { app } from "@azure/functions";
import { getCosmos, slotKey } from "../shared/cosmos.js";

// Admin endpoints — protected with a shared header secret ADMIN_TOKEN.
// In production, swap for Static Web Apps built-in auth + roles.

function requireAdmin(req) {
  const token = req.headers.get("x-admin-token");
  return token && token === process.env.ADMIN_TOKEN;
}

// GET /api/admin/slots?date=YYYY-MM-DD  -> occupancy view
app.http("adminSlots", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "admin/slots",
  handler: async (req) => {
    if (!requireAdmin(req)) return { status: 401, jsonBody: { error: "Unauthorized" } };
    const date = new URL(req.url).searchParams.get("date");
    if (!date) return { status: 400, jsonBody: { error: "date required" } };
    const { slots } = getCosmos();
    // Read all docs for this date
    const { resources } = await slots.items
      .query({
        query: "SELECT * FROM c WHERE STARTSWITH(c.pk, @prefix) OR c.pk = @date",
        parameters: [{ name: "@prefix", value: `${date}_` }, { name: "@date", value: date }],
      })
      .fetchAll();
    return { jsonBody: { date, docs: resources } };
  },
});

// POST /api/admin/override  { date, slot?, closed:boolean, reason? }
// If slot omitted -> whole-date override.
app.http("adminOverride", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "admin/override",
  handler: async (req) => {
    if (!requireAdmin(req)) return { status: 401, jsonBody: { error: "Unauthorized" } };
    const { date, slot, closed, reason } = await req.json();
    if (!date || typeof closed !== "boolean") {
      return { status: 400, jsonBody: { error: "date + closed required" } };
    }
    const { slots } = getCosmos();
    if (slot) {
      const pk = slotKey(date, slot);
      await slots.items.upsert({
        id: `override:${pk}`, pk, kind: "override", closed, reason: reason || null,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await slots.items.upsert({
        id: `dateOverride:${date}`, pk: date, kind: "dateOverride", closed, reason: reason || null,
        updatedAt: new Date().toISOString(),
      });
    }
    return { jsonBody: { ok: true } };
  },
});
