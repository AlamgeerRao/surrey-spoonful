import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBasket } from "@/lib/basket";
import { formatPrice } from "@/lib/format";
import { DELIVERY_FEE_PENCE, MIN_ORDER_PENCE } from "@/lib/delivery";

export const Route = createFileRoute("/basket")({
  head: () => ({
    meta: [{ title: "Your basket — Homemade Pakistani Kitchen" }, { name: "robots", content: "noindex" }],
  }),
  component: BasketPage,
});

function BasketPage() {
  const { detailed, setQty, remove, subtotalPence } = useBasket();
  const belowMin = subtotalPence > 0 && subtotalPence < MIN_ORDER_PENCE;
  const total = subtotalPence + (subtotalPence > 0 ? DELIVERY_FEE_PENCE : 0);
  // Minimum is excl. delivery — message reflects that.

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Your basket is empty</h1>
        <p className="mt-3 text-muted-foreground">Time to put something delicious in it.</p>
        <Button asChild className="mt-6 rounded-full"><Link to="/menu">Browse menu</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl text-foreground">Your basket</h1>

      <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
        {detailed.map(({ item, qty, linePence }) => (
          <li key={item.id} className="flex items-center gap-3 p-4 sm:gap-4">
            <img src={item.image} alt="" width={80} height={80} className="h-16 w-16 rounded-xl object-cover sm:h-20 sm:w-20" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <Link to="/menu/$slug" params={{ slug: item.slug }} className="font-display text-lg text-foreground hover:text-primary">
                  {item.name}
                </Link>
                <button
                  aria-label={`Remove ${item.name}`}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remove(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-muted-foreground">{item.sizeLabel}</div>
              <div className="mt-2 flex items-center justify-between">
                <div className="inline-flex items-center rounded-full border border-border bg-background">
                  <Button variant="ghost" size="icon" aria-label="Decrease" onClick={() => setQty(item.id, qty - 1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-7 text-center text-sm tabular-nums">{qty}</span>
                  <Button variant="ghost" size="icon" aria-label="Increase" onClick={() => setQty(item.id, qty + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="font-medium tabular-nums">{formatPrice(linePence)}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <Row label="Subtotal" value={formatPrice(subtotalPence)} />
        <Row label="Delivery" value={formatPrice(DELIVERY_FEE_PENCE)} />
        <div className="my-3 h-px bg-border" />
        <Row label="Total" value={formatPrice(total)} strong />

        {belowMin && (
          <p className="mt-4 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
            Add {formatPrice(MIN_ORDER_PENCE - subtotalPence)} more to reach our £
            {(MIN_ORDER_PENCE / 100).toFixed(0)} minimum (excl. delivery).
          </p>
        )}

        <Button asChild size="lg" disabled={belowMin} className="mt-5 w-full rounded-full">
          <Link to="/checkout">Continue to checkout</Link>
        </Button>
        <Button asChild variant="ghost" className="mt-2 w-full">
          <Link to="/menu">Add more dishes</Link>
        </Button>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between text-sm ${strong ? "text-lg font-display text-foreground" : "text-foreground"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
