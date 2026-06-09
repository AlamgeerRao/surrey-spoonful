import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { getCart, subscribe } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

import {
  DELIVERY_FEE_PENCE,
  findDeliveryArea,
  MIN_ORDER_PENCE,
  normalisePostcode,
  SUPPORTED_POSTCODE_PREFIXES,
  type DeliverySlotId,
} from "@/lib/delivery";

import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

const API_BASE = "https://javfoodapp001.azurewebsites.net/api";
const PENDING_ORDER_KEY = "hpk_pending_order";
const DELIVERY_DATE_STORAGE_KEY = "hpk_selected_delivery_date";

const schema = z.object({
  name: z.string().trim().min(2),
  mobile: z.string().trim().min(7),
  email: z.string().trim().email(),
  address: z.string().trim().min(6),
  postcode: z.string().trim().min(5),
  notes: z.string().optional(),
});

type SlotResponse = {
  slots: Array<{
    slot: DeliverySlotId;
    available: boolean;
    capacity: number;
    remaining: number;
  }>;
};

function CheckoutPage() {
  const [cart, setLocalCart] = useState(getCart());

  useEffect(() => subscribe(() => setLocalCart([...getCart()])), []);

  // ✅ READ DELIVERY DATE
  const [date, setDate] = useState<Date | undefined>();

  useEffect(() => {
    const stored = localStorage.getItem(DELIVERY_DATE_STORAGE_KEY);
    if (stored) {
      setDate(parseISO(stored));
    } else {
      toast.error("Please select a delivery date first");
    }
  }, []);

  const detailed = cart.map((item) => ({
    item,
    qty: item.quantity,
    linePence: item.quantity * item.pricePence,
  }));

  const subtotalPence = detailed.reduce((s, d) => s + d.linePence, 0);
  const total = subtotalPence + DELIVERY_FEE_PENCE;
  const belowMin = subtotalPence < MIN_ORDER_PENCE;

  const [slot, setSlot] = useState<DeliverySlotId>("lunch");
  const [slotData, setSlotData] = useState<SlotResponse | null>(null);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    postcode: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const area = useMemo(() => findDeliveryArea(form.postcode), [form.postcode]);

  // ✅ LOAD SLOT DATA BASED ON DELIVERY DATE
  useEffect(() => {
    if (!date) return;

    const dateStr = format(date, "yyyy-MM-dd");

    (async () => {
      try {
        const res = await fetch(`${API_BASE}/slots?date=${dateStr}`);
        const data = await res.json();
        setSlotData(data);
      } catch {
        toast.error("Failed to load slots");
      }
    })();
  }, [date]);

  if (!date) {
    return (
      <div className="text-center py-20">
        <h1>Select delivery date first</h1>
        <Button asChild className="mt-4">
          <Link to="/">Go back</Link>
        </Button>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = schema.safeParse(form);

    if (!parsed.success) {
      const errs: any = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0]] = i.message));
      setErrors(errs);
      return;
    }

    if (!area) {
      toast.error("Invalid delivery postcode");
      return;
    }

    const payload = {
      customer: parsed.data,
      delivery: {
        date: format(date, "yyyy-MM-dd"),
        slot,
        notes: parsed.data.notes || "",
      },
      lines: detailed.map((d) => ({
        itemId: d.item.id,
        name: `${d.item.name} (${d.item.size})`,
        qty: d.qty,
        pricePence: d.item.pricePence,
      })),
      subtotalPence,
      deliveryFeePence: DELIVERY_FEE_PENCE,
      totalPence: total,
    };

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE}/create-checkout-session`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(payload));

      window.location.href = data.url;
    } catch {
      toast.error("Payment failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display">Checkout</h1>

      <form onSubmit={submit} className="grid md:grid-cols-2 gap-8 mt-8">
        {/* LEFT */}
        <div className="space-y-6">

          {/* DELIVERY SUMMARY */}
          <div className="border rounded-xl p-4">
            <h2 className="font-bold">Delivery</h2>

            <p className="mt-2 text-sm">
              <strong>Date:</strong>{" "}
              {format(date, "EEEE, d MMM yyyy")}
            </p>

            <p className="text-xs text-muted-foreground mt-1">
              To change date, go back to homepage
            </p>

            <div className="mt-4">
              <Label>Delivery slot</Label>

              <div className="grid gap-2 mt-2">
                {slotData?.slots.map((s) => (
                  <button
                    key={s.slot}
                    type="button"
                    disabled={!s.available}
                    onClick={() => setSlot(s.slot)}
                    className={cn(
                      "border p-3 rounded",
                      slot === s.slot && "bg-primary text-white"
                    )}
                  >
                    {s.slot} ({s.remaining} left)
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CUSTOMER FORM */}
          <div className="border rounded-xl p-4 space-y-4">
            <h2 className="font-bold">Your details</h2>

            <Input
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <Input
              placeholder="Mobile"
              value={form.mobile}
              onChange={(e) =>
                setForm({ ...form, mobile: e.target.value })
              }
            />

            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />

            <Textarea
              placeholder="Address"
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />

            <Input
              placeholder="Postcode"
              value={form.postcode}
              onChange={(e) =>
                setForm({ ...form, postcode: e.target.value })
              }
            />
          </div>
        </div>

        {/* RIGHT SUMMARY */}
        <div className="border p-4 rounded-xl h-fit">
          <h2 className="font-bold">Summary</h2>

          {detailed.map((d) => (
            <div key={d.item.id} className="flex justify-between">
              <span>{d.qty} × {d.item.name}</span>
              <span>{formatPrice(d.linePence)}</span>
            </div>
          ))}

          <div className="mt-4">
            <div className="flex justify-between">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-4"
            disabled={submitting}
          >
            Pay
          </Button>
        </div>
      </form>
    </div>
  );
}
