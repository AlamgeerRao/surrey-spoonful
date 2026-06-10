import { Link } from "@tanstack/react-router";
import { Flame, Leaf } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { priceFromPence, type Dish, type MenuItem } from "@/lib/menu-data";
import { addToCart, getSelectedDeliverySlot } from "@/lib/cart-store";

function Spice({ level }: { level: number }) {
  if (level === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Leaf className="h-3 w-3" /> Mild
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-xs">
      {Array.from({ length: 3 }).map((_, i) => (
        <Flame
          key={i}
          className={`h-3 w-3 ${
            i < level ? "text-primary" : "text-muted-foreground/40"
          }`}
          fill={i < level ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

type Props = { item: Dish | MenuItem };

function isDish(x: Dish | MenuItem): x is Dish {
  return Array.isArray((x as Dish).sizes);
}

function formatAvailableValue(value: unknown): string | null {
  if (Array.isArray(value)) {
    if (value.includes("daily")) return "Available daily";

    const days = value
      .map((d) => String(d))
      .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
      .join(", ");

    return days ? `Available: ${days}` : null;
  }

  return null;
}

export function MealCard({ item }: Props) {
  const dish = item;

  const fromPence = isDish(dish)
    ? priceFromPence(dish)
    : (dish as MenuItem).pricePence;

  const sizes = isDish(dish) ? dish.sizes : [];
  const hasMultipleSizes = sizes.length > 0;

  const [selectedSize, setSelectedSize] = useState("");

  const availabilityText = formatAvailableValue((dish as any).available);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5">
      {/* IMAGE */}
      <Link
        to="/menu/$slug"
        params={{ slug: dish.slug }}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <img
          src={dish.image}
          alt={dish.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {dish.popular && (
            <Badge className="bg-primary text-primary-foreground">
              Popular
            </Badge>
          )}

          {dish.weeklySpecial && (
            <Badge variant="secondary">This week</Badge>
          )}

          {dish.halal && (
            <Badge className="bg-white/85 text-foreground backdrop-blur">
              Halal
            </Badge>
          )}
        </div>
      </Link>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* TITLE + PRICE */}
        <div className="flex items-start justify-between gap-2">
          <Link to="/menu/$slug" params={{ slug: dish.slug }}>
            <h3 className="font-display text-lg text-foreground hover:text-primary">
              {dish.name}
            </h3>
          </Link>

          <div className="text-right font-display text-lg text-foreground whitespace-nowrap">
            {hasMultipleSizes
              ? `from ${formatPrice(fromPence)}`
              : formatPrice(fromPence)}
          </div>
        </div>

        {/* DESCRIPTION */}
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
          {dish.description}
        </p>

        {/* SIZE SELECTOR */}
        {hasMultipleSizes && (
          <select
            className="w-full rounded border p-2 text-sm"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
          >
            <option value="">Select size</option>
            {sizes.map((s: any) => (
              <option key={s.id} value={s.label}>
                {s.label} - £{(s.pricePence / 100).toFixed(2)}
              </option>
            ))}
          </select>
        )}

        {/* AVAILABILITY */}
        {availabilityText && (
          <div className="pt-1">
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
              {availabilityText}
            </span>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-auto flex items-center justify-between pt-3">
          <Spice level={dish.spice} />

          <Button
            size="sm"
            disabled={hasMultipleSizes && !selectedSize}
            onClick={() => {
              const slot = getSelectedDeliverySlot();

              // ✅ BLOCK if no slot
              if (!slot) {
                alert("Please select a delivery slot first.");
                return;
              }

              const selected = sizes.find(
                (s: any) => s.label === selectedSize
              );

              addToCart({
                id: dish.id,
                name: dish.name,
                size: selected?.label || "standard",
                pricePence: selected?.pricePence || fromPence || 0,
                quantity: 1,
              });
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}
