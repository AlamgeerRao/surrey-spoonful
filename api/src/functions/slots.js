import { app } from "@azure/functions";
import { readDateClosed, readSlotState, SLOT_DEFS, MAX_ORDERS_PER_SLOT } from "../shared/cosmos.js";

// GET /api/slots?date=YYYY-MM-DD
// Returns slot availability for a given date.
app.http("getSlots", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "slots",
  handler: async (req, ctx) => {
    try {
      const date = new URL(req.url).searchParams.get("date");
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return { status: 400, jsonBody: { error: "Bad date" } };
      }
      const closed = await readDateClosed(date);
      const slots = [];
      for (const slot of Object.keys(SLOT_DEFS)) {
        const { used, closedByAdmin } = await readSlotState(date, slot);
        slots.push({
          slot,
          used,
          remaining: Math.max(0, MAX_ORDERS_PER_SLOT - used),
          full: used >= MAX_ORDERS_PER_SLOT,
          closedByAdmin,
        });
      }
      return { jsonBody: { date, closed, slots } };
    } catch (err) {
      ctx.error("slots failed", err);
      return { status: 500, jsonBody: { error: "Failed" } };
    }
  },
});
