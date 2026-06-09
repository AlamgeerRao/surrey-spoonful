import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Leaf, ShieldCheck, Truck } from "lucide-react";
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
          "Authentic homemade Pakistani food delivered across Surrey. Karahi, biryani, daal & sides.",
      },
      { property: "og:title", content: "ZAIQA — Homemade Pakistani Kitchen" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function getTodayName() {
  return new Date()
    .toLocaleDateString("en-GB", { weekday: "long" })
    .toLowerCase();
}

function HomePage() {
  const today = getTodayName();

  // ✅ Use local JSON menu
  const menu = menuData as any[];

  // ✅ Filter by availability
  const items = menu.filter(
    (item) =>
      item.available.includes("daily") ||
      item.available.includes(today)
  );

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroFeast}
            alt=""
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "var(--gradient-hero)" }}
          />
        </div>

        <div className="mx-auto flex min-h-[80svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24">
          <h1 className="font-display text-4xl text-white sm:text-6xl">
            ZAIQA — Homemade Pakistani Kitchen
          </h1>

          <p className="mt-4 text-white/90">
            Freshly cooked, home-style Pakistani meals delivered across Surrey.
          </p>

          <div className="mt-6">
            <Button asChild size="lg">
              <Link to="/menu">See full menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ✅ FULL MENU SECTION */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">
              Today’s menu
            </div>
            <h2 className="mt-1 font-display text-3xl sm:text-4xl">
              Fresh dishes available today
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((dish) => (
            <MealCard key={dish.id} item={dish} />
          ))}
        </div>

        {items.length === 0 && (
          <p className="mt-6 text-center text-muted-foreground">
            No dishes available today.
          </p>
        )}
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
