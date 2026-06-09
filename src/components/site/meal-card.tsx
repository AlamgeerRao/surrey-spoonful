import { Flame, Leaf } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { priceFromPence, type Dish, type MenuItem } from "@/lib/menu-data";
import { addToCart } from "@/lib/cart-store";

function Spice({ level }: { level: number }) {
  if (level === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Leaf className="h-3 w-3" /> Mild
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs"
      aria-label={`Spice level ${level} of 3`}
    >
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

export function MealCard({ item }: Props) {
  const dish = item;

  const fromPence = isDish(dish)
    ? priceFromPence(dish)
    : (dish as MenuItem).pricePence;

  const sizes = isDish(dish) ? dish.sizes : [];
  const hasMultipleSizes = sizes.length > 0;

  const [selectedSize, setSelectedSize] = useState("");

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5">
      {/* IMAGE */}
      <div className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          loading="lazy"
          width={800}
          height={600}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {dish.popular && (
            <Badge className="bg-primary text-primary-foreground">
              Popular
            </Badge>
          )}

          {dish.weeklySpecial && (
            <Badge
              variant="secondary"
              className="bg-secondary text-secondary-foreground"
            >
              This week
            </Badge>
          )}

          {dish.halal && (
            <Badge
              variant="outline"
              className="border-transparent bg-white/85 text-foreground backdrop-blur"
            >
              Halal
            </Badge>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* TITLE + PRICE */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg text-foreground">
              {dish.name}
            </h3>
          </div>

          <div className="text-right">
            <div className="font-display text-lg text-foreground">
              {hasMultipleSizes
                ? `from ${formatPrice(fromPence)}`
                : formatPrice(fromPence)}
            </div>
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">
          {dish.description}
        </p>

        {/* SIZE SELECTOR */}
        {hasMultipleSizes && (
          <div className="mt-2">
            <select
              className="w-full rounded border p-2 text-sm"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="">Select size</option>
              {sizes.map((s: any) => (
                <option key={s.label} value={s.label}>
                  {s.label} - £{(s.pricePence / 100).toFixed(2)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* FOOTER */}
        <div className="mt-auto flex items-center justify-between pt-2">
          <Spice level={dish.spice} />

          {hasMultipleSizes ? (
            <Button
              size="sm"
              disabled={!selectedSize}
              onClick={() => {
                if (!selectedSize) return;

                const selected = sizes.find(
                  (s: any) => s.label === selectedSize
                );

                if (!selected) return;

                addToCart({
                  id: dish.id,
                  name: dish.name,
                  size: selected.label,
                  pricePence: selected.pricePence,
                  quantity: 1,
                });

                console.log("ADDED:", dish.name, selected.label);
              }}
            >
              Add
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                addToCart({
                  id: dish.id,
                  name: dish.name,
                  size: "standard",
                  pricePence: fromPence || 0,
                  quantity: 1,
                });

                console.log("ADDED:", dish.name);
              }}
            >
              Add
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
