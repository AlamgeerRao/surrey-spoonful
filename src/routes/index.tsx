import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Leaf, ShieldCheck, Truck, Calendar, Clock3 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MealCard } from "@/components/site/meal-card";
import { DELIVERY_FEE_PENCE } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import heroFeast from "@/assets/hero-feast.jpg";
import menuData from "@/data/menu.json";
import {
  setSelectedDeliveryDate,
  setSelectedDeliverySlot,
  getSelectedDeliverySlot,
} from "@/lib/cart-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "ZAIQAS — Homemade Pakistani Food, Surrey | Halal delivery in Byfleet, Woking & Weybridge",
      },
      {
        name: "description",
        content:
          "Authentic homemade Pakistani food delivered across Surrey. Karahi, biryani, daal and sides.",
      },
      { property: "og:title", content: "ZAIQA — Homemade Pakistani Kitchen" },
      {
        property: "og:description",
        content:
          "Home-cooked Pakistani food delivered across Byfleet, West Byfleet, Woking and Weybridge.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

type MenuDish = {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  available: string[];
  image: string;
  sizes: any[];
  popular?: boolean;
  weeklySpecial?: boolean;
  halal?: boolean;
  allergens?: string[];
  spice?: number;
};

type DayOption = {
  key: string;
  label: string;
  weekday: string;
};

type SlotTile = {
  id: "breakfast" | "lunch" | "dinner";
  title: string;
  time: string;
  available: boolean;
  reason?: string;
};

function getWeekdayName(date: Date) {
  return date
    .toLocaleDateString("en-GB", { weekday: "long" })
    .toLowerCase();
}

function formatDay(day: string) {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

function isAvailable(item: MenuDish, day: string) {
  return item.available.includes("daily") || item.available.includes(day);
}

function getDeliveryDayOptions(): DayOption[] {
  const today = new Date();
  const options: DayOption[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    const weekday = getWeekdayName(d);

    let label = formatDay(weekday);
    if (i === 0) label = "Today";
    if (i === 1) label = "Tomorrow";

    options.push({
      key: d.toISOString().slice(0, 10),
      label,
      weekday,
    });
  }

  return options;
}

function getUkNowParts() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(now).map((p) => [p.type, p.value])
  );

  const dateKey = `${parts.year}-${parts.month}-${parts.day}`;
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);

  return {
    dateKey,
    minutes,
  };
}

function isWeekendWeekday(weekday: string) {
  return weekday === "saturday" || weekday === "sunday";
}

function getInitialSelectedDateKey(dayOptions: DayOption[]) {
  const { minutes } = getUkNowParts();

  // After 15:00 UK time, default homepage to tomorrow
  if (minutes >= 15 * 60 && dayOptions[1]) {
    return dayOptions[1].key;
  }

  return dayOptions[0].key;
}

function getSlotTiles(
  selectedDateKey: string,
  selectedWeekday: string
): SlotTile[] {
  const { dateKey: todayKey, minutes: nowMinutes } = getUkNowParts();
  const isSameDay = selectedDateKey === todayKey;
  const weekend = isWeekendWeekday(selectedWeekday);

  const breakfastAvailable =
    weekend && (!isSameDay || nowMinutes < 8 * 60);

  const lunchAvailable =
    !isSameDay || nowMinutes < 9 * 60;

  const dinnerAvailable =
    !isSameDay || nowMinutes < 15 * 60;

  const breakfastReason = !weekend
    ? "Available on Saturday and Sunday only"
    : isSameDay && !breakfastAvailable
    ? "Cut-off passed for today"
    : undefined;

  const lunchReason =
    isSameDay && !lunchAvailable
      ? "Cut-off passed for today"
      : undefined;

  const dinnerReason =
    isSameDay && !dinnerAvailable
      ? "Cut-off passed for today"
      : undefined;

  return [
    {
      id: "breakfast",
      title: "Weekend breakfast",
      time: "10:00 till 12:00",
      available: breakfastAvailable,
      reason: breakfastReason,
    },
    {
      id: "lunch",
      title: "Lunch",
      time: "12:00 till 14:30",
      available: lunchAvailable,
      reason: lunchReason,
    },
    {
      id: "dinner",
      title: "Dinner",
      time: "17:00 till 19:30",
      available: dinnerAvailable,
      reason: dinnerReason,
    },
  ];
}

