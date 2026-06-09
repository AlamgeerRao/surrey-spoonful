import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MealCard } from "@/components/site/meal-card";
import { CATEGORIES, type Category, type MenuItem } from "@/lib/menu-data";
import { cn } from "@/lib/utils";
import menuData from "@/data/menu.json";

export const Route = createFileRoute("/menu")({
  staticData: {
    prerender: false, // ✅ FIX GitHub error
  },
  head: () => ({
    meta: [
      {
        title:
          "Menu — ZAIQA | Homemade Pakistani Kitchen in Byfleet, Woking, Weybridge | Surrey",
      },
      {
        name: "description",
        content:
          "Karahi, biryani, daal and sides — cooked fresh in Surrey and delivered to Byfleet, West Byfleet, Woking and Weybridge.",
      },
      { property: "og:title", content: "Menu — ZAIQA" },
      { property: "og:url", content: "/menu" },
    ],
    links: [{ rel: "canonical", href: "/menu" }],
  }),
  component: MenuPage,
});

function getTodayName() {
  return new Date()
    .toLocaleDateString("en-GB", { weekday: "long" })
    .toLowerCase();
}

function formatAvailableDays(days: string[]) {
  return days.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(", ");
}

function MenuPage() {
  const [active, setActive] = useState<Category | "all">("all");

  const today = getTodayName();

  // ✅ Load from local JSON (NO Cosmos)
  const items = menuData as MenuItem[];

  // ✅ Apply availability filtering
  const availableItems = items.filter((item: any) => {
    return (
      item.available.includes("daily") ||
      item.available.includes(today)
    );
  });

  // ✅ Category filter
  const filtered =
    active === "all"
      ? availableItems
      : availableItems.filter((m) => m.category === active);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">
          Today&apos;s menu
        </div>

        <h1 className="mt-1 font-display text-4xl text-foreground sm:text-5xl">
          ZAIQA — Homemade Pakistani Kitchen
        </h1>

        <p className="mt-3 max-w-xl text-muted-foreground">
          Cooked fresh in Surrey. Tap a category to filter.
        </p>
      </header>

      <div className="sticky top-16 z-30 -mx-4 mb-8 overflow-x-auto border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex gap-2">
          <CatPill
            label="All"
            active={active === "all"}
            onClick={() => setActive("all")}
          />

          {CATEGORIES.map((c) => (
            <CatPill
              key={c.id}
              label={c.label}
              active={active === c.id}
              onClick={() => setActive(c.id)}
            />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="font-display text-2xl text-foreground">
            No dishes available today
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try another day.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((dish: any) => {
            const firstSize = dish.sizes[0];

            const item: MenuItem = {
              ...dish,
              id: `${dish.id}-${firstSize.id}`,
              dishId: dish.id,
              dishSlug: dish.slug,
              sizeId: firstSize.id,
              sizeLabel: firstSize.label,
              pricePence: firstSize.pricePence,
              portion: firstSize.label,
            };

            return (
              <div key={dish.id} className="space-y-2">
                {!dish.available.includes("daily") && (
                  <div className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
                    Available: {formatAvailableDays(dish.available)}
                  </div>
                )}

                <MealCard item={item} />
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-12 rounded-2xl bg-secondary p-4 text-xs text-secondary-foreground">
        <strong>Allergen note:</strong> may contain nuts, dairy, gluten, sesame.
      </p>
    </div>
  );
}

function CatPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-1.5 text-sm",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground"
      )}
    >
      {label}
    </button>
  );
}
