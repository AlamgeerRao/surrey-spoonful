import { Link } from "@tanstack/react-router";
import { Flame, Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBasket } from "@/lib/basket";
import { formatPrice } from "@/lib/format";
import type { MenuItem } from "@/lib/menu-data";
import { toast } from "sonner";

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

export function MealCard({ item }: { item: MenuItem }) {
  const { add } = useBasket();
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5">
      <Link to="/menu/$slug" params={{ slug: item.slug }} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          width={800}
          height={600}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {item.popular && (
            <Badge className="bg-primary text-primary-foreground">Popular</Badge>
          )}
          {item.weeklySpecial && (
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              This week
            </Badge>
          )}
          {item.halal && (
            <Badge
              variant="outline"
              className="border-transparent bg-white/85 text-foreground backdrop-blur"
            >
              Halal
            </Badge>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to="/menu/$slug" params={{ slug: item.slug }}>
            <h3 className="font-display text-lg text-foreground hover:text-primary">
              {item.name}
            </h3>
          </Link>
          <div className="text-right">
            <div className="font-display text-lg text-foreground">
              {formatPrice(item.pricePence)}
            </div>
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <Spice level={item.spice} />
            <span className="text-xs text-muted-foreground">{item.portion}</span>
          </div>
          <Button
            size="sm"
            onClick={() => {
              add(item.id);
              toast.success(`Added ${item.name} to basket`);
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}
