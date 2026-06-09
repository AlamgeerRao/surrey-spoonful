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
import { setSelectedDeliveryDate } from "@/lib/cart-store";

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
  key: string; // YYYY-MM-DD
  label: string; // Today / Tomorrow / Friday
  weekday: string; // friday
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

function HomePage() {
  const menu = menuData as MenuDish[];
  const dayOptions = useMemo(() => getDeliveryDayOptions(), []);
  const [selectedDateKey, setSelectedDateKey] = useState(dayOptions[0].key);

  const selectedDay = useMemo(() => {
    return dayOptions.find((d) => d.key === selectedDateKey) || dayOptions[0];
  }, [dayOptions, selectedDateKey]);

  const selectedWeekday = selectedDay.weekday;

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

  // ✅ Save selected delivery date globally for cart / checkout
  useEffect(() => {
    setSelectedDeliveryDate(selectedDateKey);
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

          {/* TRUST + WHATSAPP CTA */}
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-3 text-sm text-white/90 sm:grid-cols-4">
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

            <p className="mt-4 text-sm text-white/80">
              For event catering, contact us on WhatsApp.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <a href="#selected-day-menu">
                Choose dishes <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Button>

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
        id="selected-day-menu"
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
              <a href="#selected-day-menu">Start an order</a>
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
            <a href="#selected-day-menu">Order now</a>
          </Button>
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
      className="mx-auto max-w-6xl border-t border-border px-4 py-16 sm:px-6"
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
