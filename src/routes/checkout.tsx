import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { getCart, subscribe } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

import {
  DELIVERY_FEE_PENCE,
  earliestDeliveryDate,
  findDeliveryArea,
  isDateDisabled,
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

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  mobile: z.string().trim().min(7, "Please enter a valid mobile number"),
  email: z.string().trim().email("Please enter a valid email address"),
  address: z.string().trim().min(6, "Please enter your address"),
  postcode: z.string().trim().min(5, "Please enter your postcode"),
  notes: z.string().optional(),
});

type SlotResponse = {
  closed: boolean;
  slots: Array<{
    slot: DeliverySlotId;
    used: number;
    capacity: number;
    closedByAdmin: boolean;
    allowedByTime: boolean;
    available: boolean;
    remaining: number;
  }>;
};

function CheckoutPage() {
  const [cart, setLocalCart] = useState(getCart());

  useEffect(() => {
    return subscribe(() => {
      setLocalCart([...getCart()]);
    });
  }, []);

  const detailed = cart.map((item) => ({
    item: {
      id: item.id,
      name: item.name,
      sizeLabel: item.size,
      pricePence: item.pricePence,
    },
    qty: item.quantity,
    linePence: item.quantity * item.pricePence,
  }));

  const subtotalPence = detailed.reduce((sum, d) => sum + d.linePence, 0);
  const total = subtotalPence + DELIVERY_FEE_PENCE;
  const belowMin = subtotalPence < MIN_ORDER_PENCE;

  const now = new Date();
  const [date, setDate] = useState<Date | undefined>(earliestDeliveryDate(now));
  const [slot, setSlot] = useState<DeliverySlotId>("lunch");
  const [slotData, setSlotData] = useState<SlotResponse | null>(null);
  const [slotLoading, setSlotLoading] = useState(false);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cancelled") === "1") {
      toast.error("Payment was cancelled");
    }
  }, []);

  useEffect(() => {
    if (!date) return;

    const dateStr = format(date, "yyyy-MM-dd");
    let active = true;

    (async () => {
      try {
        setSlotLoading(true);

        const res = await fetch(`${API_BASE}/slots?date=${dateStr}`);

        if (!res.ok) {
          throw new Error("Failed to load slot availability");
        }

        const data: SlotResponse = await res.json();

        if (!active) return;

        setSlotData(data);

        const current = data.slots.find((s) => s.slot === slot);
        if (!current || !current.available) {
          const nextAvailable = data.slots.find((s) => s.available);
          if (nextAvailable) {
            setSlot(nextAvailable.slot);
          }
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setSlotData(null);
          toast.error("Could not load delivery slots");
        }
      } finally {
        if (active) setSlotLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [date, slot]);

  if (detailed.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-display">Your basket is empty</h1>
        <Button asChild className="mt-4">
          <Link to="/menu">Browse menu</Link>
        </Button>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const parsed = schema.safeParse(form);

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        nextErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }

    if (!area) {
      toast.error("We do not currently deliver to that postcode");
      return;
    }

    if (!date) {
      toast.error("Please choose a delivery date");
      return;
    }

    if (belowMin) {
      toast.error(
        `Minimum order is ${formatPrice(MIN_ORDER_PENCE)} excluding delivery`
      );
      return;
    }

    const chosen = slotData?.slots.find((s) => s.slot === slot);
    if (!chosen || !chosen.available) {
      toast.error("Please choose an available delivery slot");
      return;
    }

    const payload = {
      customer: {
        name: parsed.data.name,
        mobile: parsed.data.mobile,
        email: parsed.data.email,
        address: parsed.data.address,
        postcode: normalisePostcode(parsed.data.postcode),
      },
      delivery: {
        date: format(date, "yyyy-MM-dd"),
        slot,
        notes: parsed.data.notes || "",
      },
      lines: detailed.map((d) => ({
        itemId: d.item.id,
        name: `${d.item.name} (${d.item.sizeLabel})`,
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Failed to create checkout session");
      }

      // store pending order for success page
      localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(payload));

      // redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to start payment");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display">Checkout</h1>

      <form onSubmit={submit} className="grid md:grid-cols-2 gap-8 mt-8">
        {/* LEFT FORM */}
        <div className="space-y-6">
          <div className="space-y-4 border rounded-xl p-4">
            <h2 className="font-bold">Your details</h2>

            <div>
              <Label>Name</Label>
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label>Mobile</Label>
              <Input
                placeholder="Mobile"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
              {errors.mobile && (
                <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>
              )}
            </div>

            <div>
              <Label>Email</Label>
              <Input
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label>Address</Label>
              <Textarea
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              {errors.address && (
                <p className="text-xs text-red-500 mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <Label>Postcode</Label>
              <Input
                placeholder="Postcode"
                value={form.postcode}
                onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                className={cn(
                  form.postcode && !area && "border-red-500",
                  area && "border-green-600"
                )}
              />
              {errors.postcode && (
                <p className="text-xs text-red-500 mt-1">{errors.postcode}</p>
              )}
              {!errors.postcode && (
                <p className="text-xs text-muted-foreground mt-1">
                  {area
                    ? `We deliver to ${area.name}`
                    : `Supported: ${SUPPORTED_POSTCODE_PREFIXES.join(", ")}`}
                </p>
              )}
            </div>

            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Allergies, delivery notes, gate code..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4 border rounded-xl p-4">
            <h2 className="font-bold">Delivery</h2>

            <div>
              <Label>Delivery date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "mt-2 w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "EEE, d MMM yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => isDateDisabled(d, now)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Delivery slot</Label>

              {slotLoading ? (
                <p className="text-sm text-muted-foreground mt-2">
                  Loading slots...
                </p>
              ) : slotData ? (
                <div className="mt-2 grid gap-2">
                  {slotData.slots.map((s) => {
                    const disabled = !s.available;

                    return (
                      <button
                        key={s.slot}
                        type="button"
                        disabled={disabled}
                        onClick={() => setSlot(s.slot)}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                          slot === s.slot && !disabled
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card",
                          disabled && "cursor-not-allowed opacity-60"
                        )}
                      >
                        <span>
                          <span className="block font-medium text-foreground">
                            {s.slot === "lunch" ? "Lunch" : "Dinner"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {s.available
                              ? `${s.remaining} of ${s.capacity} slots left`
                              : s.closedByAdmin
                              ? "Closed"
                              : !s.allowedByTime
                              ? "Unavailable for this date/time"
                              : "Full"}
                          </span>
                        </span>

                        {!s.available && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-600">
                            Unavailable
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-red-500 mt-2">
                  Could not load slots
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SUMMARY */}
        <div className="border rounded-xl p-4 h-fit">
          <h2 className="font-bold">Summary</h2>

          {detailed.map((d) => (
            <div
              key={d.item.id + d.item.sizeLabel}
              className="flex justify-between text-sm py-1"
            >
              <span>
                {d.qty} × {d.item.name}
                <span className="block text-xs text-muted-foreground">
                  {d.item.sizeLabel}
                </span>
              </span>
              <span>{formatPrice(d.linePence)}</span>
            </div>
          ))}

          <hr className="my-3" />

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
            <p className="mt-3 rounded-xl bg-amber-100 p-3 text-xs text-amber-900">
              Minimum order is {formatPrice(MIN_ORDER_PENCE)} excluding
              delivery.
            </p>
          )}

          <Button
            type="submit"
            className="w-full mt-4"
            disabled={submitting || belowMin}
          >
            {submitting ? "Redirecting to payment..." : "Pay securely with Stripe"}
          </Button>
        </div>
      </form>
    </div>
  );
}
