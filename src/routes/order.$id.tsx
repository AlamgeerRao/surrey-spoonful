import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, CircleDot } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { getOrder } from "@/lib/orders";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/order/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.id} — Homemade Pakistani Kitchen` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

const STAGES = [
  { id: "confirmed", label: "Confirmed" },
  { id: "preparing", label: "Preparing" },
  { id: "out_for_delivery", label: "Out for delivery" },
  { id: "delivered", label: "Delivered" },
] as const;

function OrderPage() {
  const { id } = Route.useParams();
  const order = typeof window !== "undefined" ? getOrder(id) : undefined;

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl">We can't find that order</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          It may have been placed on another device. Please check your email
          for the confirmation.
        </p>
        <Button asChild className="mt-6"><Link to="/">Go home</Link></Button>
      </div>
    );
  }

  const currentIndex = Math.max(0, STAGES.findIndex((s) => s.id === order.status));

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-border bg-card p-6 text-center shadow-[var(--shadow-card)] sm:p-10">
        <div
          className="mx-auto grid h-14 w-14 place-items-center rounded-full text-primary-foreground"
          style={{ background: "var(--gradient-warm)" }}
          aria-hidden
        >
          <Check className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-3xl text-foreground sm:text-4xl">
          Thanks, {order.customer.name.split(" ")[0]}!
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your order is confirmed. We've sent a copy to{" "}
          <span className="text-foreground">{order.customer.email}</span>.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs uppercase tracking-wider">
          Order <span className="font-mono">{order.id}</span>
        </div>
      </div>

      {/* Tracker */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-xl">Order status</h2>
        <ol className="mt-4 space-y-3">
          {STAGES.map((s, i) => {
            const done = i <= currentIndex;
            return (
              <li key={s.id} className="flex items-center gap-3">
                <span
                  className={`grid h-6 w-6 place-items-center rounded-full ${
                    done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : <CircleDot className="h-3.5 w-3.5" />}
                </span>
                <span className={done ? "text-foreground" : "text-muted-foreground"}>
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Delivery */}
      <section className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        <Info label="Delivery date" value={format(new Date(order.delivery.date), "EEE, d MMM yyyy")} />
        <Info label="Slot" value={order.delivery.slot === "lunch" ? "Lunch · 12:00–14:00" : "Dinner · 18:00–20:30"} />
        <Info label="Address" value={`${order.customer.address}, ${order.customer.postcode}`} />
        <Info label="Area" value={order.customer.area} />
        {order.delivery.notes && <Info label="Notes" value={order.delivery.notes} />}
      </section>

      {/* Items */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-xl">What's coming</h2>
        <ul className="mt-3 divide-y divide-border">
          {order.lines.map((l) => (
            <li key={l.itemId} className="flex justify-between py-2 text-sm">
              <span>{l.qty} × {l.name}</span>
              <span className="tabular-nums">{formatPrice(l.pricePence * l.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span className="tabular-nums">{formatPrice(order.subtotalPence)}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span className="tabular-nums">{formatPrice(order.deliveryFeePence)}</span></div>
          <div className="flex justify-between pt-1 font-display text-lg">
            <span>Total</span><span className="tabular-nums">{formatPrice(order.totalPence)}</span>
          </div>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild className="rounded-full"><Link to="/menu">Order again</Link></Button>
        <Button asChild variant="outline" className="rounded-full"><Link to="/">Back to home</Link></Button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm text-foreground">{value}</div>
    </div>
  );
}
