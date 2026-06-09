import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MealCard } from "@/components/site/meal-card";
import { DELIVERY_AREAS, DELIVERY_FEE_PENCE } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import heroFeast from "@/assets/hero-feast.jpg";
import menuData from "@/data/menu.json";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function getTodayName() {
  return new Date()
    .toLocaleDateString("en-GB", { weekday: "long" })
    .toLowerCase();
}

function formatAvailableDays(days: string[]) {
  return days
    .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
    .join(", ");
}

function HomePage() {
  const today = getTodayName();
  const menu = menuData as any[];

  // ✅ TODAY'S MENU
  const todaysMenu = menu.filter(
    (item) =>
      item.available.includes("daily") ||
      item.available.includes(today)
  );

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
                See today's menu <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ✅ TODAY'S MENU (CLICKABLE) */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary">
            Today’s menu
          </div>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl">
            Available today
          </h2>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {todaysMenu.map((dish) => (
            <MealCard key={dish.id} item={dish} />
          ))}
        </div>

        {todaysMenu.length === 0 && (
          <p className="mt-6 text-center text-muted-foreground">
            No dishes available today.
          </p>
        )}
      </section>

      {/* ✅ FULL WEEK MENU (NON-CLICKABLE LIST) */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 border-t border-border">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-primary">
            Full week menu
          </div>
          <h2 className="mt-1 font-display text-3xl sm:text-4xl">
            What’s cooking through the week
          </h2>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {menu.map((dish) => (
            <div
              key={dish.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="font-display text-lg text-foreground">
                {dish.name}
              </div>

              <div className="mt-2 text-sm text-muted-foreground">
                Available:{" "}
                {dish.available.includes("daily")
                  ? "Daily"
                  : formatAvailableDays(dish.available)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DELIVERY */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-3xl">Delivery areas</h2>

        <ul className="mt-6 grid grid-cols-2 gap-3">
          {DELIVERY_AREAS.map((a) => (
            <li
              key={a.name}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="font-display text-lg">{a.name}</div>
              <div className="text-xs text-muted-foreground">
                {a.postcodes.join(" · ")}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
