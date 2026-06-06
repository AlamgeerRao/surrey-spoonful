import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { DELIVERY_FEE_PENCE, MIN_ORDER_PENCE } from "@/lib/delivery";
import { getCart, subscribe, addToCart, setCart } from "@/lib/cart-store";

export const Route = createFileRoute("/basket")({
  head: () => ({
    meta: [
      { title: "Your basket — Homemade Pakistani Kitchen" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BasketPage,
});

function BasketPage() {
  const [cart, setLocalCart] = useState(getCart());

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setLocalCart([...getCart()]);
    });
    return unsubscribe;
  }, []);

  const subtotalPence = cart.reduce(
    (sum, item) => sum + item.pricePence * item.quantity,
    0
  );

  const belowMin =
    subtotalPence > 0 && subtotalPence < MIN_ORDER_PENCE;

  const total =
    subtotalPence +
    (subtotalPence > 0 ? DELIVERY_FEE_PENCE : 0);

  // ✅ increase quantity
  function increase(item: any) {
    addToCart({
      ...item,
      quantity: 1,
    });
  }

  // ✅ decrease quantity
  function decrease(item: any) {
    const updated = cart
      .map((c) => {
        if (c.id === item.id && c.size === item.size) {
          return { ...c, quantity: c.quantity - 1 };
        }
        return c;
      })
      .filter((c) => c.quantity > 0);

    setCart(updated); // persists ✅
  }

  // ✅ remove item
  function removeItem(item: any) {
    const updated = cart.filter(
      (c) => !(c.id === item.id && c.size === item.size)
    );

    setCart(updated); // persists ✅
  }

  // ✅ empty basket UI
  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl">
          Your basket is empty
        </h1>
        <p className="mt-3 text-muted-foreground">
          Time to put something delicious in it.
        </p>

        <Button asChild className="mt-6 rounded-full">
          <Link to="/menu">Browse menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl text-foreground">
        Your basket
      </h1>

      {/* ✅ CART ITEMS */}
      <ul className="mt-8 divide-y divide-border rounded-2xl border border-border bg-card">
        {cart.map((item) => (
          <li
            key={item.id + item.size}
            className="flex items-center gap-3 p-4 sm:gap-4"
          >
            <div className="min-w-0 flex-1">
              
              {/* NAME + REMOVE */}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg text-foreground">
                  {item.name}
                </h3>

                <button
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* SIZE */}
              <div className="text-xs text-muted-foreground">
                {item.size}
              </div>

              {/* QUANTITY + PRICE */}
              <div className="mt-2 flex items-center justify-between">
                <div className="inline-flex items-center rounded-full border border-border bg-background">
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => decrease(item)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <span className="w-7 text-center text-sm tabular-nums">
                    {item.quantity}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => increase(item)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="font-medium tabular-nums">
                  {formatPrice(item.pricePence * item.quantity)}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* ✅ TOTAL SECTION */}
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

        <Button
          asChild
          size="lg"
          disabled={belowMin}
          className="mt-5 w-full rounded-full"
        >
          <Link to="/checkout">Continue to checkout</Link>
        </Button>

        <Button asChild variant="ghost" className="mt-2 w-full">
          <Link to="/menu">Add more dishes</Link>
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between text-sm ${
        strong
          ? "text-lg font-display text-foreground"
          : "text-foreground"
      }`}
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
