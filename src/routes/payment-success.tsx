import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { setCart } from "@/lib/cart-store";
import { saveOrder } from "@/lib/orders";
import { toast } from "sonner";

export const Route = createFileRoute("/payment-success")({
  component: PaymentSuccessPage,
});

const API_BASE = "https://javfoodapp001.azurewebsites.net/api";
const PENDING_ORDER_KEY = "hpk_pending_order";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finalising your order...");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        // ✅ Get Stripe session id from URL
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");

        // ✅ Load order payload saved during checkout
        const raw = localStorage.getItem(PENDING_ORDER_KEY);
        if (!raw) {
          throw new Error("No pending order found");
        }

        const payload = JSON.parse(raw);

        // ✅ Attach Stripe session id
        payload.stripeSessionId = sessionId || "";

        // ✅ Call backend to create order
        const res = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || "Failed to create order");
        }

        const orderRef = data.orderRef;

        // ✅ Save locally for order page
        saveOrder({
          id: orderRef,
          createdAt: new Date().toISOString(),
          status: "confirmed",
          customer: payload.customer,
          delivery: payload.delivery,
          lines: payload.lines.map((l: any) => ({
            itemId: l.itemId,
            qty: l.qty,
            name: l.name,
            pricePence: l.pricePence,
          })),
          subtotalPence: payload.subtotalPence,
          deliveryFeePence: payload.deliveryFeePence,
          totalPence: payload.totalPence,
        });

        // ✅ Clear pending data + cart
        localStorage.removeItem(PENDING_ORDER_KEY);
        setCart([]);

        if (active) {
          toast.success("Payment successful ✅");

          // ✅ Redirect to order page
          navigate({
            to: "/order/$id",
            params: { id: orderRef },
          });
        }
      } catch (err: any) {
        console.error(err);

        if (active) {
          setMessage(err.message || "Something went wrong");
          toast.error("We could not finalise your order");
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-display">
        Payment successful ✅
      </h1>

      <p className="mt-4 text-muted-foreground">
        {message}
      </p>

      <p className="mt-2 text-xs text-muted-foreground">
        Please wait while we finalise your order...
      </p>
    </div>
  );
}
