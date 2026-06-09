import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Leaf, ShieldCheck, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MealCard } from "@/components/site/meal-card";
import { DELIVERY_AREAS, DELIVERY_FEE_PENCE } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import heroFeast from "@/assets/hero-feast.jpg";
import menuData from "@/data/menu.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "ZAIQA — Homemade Pakistani Food, Surrey | Halal delivery in Byfleet, Woking & Weybridge",
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
  key: string;       // YYYY-MM-DD
  label: string;     // Today / Tomorrow / Friday
  weekday: string;   // friday
};

const DELIVERY_DATE_STORAGE_KEY = "hpk_selected_delivery_date";

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

function formatAvailableDays(days: string[]) {
  if (days.includes("daily")) return "Daily";
  return days.map((d) => formatDay(d)).join(", ");
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

function HomePage() {
  const menu = menuData as MenuDish[];
  const dayOptions = useMemo(() => getDeliveryDayOptions(), []);

  const [selectedDateKey, setSelectedDateKey] = useState(dayOptions[0].key);

  const selectedDay = useMemo(() => {
    return dayOptions.find((d) => d.key === selectedDateKey) || dayOptions[0];
  }, [dayOptions, selectedDateKey]);

  const selectedWeekday = selectedDay.weekday;

  // ✅ Selected day menu (clickable)
  const selectedDayMenu = useMemo(
    () => menu.filter((item) => isAvailable(item, selectedWeekday)),
    [menu, selectedWeekday]
  );

  // ✅ Full week menu (selected-day dishes first)
  const fullWeekMenu = useMemo(() => {
    return [...menu].sort((a, b) => {
      const aSelected = isAvailable(a, selectedWeekday) ? 1 : 0;
      const bSelected = isAvailable(b, selectedWeekday) ? 1 : 0;

      if (aSelected !== bSelected) return bSelected - aSelected;
      return a.name.localeCompare(b.name);
    });
  }, [menu, selectedWeekday]);

  // ✅ Save selected delivery date so checkout can later reuse it
  useEffect(() => {
    localStorage.setItem(DELIVERY_DATE_STORAGE_KEY, selectedDateKey);
  }, [selectedDateKey]);

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
          <div className="absolute inset-0 bg-clove/40 mix-blend-multiply" />
        </div>

        <div className="mx-auto flex min-h-[80svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/90 backdrop-blur">
            <span aria-hidden>✦</span> Halal · Made in Surrey
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.05] text-white sm:text-6xl md:text-7xl">
            ZAIQA — Homemade Pakistani Kitchen
          </h1>

          <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
            Karahi from a real kadhai. Biryani on dum. Daal that took a day to
            make. Bringing our family kitchen to{" "}
            <span className="underline decoration-saffron decoration-2 underline-offset-4">
              Byfleet, West Byfleet, Woking & Weybridge
            </span>
            .
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/40 bg-white/10 px-6 text-white backdrop-blur hover:bg-white/20 hover:text-white"
            >
              <Link to="/about">Our story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm sm:grid-cols-2 sm:px-6 md:grid-cols-4">
          <Feature
            icon={<ShieldCheck className="h-5 w-5" />}
            title="100% Halal"
            body="Certified meat, ethical sourcing."
          />
          <Feature
            icon={<Truck className="h-5 w-5" />}
            title={`${formatPrice(DELIVERY_FEE_PENCE)} delivery`}
            body="Across our Surrey delivery zones."
          />
          <Feature
            icon={<Clock className="h-5 w-5" />}
            title="Lunch & dinner"
            body="Order at least 2 hrs before your slot."
          />
          <Feature
            icon={<Leaf className="h-5 w-5" />}
            title="Made fresh daily"
            body="No shortcuts, never frozen."
          />
        </div>
      </section>

      {/* DELIVERY DATE PICKER */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">
          Choose delivery date
        </div>

        <h2 className="mt-1 font-display text-3xl text-foreground sm:text-4xl">
          Plan your order
        </h2>

        <p className="mt-3 max-w-2xl text-muted-foreground">
          Pick a delivery day and we’ll show you what’s available.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {dayOptions.map((day) => (
            <button
              key={day.key}
              type="button"
              onClick={() => setSelectedDateKey(day.key)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                selectedDateKey === day.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </section>

      {/* SELECTED DAY MENU */}
      <Section
        title="Selected delivery menu"
        subtitle={`Available for ${selectedDay.label}`}
      >
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
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
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
                  className={`rounded-2xl border p-5 transition-colors ${
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

      {/* DELIVERY ZONES */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">
              Delivery
            </div>
            <h2 className="mt-1 font-display text-3xl text-foreground sm:text-4xl">
              We bring it straight to your door.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Flat {formatPrice(DELIVERY_FEE_PENCE)} delivery across our zones.
              Two slots a day — Lunch and Dinner. Place orders at least{" "}
              <strong className="text-foreground">2 hours</strong> before your
              slot.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/menu">Start an order</Link>
            </Button>
          </div>

          <ul className="grid grid-cols-2 gap-3">
            {DELIVERY_AREAS.map((a) => (
              <li
                key={a.name}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="font-display text-lg text-foreground">
                  {a.name}
                </div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {a.postcodes.join(" · ")}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mb-4 max-w-6xl px-4 sm:px-6">
        <div
          className="overflow-hidden rounded-3xl px-6 py-10 text-center sm:px-12 sm:py-14"
          style={{
            background: "var(--gradient-warm)",
            boxShadow: "var(--shadow-warm)",
          }}
        >
          <h2 className="font-display text-3xl text-primary-foreground sm:text-4xl">
            Hungry? Let&apos;s eat.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/90">
            Choose a delivery date and order home-cooked Pakistani classics.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-6 rounded-full bg-background px-6 text-foreground hover:bg-background/90"
          >
            <Link to="/menu">Order now</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

/* Small UI helpers */

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 border-t border-border">
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

function Feature({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary"
        style={{
          background: "color-mix(in oklab, var(--primary) 12%, transparent)",
        }}
        aria-hidden
      >
        {icon}
      </div>
      <div>
        <div className="font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}
