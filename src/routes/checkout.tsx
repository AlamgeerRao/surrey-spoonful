import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useBasket } from "@/lib/basket";
import { formatPrice } from "@/lib/format";
import {
  DELIVERY_FEE_PENCE,
  DELIVERY_SLOTS,
  earliestDeliveryDate,
  findDeliveryArea,
  isBeforeSameDayCutoff,
  isDateDisabled,
  MIN_ORDER_PENCE,
  normalisePostcode,
  SUPPORTED_POSTCODE_PREFIXES,
} from "@/lib/delivery";
import { newOrderId, saveOrder } from "@/lib/orders";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [{ title: "Checkout — Homemade Pakistani Kitchen" }, { name: "robots", content: "noindex" }],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  mobile: z
    .string()
    .trim()
    .min(7, "Please enter a UK mobile number")
    .max(20)
    .regex(/^[0-9+\s()-]+$/, "Numbers only"),
  email: z.string().trim().email("Please enter a valid email").max(120),
  address: z.string().trim().min(6, "Please enter your full address").max(200),
  postcode: z.string().trim().min(5, "Enter a UK postcode").max(10),
  notes: z.string().trim().max(400).optional(),
});

function CheckoutPage() {
  const { detailed, subtotalPence, clear } = useBasket();
  const navigate = useNavigate();
  const now = new Date();
  const sameDay = isBeforeSameDayCutoff(now);

  const [date, setDate] = useState<Date | undefined>(earliestDeliveryDate(now));
  const [slot, setSlot] = useState<"lunch" | "dinner">("lunch");
  const [form, setForm] = useState({ name: "", mobile: "", email: "", address: "", postcode: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const total = subtotalPence + DELIVERY_FEE_PENCE;
  const belowMin = subtotalPence < MIN_ORDER_PENCE;
  const area = useMemo(() => findDeliveryArea(form.postcode), [form.postcode]);

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Your basket is empty</h1>
        <Button asChild className="mt-6" onClick={() => navigate({ to: "/menu" })}>
          <span>Browse the menu</span>
        </Button>
      </div>
    );
  }

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[String(issue.path[0])] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    if (!area) {
      setErrors((prev) => ({ ...prev, postcode: "Sorry, we don't deliver to that postcode yet." }));
      return;
    }
    if (!date) {
      toast.error("Please choose a delivery date");
      return;
    }
    if (belowMin) {
      toast.error(`Minimum order is ${formatPrice(MIN_ORDER_PENCE)}`);
      return;
    }

    setSubmitting(true);
    // NOTE: Payment integration (Stripe) will wrap this step — order is only
    // persisted on successful payment. For v1 we simulate success.
    await new Promise((r) => setTimeout(r, 700));

    const id = newOrderId();
    saveOrder({
      id,
      createdAt: new Date().toISOString(),
      status: "confirmed",
      customer: {
        name: parsed.data.name,
        mobile: parsed.data.mobile,
        email: parsed.data.email,
        address: parsed.data.address,
        postcode: normalisePostcode(parsed.data.postcode),
        area: area.name,
      },
      delivery: {
        date: date.toISOString(),
        slot,
        notes: parsed.data.notes,
      },
      lines: detailed.map((d) => ({
        itemId: d.item.id,
        qty: d.qty,
        name: d.item.name,
        pricePence: d.item.pricePence,
      })),
      subtotalPence,
      deliveryFeePence: DELIVERY_FEE_PENCE,
      totalPence: total,
    });

    clear();
    navigate({ to: "/order/$id", params: { id } });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl text-foreground">Checkout</h1>

      {!sameDay && (
        <p className="mt-4 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
          It's past <strong>10:30am</strong> — same-day delivery is closed. Please
          choose a future delivery date below.
        </p>
      )}

      <form onSubmit={submit} className="mt-8 grid gap-8 md:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Contact */}
          <Section title="Your details">
            <Field id="name" label="Full name" error={errors.name}>
              <Input id="name" autoComplete="name" value={form.name} onChange={update("name")} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="mobile" label="Mobile number" error={errors.mobile}>
                <Input id="mobile" inputMode="tel" autoComplete="tel" placeholder="07…" value={form.mobile} onChange={update("mobile")} />
              </Field>
              <Field id="email" label="Email" error={errors.email}>
                <Input id="email" type="email" autoComplete="email" value={form.email} onChange={update("email")} />
              </Field>
            </div>
          </Section>

          {/* Delivery */}
          <Section title="Delivery">
            <Field id="address" label="Delivery address" error={errors.address}>
              <Textarea id="address" rows={3} autoComplete="street-address" value={form.address} onChange={update("address")} />
            </Field>
            <Field
              id="postcode"
              label="Postcode"
              error={errors.postcode}
              hint={
                area
                  ? `We deliver to ${area.name} — you're in!`
                  : `Supported: ${SUPPORTED_POSTCODE_PREFIXES.join(", ")}`
              }
            >
              <Input
                id="postcode"
                autoComplete="postal-code"
                value={form.postcode}
                onChange={update("postcode")}
                className={cn(
                  form.postcode && !area && "border-destructive",
                  area && "border-cardamom",
                )}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm">Delivery date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      className={cn("mt-1.5 w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
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
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {sameDay
                    ? "Order by 10:30am for same-day delivery."
                    : "Same-day delivery is closed — please pick a future date."}
                </p>
              </div>

              <div>
                <Label className="text-sm">Delivery slot</Label>
                <RadioGroup value={slot} onValueChange={(v) => setSlot(v as "lunch" | "dinner")} className="mt-1.5 grid gap-2">
                  {DELIVERY_SLOTS.map((s) => (
                    <label
                      key={s.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm",
                        slot === s.id ? "border-primary bg-primary/5" : "border-border bg-card",
                      )}
                    >
                      <RadioGroupItem value={s.id} id={`slot-${s.id}`} />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <Field id="notes" label="Order notes (optional)" hint="Allergies, gate code, leave at door, etc.">
              <Textarea id="notes" rows={3} value={form.notes} onChange={update("notes")} />
            </Field>
          </Section>
        </div>

        {/* Summary */}
        <aside className="space-y-3 self-start rounded-2xl border border-border bg-card p-5 md:sticky md:top-24">
          <h2 className="font-display text-xl">Order summary</h2>
          <ul className="divide-y divide-border">
            {detailed.map((d) => (
              <li key={d.item.id} className="flex justify-between gap-3 py-2 text-sm">
                <span className="text-foreground">
                  <span className="text-muted-foreground">{d.qty} ×</span> {d.item.name}
                </span>
                <span className="tabular-nums">{formatPrice(d.linePence)}</span>
              </li>
            ))}
          </ul>
          <div className="h-px bg-border" />
          <Row label="Subtotal" value={formatPrice(subtotalPence)} />
          <Row label="Delivery" value={formatPrice(DELIVERY_FEE_PENCE)} />
          <Row label="Total" value={formatPrice(total)} strong />
          <Button type="submit" size="lg" className="mt-3 w-full rounded-full" disabled={submitting}>
            {submitting ? "Placing order…" : `Pay ${formatPrice(total)}`}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Card payment via Stripe will be enabled at launch — for now your
            order is recorded for testing.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-xl text-foreground">{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm">{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${strong ? "pt-1 font-display text-lg" : "text-sm"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
