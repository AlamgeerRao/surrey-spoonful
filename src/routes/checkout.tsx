import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
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

import { getCart, subscribe, setCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

import {
  DELIVERY_FEE_PENCE,
  DELIVERY_SLOTS,
  computeSlotStatuses,
  earliestDeliveryDate,
  findDeliveryArea,
  isDateDisabled,
  MIN_ORDER_PENCE,
  normalisePostcode,
  SUPPORTED_POSTCODE_PREFIXES,
  type DeliverySlotId,
} from "@/lib/delivery";

import { fetchSlotAvailability } from "@/lib/api";
import { newOrderId, saveOrder } from "@/lib/orders";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

const schema = z.object({
  name: z.string().min(2),
  mobile: z.string().min(7),
  email: z.string().email(),
  address: z.string().min(6),
  postcode: z.string().min(5),
  notes: z.string().optional(),
});

function CheckoutPage() {
  const navigate = useNavigate();

  // ✅ NEW: cart from store
  const [cart, setLocalCart] = useState(getCart());

  useEffect(() => {
    return subscribe(() => {
      setLocalCart([...getCart()]);
    });
  }, []);

  // ✅ Convert cart → detailed items (matches old structure)
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

  const clearCart = () => setCart([]);

  const now = new Date();

  const [date, setDate] = useState<Date | undefined>(earliestDeliveryDate(now));
  const [slot, setSlot] = useState<DeliverySlotId>("lunch");
  const [counts, setCounts] = useState({});
  const [closed, setClosed] = useState({});
  const [dateClosed, setDateClosed] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    postcode: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!date) return;

    (async () => {
      const data = await fetchSlotAvailability(date);

      if (!data) {
        setCounts({});
        setClosed({});
        return;
      }

      const c = {};
      const cl = {};

      for (const s of data.slots) {
        c[s.slot] = s.used;
        cl[s.slot] = s.closedByAdmin;
      }

      setCounts(c);
      setClosed(cl);
      setDateClosed(data.closed);
    })();
  }, [date]);

  const statuses = useMemo(
    () => (date ? computeSlotStatuses(date, counts, closed, now) : []),
    [date, counts, closed]
  );

  const total = subtotalPence + DELIVERY_FEE_PENCE;
  const belowMin = subtotalPence < MIN_ORDER_PENCE;
  const area = findDeliveryArea(form.postcode);

  if (detailed.length === 0) {
    return (
      <div className="text-center py-20">
        <h1>Your basket is empty</h1>
        <Button asChild>
          <Link to="/menu">Browse menu</Link>
        </Button>
      </div>
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!area) {
      toast.error("Invalid postcode");
      return;
    }

    const id = newOrderId();

    saveOrder({
      id,
      lines: detailed,
      subtotalPence,
      totalPence: total,
    });

    clearCart();

    navigate({ to: "/order/$id", params: { id } });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display">Checkout</h1>

      <form onSubmit={submit} className="grid md:grid-cols-2 gap-8 mt-8">

        {/* LEFT FORM */}
        <div className="space-y-4">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <Input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Textarea placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>

        {/* RIGHT SUMMARY */}
        <div className="border rounded-xl p-4">
          <h2 className="font-bold">Summary</h2>

          {detailed.map((d) => (
            <div key={d.item.id + d.item.sizeLabel} className="flex justify-between text-sm">
              <span>{d.qty} × {d.item.name}</span>
              <span>{formatPrice(d.linePence)}</span>
            </div>
          ))}

          <hr className="my-2" />

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotalPence)}</span>
          </div>

          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{formatPrice(DELIVERY_FEE_PENCE)}</span>
          </div>

          <div className="flex justify-between font-bold mt-2">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

          <Button type="submit" className="w-full mt-4">
            Confirm Order
          </Button>
        </div>
      </form>
    </div>
  );
}
