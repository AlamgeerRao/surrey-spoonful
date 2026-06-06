import { Link } from "@tanstack/react-router";
import { ArrowRight, Flame, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { priceFromPence, type Dish, type MenuItem } from "@/lib/menu-data";

function Spice({ level }: { level: number }) {
  if (level === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Leaf className="h-3 w-3" /> Mild
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs" aria-label={`Spice level ${level} of 3`}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Flame
          key={i}
          className={`h-3 w-3 ${i < level ? "text-primary" : "text-muted-foreground/40"}`}
          fill={i < level ? "currentColor" : "none"}
        />
      ))}
    </span>
  );
}

// Accept either a Dish (preferred) or a MenuItem (legacy callers). When a
// MenuItem is passed we render its single price; for a Dish we render
// "from £X" because the user must pick a size on the detail page.
type Props = { item: Dish | MenuItem };

function isDish(x: Dish | MenuItem): x is Dish {
  return Array.isArray((x as Dish).sizes);
}

export function MealCard({ item }: Props) {
  const dish = item;
  const fromPence = isDish(dish) ? priceFromPence(dish) : (dish as MenuItem).pricePence;
  const sizesCount = isDish(dish) ? dish.sizes.length : 1;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5">
      <Link to="/menu/$slug" params={{ slug: dish.slug }} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={dish.image}
          alt={dish.name}
          loading="lazy"
          width={800}
          height={600}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {dish.popular && <Badge className="bg-primary text-primary-foreground">Popular</Badge>}
          {dish.weeklySpecial && (
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">This week</Badge>
          )}
          {dish.halal && (
            <Badge variant="outline" className="border-transparent bg-white/85 text-foreground backdrop-blur">
              Halal
            </Badge>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to="/menu/$slug" params={{ slug: dish.slug }}>
            <h3 className="font-display text-lg text-foreground hover:text-primary">{dish.name}</h3>
          </Link>
          <div className="text-right">
            <div className="font-display text-lg text-foreground">
              {sizesCount > 1 ? `from ${formatPrice(fromPence)}` : formatPrice(fromPence)}
            </div>
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{dish.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <Spice level={dish.spice} />
          <Button asChild size="sm">
            <Link to="/menu/$slug" params={{ slug: dish.slug }}>
              Choose size <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
