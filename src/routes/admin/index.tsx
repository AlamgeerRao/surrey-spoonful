import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Lock, Unlock, X } from "lucide-react";
import { DELIVERY_SLOTS, MAX_ORDERS_PER_SLOT, type DeliverySlotId } from "@/lib/delivery";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

interface SlotDoc {
  slot: DeliverySlotId;
  used: number;
  remaining: number;
  full: boolean;
  closedByAdmin: boolean;
}

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function AdminPage() {
  const [token, setToken] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<SlotDoc[]>([]);
  const [dateClosed, setDateClosed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = sessionStorage.getItem("hpk.adminToken");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (token) sessionStorage.setItem("hpk.adminToken", token);
  }, [token]);

  const load = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const r = await fetch(`${BASE}/slots?date=${ymd(date)}`);
      if (r.ok) {
        const data = await r.json();
        setSlots(data.slots);
        setDateClosed(data.closed);
      } else {
        toast.error("Failed to load");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [date]);

  const override = async (opts: {
    slot?: DeliverySlotId;
    closed: boolean;
  }) => {
    const r = await fetch(`${BASE}/admin/override`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-token": token,
      },
      body: JSON.stringify({ date: ymd(date), ...opts }),
    });

    if (r.ok) {
      toast.success("Saved");
      load();
    } else {
      toast.error("Failed (check admin token)");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="font-display text-4xl text-foreground">
        Admin · Slot management
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        View today's occupancy and close slots when needed.
      </p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5">
        <Label className="text-sm">Admin token</Label>
        <Input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <div className="mt-5">
          <Label className="text-sm">Date</Label>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="mt-1.5 w-full justify-start"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(date, "EEE, d MMM yyyy")}
              </Button>
            </PopoverTrigger>

            <PopoverContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ✅ LINK TO MENU UPLOAD */}
      <div className="mt-6">
        <a
          href="/admin/mupload"
          className="text-primary underline text-sm"
        >
          Go to Menu Upload →
        </a>
      </div>
    </div>
  );
}
