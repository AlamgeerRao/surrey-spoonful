import { app } from "@azure/functions";
import Stripe from "stripe";
import { getCosmos } from "../shared/cosmos.js";

app.http("createCheckoutSession", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "checkout",
  handler: async (req, ctx) => {
    try {
      const { orderId } = await req.json();
      const { orders } = getCosmos();
      const { resource: order } = await orders.item(orderId, orderId).read();
      if (!order) return { status: 404, jsonBody: { error: "Order not found" } };

      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const origin = req.headers.get("origin") || "";
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: order.items.map((i) => ({
          price_data: {
            currency: "gbp",
            product_data: { name: i.name },
            unit_amount: i.pricePence,
          },
          quantity: i.qty,
        })),
        metadata: { orderId: order.id },
        success_url: `${origin}/order/${order.id}?paid=1`,
        cancel_url: `${origin}/basket`,
        customer_email: order.customer.email,
      });

      return { jsonBody: { url: session.url, id: session.id } };
    } catch (err) {
      ctx.error("checkout failed", err);
      return { status: 500, jsonBody: { error: "Checkout failed" } };
    }
  },
});
