import { meals } from "@/data/meals";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MealCard } from "@/components/site/meal-card";
import { MENU, CATEGORIES, type Category } from "@/lib/menu-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Pakistani home food in Surrey | Homemade Pakistani Kitchen" },
      {
        name: "description",
        content:
          "Curries, biryani, BBQ, vegetarian, desserts and chai — cooked fresh in Surrey. Delivered to Byfleet, West Byfleet, Woking, Weybridge.",
      },
      { property: "og:title", content: "Menu — Homemade Pakistani Kitchen" },
      { property: "og:url", content: "/menu" },
    ],
    links: [{ rel: "canonical", href: "/menu" }],
  }),
  component: MenuPage,
});

function MenuPage() {
  const [active, setActive] = useState<Category | "all">("all");
  const items = active === "all" ? MENU : MENU.filter((m) => m.category === active);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-primary">Today's menu</div>
        <h1 className="mt-1 font-display text-4xl text-foreground sm:text-5xl">
          The kitchen, today.
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Cooked in small batches and delivered fresh. Tap a category to filter.
        </p>
      </header>

      <div className="sticky top-16 z-30 -mx-4 mb-8 overflow-x-auto border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex gap-2">
          <CatPill label="All" active={active === "all"} onClick={() => setActive("all")} />
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

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((m) => (
          <MealCard key={m.id} item={m} />
        ))}
      </div>

      <p className="mt-12 rounded-2xl bg-secondary p-4 text-xs text-secondary-foreground">
        <strong>Allergen note:</strong> our food is prepared in a kitchen that
        also handles nuts, dairy, gluten and sesame. If you have allergies,
        please mention them in order notes and we'll do our best.
      </p>
    </div>
  );
}

function CatPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-secondary",
      )}
    >
      {label}
    </button>
  );
}
