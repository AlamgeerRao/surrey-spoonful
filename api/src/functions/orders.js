import { app } from "@azure/functions";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { getCosmos } from "../shared/cosmos.js";

const OrderSchema = z.object({
  customer: z.object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    phone: z.string().min(7).max(20),
    postcode: z.string().min(5).max(8),
    address: z.string().min(3).max(300),
    notes: z.string().max(500).optional(),
  }),
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        pricePence: z.number().int().positive(),
        qty: z.number().int().min(1).max(20),
      }),
    )
    .min(1),
  deliveryDate: z.string(),
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
