import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Flame, Leaf, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBasket } from "@/lib/basket";
import { formatPrice } from "@/lib/format";
import { getDish, type Dish } from "@/lib/menu-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/menu/$slug")({
  loader: ({ params }): { dish: Dish } => {
    const dish = getDish(params.slug);
    if (!dish) throw notFound();
    return { dish };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.dish.name} — Homemade Pakistani Kitchen, Surrey` },
          { name: "description", content: loaderData.dish.description },
          { property: "og:title", content: loaderData.dish.name },
          { property: "og:description", content: loaderData.dish.description },
          { property: "og:image", content: loaderData.dish.image },
          { property: "og:type", content: "product" },
        ]
      : [],
    links: loaderData ? [{ rel: "canonical", href: `/menu/${loaderData.dish.slug}` }] : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-3xl">Dish not found</h1>
      <Button asChild className="mt-6"><Link to="/menu">See menu</Link></Button>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-2xl">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      <Button onClick={reset} className="mt-6">Try again</Button>
    </div>
  ),
  component: MealPage,
});

function MealPage() {
  const { dish } = Route.useLoaderData() as { dish: Dish };
  const { add } = useBasket();
  const [sizeId, setSizeId] = useState(dish.sizes[0].id);
  const [qty, setQty] = useState(1);
  const size = useMemo(() => dish.sizes.find((s) => s.id === sizeId) ?? dish.sizes[0], [dish, sizeId]);
  const variantId = `${dish.id}-${size.id}`;

  return (
    <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link to="/menu" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <img src={dish.image} alt={dish.name} width={1200} height={900}
               className="aspect-[4/3] h-full w-full object-cover" />
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {dish.popular && <Badge>Popular</Badge>}
            {dish.weeklySpecial && <Badge variant="secondary">This week</Badge>}
            {dish.halal && <Badge variant="outline">Halal</Badge>}
          </div>
          <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">{dish.name}</h1>
          <div className="mt-2 font-display text-2xl text-primary">{formatPrice(size.pricePence)}</div>

          <p className="mt-5 text-foreground/85">{dish.longDescription}</p>

          {/* Size selector */}
          <div className="mt-6">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Choose size</div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {dish.sizes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSizeId(s.id)}
                  className={cn(
                    "rounded-xl border p-3 text-left text-sm transition-colors",
                    sizeId === s.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-secondary",
                  )}
                >
                  <div className="font-medium text-foreground">{s.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{formatPrice(s.pricePence)}</div>
                </button>
              ))}
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <Meta label="Spice">
              {dish.spice === 0 ? (
                <span className="inline-flex items-center gap-1"><Leaf className="h-3.5 w-3.5" /> Mild</span>
              ) : (
                <span className="inline-flex items-center gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Flame key={i}
                      className={`h-4 w-4 ${i < dish.spice ? "text-primary" : "text-muted-foreground/30"}`}
                      fill={i < dish.spice ? "currentColor" : "none"} />
                  ))}
                </span>
              )}
            </Meta>
            <Meta label="Allergens">{dish.allergens.length ? dish.allergens.join(", ") : "None declared"}</Meta>
            <Meta label="Halal">{dish.halal ? "Yes" : "No"}</Meta>
            <Meta label="Category">{dish.category}</Meta>
          </dl>

          <div className="mt-8 flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border bg-card">
              <Button variant="ghost" size="icon" aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
              <Button variant="ghost" size="icon" aria-label="Increase" onClick={() => setQty((q) => Math.min(20, q + 1))}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button size="lg" className="flex-1 rounded-full"
              onClick={() => { add(variantId, qty); toast.success(`Added ${qty} × ${dish.name} (${size.label})`); }}>
              Add to basket · {formatPrice(size.pricePence * qty)}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-foreground">{children}</dd>
    </div>
  );
}
