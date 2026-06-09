import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { MealCard } from "@/components/site/meal-card";
import { DELIVERY_AREAS, DELIVERY_FEE_PENCE } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import heroFeast from "@/assets/hero-feast.jpg";
import menuData from "@/data/menu.json";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type MenuDish = {
  id: string;
  slug: string;
  name: string;
  description: string;
  available: string[];
  image: string;
  sizes: any[];
};

function getTodayName() {
  return new Date()
    .toLocaleDateString("en-GB", { weekday: "long" })
    .toLowerCase();
}

function getTomorrowName() {
  const d = new Date();
  d.setDate(d.getDate() + 1);

  return d
    .toLocaleDateString("en-GB", { weekday: "long" })
    .toLowerCase();
}

function formatDay(day: string) {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

function isAvailable(item: MenuDish, day: string) {
  return item.available.includes("daily") || item.available.includes(day);
}

function HomePage() {
  const today = getTodayName();
  const tomorrow = getTomorrowName();

  const todayLabel = formatDay(today);
  const tomorrowLabel = formatDay(tomorrow);

  const menu = menuData as MenuDish[];

  const todaysMenu = menu.filter((m) => isAvailable(m, today));
  const tomorrowMenu = menu.filter((m) => isAvailable(m, tomorrow));

  const fullWeekMenu = [...menu].sort((a, b) => {
    const aToday = isAvailable(a, today) ? 1 : 0;
    const bToday = isAvailable(b, today) ? 1 : 0;
    return bToday - aToday;
  });

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroFeast} className="h-full w-full object-cover" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <h1 className="font-display text-4xl text-white sm:text-6xl">
            ZAIQA — Homemade Pakistani Kitchen
          </h1>

          <div className="mt-6">
            <Button asChild size="lg">
              <Link to="/menu">
                See today&apos;s menu <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ✅ TODAY MENU */}
      <Section
        title="Today’s menu"
        subtitle={`Available today — ${todayLabel}`}
      >
        {todaysMenu.length === 0 ? (
          <Empty />
        ) : (
          <Grid>
            {todaysMenu.map((dish) => (
              <MealCard key={dish.id} item={dish} />
            ))}
          </Grid>
        )}
      </Section>

      {/* ✅ ORDER FOR TOMORROW */}
      <Section
        title="Order ahead"
        subtitle={`Available tomorrow — ${tomorrowLabel}`}
      >
        {tomorrowMenu.length === 0 ? (
          <Empty text="No dishes available tomorrow." />
        ) : (
          <Grid>
            {tomorrowMenu.map((dish) => (
              <MealCard key={`tomorrow-${dish.id}`} item={dish} />
            ))}
          </Grid>
        )}
      </Section>

      {/* ✅ FULL WEEK MENU */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 border-t border-border">
        <div className="mb-6">
          <h2 className="font-display text-3xl">
            Full week menu
          </h2>
          <p className="text-sm text-muted-foreground">
            Dishes highlighted are available today.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fullWeekMenu.map((dish) => {
            const todayAvailable = isAvailable(dish, today);

            return (
              <div
                key={dish.id}
                className={`rounded-xl border p-4 ${
                  todayAvailable
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex justify-between">
                  <h3 className="font-medium">{dish.name}</h3>

                  {todayAvailable && (
                    <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                      Today
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {dish.available.includes("daily") ? (
                    <span className="badge-green">Daily</span>
                  ) : (
                    dish.available.map((day) => {
                      const match = day === today;

                      return (
                        <span
                          key={day}
                          className={`px-2 py-1 rounded text-xs ${
                            match
                              ? "bg-primary text-white"
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
      </section>

      {/* DELIVERY */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl">
          Delivery areas
        </h2>

        <ul className="mt-6 grid grid-cols-2 gap-3">
          {DELIVERY_AREAS.map((a) => (
            <li key={a.name} className="border p-4 rounded">
              {a.name}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/* ✅ SMALL COMPONENTS */

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
        <div className="text-xs uppercase text-primary">{title}</div>
        <h2 className="font-display text-3xl">{subtitle}</h2>
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}

function Empty({ text = "No dishes available." }: { text?: string }) {
  return (
    <p className="text-muted-foreground text-center py-6">
      {text}
    </p>
  );
}
