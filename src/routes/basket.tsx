import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, Calendar, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

import {
  DELIVERY_FEE_PENCE,
  MIN_ORDER_PENCE,
} from "@/lib/delivery";

import {
  getCart,
  subscribe,
  addToCart,
  setCart,
  getSelectedDeliverySlot, // ✅ ADDED
} from "@/lib/cart-store";

import { format, parseISO, isValid } from "date-fns";

export const Route = createFileRoute("/basket")({
  component: BasketPage,
});

const DELIVERY_DATE_STORAGE_KEY = "hpk_selected_delivery_date";
const CART_DATE_KEY = "hpk_cart_date";

function slotLabel(slot: string | null) {
  if (!slot) return "";
  if (slot === "breakfast") return "Weekend breakfast";
  if (slot === "lunch") return "Lunch";
  return "Dinner";
}

function slotTime(slot: string | null) {
  if (!slot) return "";
  if (slot === "breakfast") return "10:00 till 12:00";
  if (slot === "lunch") return "12:00 till 14:30";
  return "17:00 till 19:30";
}

function BasketPage() {
  const [cart, setLocalCart] = useState(getCart());
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null);
  const [slot, setSlot] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setLocalCart([...getCart()]);
    });
    return unsubscribe;
  }, []);

  // ✅ Load delivery date
  useEffect(() => {
    const selected = localStorage.getItem(DELIVERY_DATE_STORAGE_KEY);
    const cartDate = localStorage.getItem(CART_DATE_KEY);

    if (selected) {
      const parsed = parseISO(selected);
      if (isValid(parsed)) {
        setDeliveryDate(parsed);
      }
    }

    if (selected && cartDate && selected !== cartDate) {
      localStorage.removeItem("hpk_cart");
      localStorage.removeItem(CART_DATE_KEY);
      setLocalCart([]);
    }
  }, []);

  // ✅ Load slot from cart-store
  useEffect(() => {
    const s = getSelectedDeliverySlot();
    if (s) setSlot(s);
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

  function increase(item: any) {
    addToCart({ ...item, quantity: 1 });
  }

  function decrease(item: any) {
    const updated = cart
      .map((c) => {
        if (c.id === item.id && c.size === item.size) {
          return { ...c, quantity: c.quantity - 1 };
        }
        return c;
      })
      .filter((c) => c.quantity > 0);

    if (updated.length === 0) {
      localStorage.removeItem(CART_DATE_KEY);
    }

    setCart(updated);
  }

  function removeItem(item: any) {
    const updated = cart.filter(
      (c) => !(c.id === item.id && c.size === item.size)
    );

    if (updated.length === 0) {
      localStorage.removeItem(CART_DATE_KEY);
    }

    setCart(updated);
  }

  function changeDate() {
    localStorage.removeItem("hpk_cart");
    localStorage.removeItem(CART_DATE_KEY);
    window.location.href = "/";
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Your basket is empty</h1>
        <p className="mt-3 text-muted-foreground">
          Time to put something delicious in it.
        </p>

        <Button asChild className="mt-6 rounded-full">
          <Link to="/">Browse menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl">Your basket</h1>

      {/* ✅ DELIVERY DATE + SLOT */}
      {deliveryDate && (
        <div className="mt-6 rounded-xl border p-4 bg-card space-y-2">

          {/* DATE */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                Delivery: {format(deliveryDate, "EEEE, d MMM yyyy")}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={changeDate}
            >
              Change
            </Button>
          </div>

          {/* ✅ SLOT */}
          {slot && (
            <div className="flex items-center gap-2 text-sm">
              <Clock3 className="h-4 w-4 text-muted-foreground" />
              <span>
                {slotLabel(slot)} — {slotTime(slot)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* CART ITEMS */}
      <ul className="mt-6 divide-y rounded-2xl border bg-card">
        {cart.map((item) => (
          <li key={item.id + item.size} className="flex items-center gap-3 p-4">
            <div className="flex-1">
              <div className="flex justify-between">
                <h3 className="font-display text-lg">
                  {item.name}
                </h3>

                <button onClick={() => removeItem(item)}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="text-xs text-muted-foreground">
                {item.size}
              </div>

              <div className="flex justify-between mt-2">
                <div className="inline-flex items-center border rounded-full">
                  <Button size="icon" variant="ghost" onClick={() => decrease(item)}>
                    <Minus className="h-4 w-4" />
                  </Button>

                  <span className="px-2">{item.quantity}</span>

                  <Button size="icon" variant="ghost" onClick={() => increase(item)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  {formatPrice(item.pricePence * item.quantity)}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* TOTAL */}
      <div className="mt-6 border rounded-xl p-5 bg-card">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatPrice(subtotalPence)}</span>
        </div>

        <div className="flex justify-between text-sm mt-1">
          <span>Delivery</span>
          <span>{formatPrice(DELIVERY_FEE_PENCE)}</span>
        </div>

        <div className="flex justify-between font-bold mt-3 text-base">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>

        {belowMin && (
          <p className="mt-3 text-sm text-amber-700 bg-amber-100 p-3 rounded">
            Add {formatPrice(MIN_ORDER_PENCE - subtotalPence)} more to reach minimum.
          </p>
        )}

        <Button
          asChild
          disabled={belowMin}
          className="mt-5 w-full"
        >
          <Link to="/checkout">Continue</Link>
        </Button>
      </div>
    </div>
  );
}