function HomePage() {
  const menu = menuData as MenuDish[];
  const dayOptions = useMemo(() => getDeliveryDayOptions(), []);

  const [selectedDateKey, setSelectedDateKey] = useState(
    () => getInitialSelectedDateKey(dayOptions)
  );

  const [selectedSlot, setSelectedSlotState] = useState<
    "breakfast" | "lunch" | "dinner" | null
  >(() => getSelectedDeliverySlot() as any);

  const [showStickyBar, setShowStickyBar] = useState(false);

  function setSelectedSlot(slot: "breakfast" | "lunch" | "dinner") {
    setSelectedSlotState(slot);
    setSelectedDeliverySlot(slot);
  }

  const selectedDay = useMemo(() => {
    return dayOptions.find((d) => d.key === selectedDateKey) || dayOptions[0];
  }, [dayOptions, selectedDateKey]);

  const selectedWeekday = selectedDay.weekday;

  const deliverySlots = useMemo(
    () => getSlotTiles(selectedDateKey, selectedWeekday),
    [selectedDateKey, selectedWeekday]
  );

  const { minutes } = getUkNowParts();
  const sameDayClosed = minutes >= 15 * 60;

  useEffect(() => {
    setSelectedDeliveryDate(selectedDateKey);
  }, [selectedDateKey]);
useEffect(() => {
    if (!selectedSlot) return;

    const stillValid = deliverySlots.some(
      (s) => s.id === selectedSlot && s.available
    );

    if (!stillValid) {
      const firstAvailable = deliverySlots.find((s) => s.available);

      if (firstAvailable) {
        setSelectedSlot(firstAvailable.id);
      }
    }
  }, [deliverySlots]);

  useEffect(() => {
    function onScroll() {
      const slotSection = document.getElementById("delivery-slot-section");
      if (!slotSection) return;

      const triggerPoint =
        slotSection.offsetTop + slotSection.offsetHeight - 140;

      setShowStickyBar(window.scrollY > triggerPoint);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const selectedDayMenu = useMemo(
    () => menu.filter((item) => isAvailable(item, selectedWeekday)),
    [menu, selectedWeekday]
  );

  const fullWeekMenu = useMemo(() => {
    return [...menu].sort((a, b) => {
      const aSelected = isAvailable(a, selectedWeekday) ? 1 : 0;
      const bSelected = isAvailable(b, selectedWeekday) ? 1 : 0;

      if (aSelected !== bSelected) return bSelected - aSelected;
      return a.name.localeCompare(b.name);
    });
  }, [menu, selectedWeekday]);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroFeast}
            alt=""
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "var(--gradient-hero)" }}
          />
          <div className="absolute inset-0 bg-black/45" />
        </div> 
       
          <h1 className="max-w-4xl font-display text-4xl leading-[1.05] text-white sm:text-6xl md:text-7xl">
            Home‑cooked Pakistani food, delivered with love.
          </h1>

          <p className="mt-4 max-w-2xl text-base text-white/90 sm:text-lg">
            Bringing our family kitchen to{" "}
            <span className="underline decoration-saffron decoration-2 underline-offset-4">
              Byfleet, West Byfleet, Woking & Weybridge
            </span>
            .
          </p>

          <p className="mt-4 max-w-2xl text-sm text-white/85 sm:text-base">
            For any event or gathering, we can provide freshly prepared
            home‑cooked food. Message us on WhatsApp to discuss your
            requirements.
          </p>
        </div>
                <div className="mx-auto flex min-h-[55vh] max-w-6xl flex-col justify-center px-4 py-14 sm:min-h-[60vh] sm:px-6">
          {/* HERO TRUST BAR */}
          <div className="mb-6 w-full max-w-4xl rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
            <div className="grid grid-cols-2 gap-3 text-xs text-white sm:grid-cols-4 sm:text-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>100% Halal</span>
              </div>

              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span>{formatPrice(DELIVERY_FEE_PENCE)} delivery</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Lunch & dinner</span>
              </div>

              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                <span>Made fresh daily</span>
              </div>
            </div>
          </div>
      </section>
     
      {/* DELIVERY DATE PICKER */}
      <section className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">
          Step 1 — Choose delivery date
        </div>

        <h2 className="mt-1 font-display text-3xl text-foreground sm:text-4xl">
          Plan your order
        </h2>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Pick a delivery day and we’ll show you what’s available.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {dayOptions.map((day, index) => {
            const todayClosed = index === 0 && sameDayClosed;

            return (
              <button
                key={day.key}
                type="button"
                disabled={todayClosed}
                onClick={() => setSelectedDateKey(day.key)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  selectedDateKey === day.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-secondary"
                } ${todayClosed ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {todayClosed ? "Today (closed)" : day.label}
              </button>
            );
          })}
        </div>
      </section>
{/* DELIVERY INFO + CLICKABLE SLOT TILES */}
<section
  id="delivery-slot-section"
  className="mx-auto max-w-6xl px-4 pt-10 pb-2 sm:px-6"
>
  {/* HEADER */}
  <div>
    <div className="text-xs uppercase tracking-[0.2em] text-primary">
      Step 2 — Select an Available Delivery Slot
    </div>

    <h2 className="mt-1 font-display text-3xl text-foreground sm:text-4xl">
      Choose your delivery slot
    </h2>

    {selectedSlot && (
      <p className="mt-2 text-sm text-foreground">
        Selected slot:{" "}
        <strong>
          {deliverySlots.find((s) => s.id === selectedSlot)?.title}
        </strong>
      </p>
    )}
  </div>

  {/* SLOT BUTTONS */}
  <div className="mt-6 flex flex-wrap gap-3">
    {["breakfast", "lunch", "dinner"].map((slotId) => {
      const slot = deliverySlots.find((s) => s.id === slotId);
      if (!slot) return null;

      const isUnavailable = !slot.available;
      const isSelected = selectedSlot === slot.id;

      const icon =
        slot.id === "breakfast"
          ? "☀️"
          : slot.id === "lunch"
          ? "🍽"
          : "🌙";

      return (
        <button
          key={slot.id}
          type="button"
          disabled={isUnavailable}
          onClick={() => setSelectedSlot(slot.id)}
          className={`min-w-[180px] rounded-full border px-5 py-3 text-sm text-left transition-colors ${
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : isUnavailable
              ? "border-amber-400 bg-white text-amber-900"
              : "border-border bg-card text-foreground hover:bg-secondary"
          } ${isUnavailable ? "cursor-not-allowed opacity-100" : ""}`}
        >
          <div className="flex flex-col">
            {/* TITLE + ICON */}
            <span className="font-medium flex items-center gap-2">
              <span>{icon}</span>
              {slot.title}
            </span>

            {/* TIME */}
            <span
              className={`mt-1 text-xs ${
                isSelected
                  ? "text-primary-foreground/90"
                  : isUnavailable
                  ? "text-amber-800"
                  : "text-muted-foreground"
              }`}
            >
              {slot.time}
            </span>

            {/* REASON */}
            {isUnavailable && slot.reason && (
              <span className="mt-1 text-xs font-medium text-amber-800">
                {slot.reason}
              </span>
            )}
          </div>
        </button>
      );
    })}
  </div>

  {/* INFO LINE */}
  <p className="mt-3 text-sm text-muted-foreground">
    Orders close <strong className="text-foreground">2 hours</strong> before your slot. Showing slot availability for{" "}
    <strong className="text-foreground">{selectedDay.label}</strong>.
  </p>
</section>
      
  {/* SELECTED DAY MENU */}
      <div className="hidden sm:block h-px bg-transparent"></div>
<Section
  id="selected-day-menu"
  title="Step 3 - Select delivery menu"
  subtitle={`Available for ${selectedDay.label}`}
  className="[&_*]:!border-t-0 [&_*]:!border-b-0 pt-4"
>

  {/* ✅ DELIVERY SUMMARY BAR (ALWAYS VISIBLE) */}
<div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm">

  {/* LEFT SIDE */}
  <div className="flex flex-wrap items-center gap-2 sm:gap-3">

    {/* DATE */}
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground">📅</span>
      <span className="font-medium">
        {selectedDay.label} (
        {new Date(selectedDay.key).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        })}
        )
      </span>
    </div>

    {/* SLOT */}
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground">🕒</span>

      {selectedSlot ? (
        <span className="font-medium">
          {deliverySlots.find((s) => s.id === selectedSlot)?.title}
        </span>
      ) : (
        <span className="text-amber-600 font-medium">
          Select a delivery slot
        </span>
      )}
    </div>

  </div>

  {/* RIGHT SIDE */}
  <button
    onClick={() => {
      document
        .getElementById("delivery-slot-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }}
    className="text-sm font-medium text-primary hover:underline"
  >
    Change
  </button>

</div>

  {selectedDayMenu.length === 0 ? (
    <Empty text={`No dishes available for ${selectedDay.label}.`} />
  ) : (
    <Grid>
      {selectedDayMenu.map((dish) => (
        <MealCard key={dish.id} item={dish as any} />
      ))}
    </Grid>
  )}

</Section>
   
      {/* FULL WEEK MENU */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">
              Full week menu
            </div>
            <h2 className="mt-1 font-display text-3xl text-foreground sm:text-4xl">
              What&apos;s cooking through the week
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Dishes highlighted below are available on your selected delivery
              day.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fullWeekMenu.map((dish) => {
              const selectedAvailable = isAvailable(dish, selectedWeekday);

              return (
                <div
                  key={dish.id}
                  className={`rounded-2xl border p-4 transition-colors ${
                    selectedAvailable
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-lg text-foreground">
                        {dish.name}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {dish.description}
                      </div>
                    </div>

                    {selectedAvailable && (
                      <span className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        Selected day
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {dish.available.includes("daily") ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                        Daily
                      </span>
                    ) : (
                      dish.available.map((day) => {
                        const match = day === selectedWeekday;

                        return (
                          <span
                            key={day}
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              match
                                ? "bg-primary text-primary-foreground"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {formatDay(day)}
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </>
  );
}

/* Small UI helpers */

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
    >
      <div className="mb-6">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">
          {title}
        </div>
        <h2 className="font-display text-3xl text-foreground sm:text-4xl">
          {subtitle}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  );
}

function Empty({ text = "No dishes available." }: { text?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}
