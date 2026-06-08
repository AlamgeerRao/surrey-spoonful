import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CircleDot } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

const API = "https://javfoodapp001.azurewebsites.net/api";

export const Route = createFileRoute("/order/$id")({
  component: OrderPage,
});

const STAGES = [
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "PREPARING", label: "Preparing" },
  { id: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { id: "DELIVERED", label: "Delivered" },
];

function OrderPage() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch live order
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch(`${API}/orders/${id}`);

        if (!res.ok) throw new Error("Failed to load order");

        const data = await res.json();

        if (active) setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <p>Loading your order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Order not found</h1>
        <Button asChild className="mt-6">
          <Link to="/">Go home</Link>
        </Button>
      </div>
    );
  }

  const currentIndex = Math.max(
    0,
    STAGES.findIndex((s) => s.id === order.status)
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-3xl border p-6 text-center">
        <Check className="mx-auto h-8 w-8 text-green-600" />

        <h1 className="mt-4 text-3xl">
          Thanks, {order.customer.name.split(" ")[0]}!
        </h1>

        <p className="mt-2 text-muted-foreground">
          Your order is being processed.
        </p>

        <div className="mt-3 text-xs">
          Order <span className="font-mono">{order.id}</span>
        </div>
      </div>

      {/* ✅ STATUS */}
      <section className="mt-8 border rounded-xl p-4">
        <h2 className="text-lg font-semibold">Order status</h2>

        <ol className="mt-4 space-y-3">
          {STAGES.map((s, i) => {
            const done = i <= currentIndex;

            return (
              <li key={s.id} className="flex gap-3 items-center">
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center ${
                    done
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {done ? <Check size={14} /> : <CircleDot size={14} />}
                </span>

                <span>{s.label}</span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* DELIVERY */}
      <section className="mt-6 border rounded-xl p-4">
        <p>
          <strong>Date:</strong>{" "}
          {format(new Date(order.delivery.date), "EEE d MMM")}
        </p>

        <p>
          <strong>Slot:</strong>{" "}
          {order.delivery.slot === "lunch" ? "Lunch" : "Dinner"}
        </p>
      </section>

      {/* ITEMS */}
      <section className="mt-6 border rounded-xl p-4">
        <h2 className="font-semibold">Items</h2>

        {order.lines.map((l: any) => (
          <div key={l.itemId} className="flex justify-between">
            <span>
              {l.qty} × {l.name}
            </span>
            <span>{formatPrice(l.qty * l.pricePence)}</span>
          </div>
        ))}

        <hr className="my-2" />

        <div className="flex justify-between">
          <span>Total</span>
          <span>{formatPrice(order.totalPence)}</span>
        </div>
      </section>

      <div className="mt-6">
        <Button asChild>
          <Link to="/menu">Order again</Link>
        </Button>
      </div>
    </div>
  );
}
