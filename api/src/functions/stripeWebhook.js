import { app } from "@azure/functions";
import Stripe from "stripe";
import { getCosmos } from "../shared/cosmos.js";

app.http("stripeWebhook", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "webhooks/stripe",
  handler: async (req, ctx) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers.get("stripe-signature");
    const raw = await req.text();
    let event;
    try {
      event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      ctx.error("Invalid Stripe signature", err);
      return { status: 400, body: "Invalid signature" };
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const { orders } = getCosmos();
        try {
          const { resource } = await orders.item(orderId, orderId).read();
          if (resource) {
            resource.status = "paid";
            resource.paidAt = new Date().toISOString();
            resource.stripeSessionId = session.id;
            await orders.item(orderId, orderId).replace(resource);
          }
        } catch (err) {
          ctx.error("order update failed", err);
        }
      }
    }
    return { status: 200, body: "ok" };
  },
});
