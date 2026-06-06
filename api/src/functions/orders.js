import { app } from "@azure/functions";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import {
  getCosmos,
  reserveSlot,
  isBeforeCutoff,
} from "../shared/cosmos.js";

const MIN_ORDER_PENCE = 1000; // £10 excl delivery — must match frontend

const OrderSchema = z.object({
  customer: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    phone: z.string().min(7).max(20),
    postcode: z.string().min(5).max(8),
    address: z.string().min(3).max(300),
    notes: z.string().max(500).optional(),
  }),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    pricePence: z.number().int().positive(),
    qty: z.number().int().min(1).max(20),
  })).min(1),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD"),
  deliverySlot: z.enum(["lunch", "dinner"]),
  totalPence: z.number().int().positive(),
});

app.http("createOrder", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "orders",
  handler: async (req, ctx) => {
    try {
      const body = await req.json();
      const parsed = OrderSchema.parse(body);

      // 1) Minimum order (excl delivery)
      const subtotal = parsed.items.reduce((s, i) => s + i.pricePence * i.qty, 0);
      if (subtotal < MIN_ORDER_PENCE) {
        return { status: 400, jsonBody: { error: `Minimum order is £${(MIN_ORDER_PENCE / 100).toFixed(2)} excluding delivery.` } };
      }

      // 2) 2-hour cutoff
      if (!isBeforeCutoff(parsed.deliveryDate, parsed.deliverySlot)) {
        return { status: 400, jsonBody: { error: "Orders must be placed at least 2 hours before the slot start time." } };
      }

      // 3) Slot capacity (reserves +1 if room)
      try {
        await reserveSlot(parsed.deliveryDate, parsed.deliverySlot);
      } catch (e) {
        return { status: 409, jsonBody: { error: e.message || "Slot unavailable" } };
      }

      const { orders } = getCosmos();
      const id = randomUUID();
      const order = {
        id,
        ...parsed,
        status: "pending_payment",
        createdAt: new Date().toISOString(),
      };
      await orders.items.create(order);
      return { status: 201, jsonBody: { id, order } };
    } catch (err) {
      ctx.error("create order failed", err);
      const status = err?.issues ? 400 : 500;
      return { status, jsonBody: { error: err?.message || "Failed" } };
    }
  },
});

app.http("getOrder", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "orders/{id}",
  handler: async (req, ctx) => {
    const id = req.params.id;
    const { orders } = getCosmos();
    try {
      const { resource } = await orders.item(id, id).read();
      if (!resource) return { status: 404, jsonBody: { error: "Not found" } };
      return { jsonBody: resource };
    } catch (err) {
      ctx.error("get order failed", err);
      return { status: 500, jsonBody: { error: "Failed" } };
    }
  },
});
