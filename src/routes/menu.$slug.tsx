import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Flame, Leaf, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBasket } from "@/lib/basket";
import { formatPrice } from "@/lib/format";
import { getMenuItem } from "@/lib/menu-data";
import { toast } from "sonner";

export const Route = createFileRoute("/menu/$slug")({
  loader: ({ params }) => {
    const item = getMenuItem(params.slug);
    if (!item) throw notFound();
    return { item };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.item.name} — Homemade Pakistani Kitchen` },
          { name: "description", content: loaderData.item.description },
          { property: "og:title", content: loaderData.item.name },
          { property: "og:description", content: loaderData.item.description },
          { property: "og:image", content: loaderData.item.image },
          { property: "og:type", content: "product" },
        ]
      : [],
    links: loaderData
      ? [{ rel: "canonical", href: `/menu/${loaderData.item.slug}` }]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-3xl">Dish not found</h1>
      <p className="mt-3 text-muted-foreground">
        Maybe it's off the menu today. Take a look at what we're cooking.
      </p>
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
  const { item } = Route.useLoaderData();
  const { add } = useBasket();
  const [qty, setQty] = useState(1);

  return (
    <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Link to="/menu" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to menu
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          <img
            src={item.image}
            alt={item.name}
            width={1200}
            height={900}
            className="aspect-[4/3] h-full w-full object-cover"
          />
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {item.popular && <Badge>Popular</Badge>}
            {item.weeklySpecial && <Badge variant="secondary">This week</Badge>}
            {item.halal && <Badge variant="outline">Halal</Badge>}
          </div>
          <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">{item.name}</h1>
          <div className="mt-2 font-display text-2xl text-primary">{formatPrice(item.pricePence)}</div>

          <p className="mt-5 text-foreground/85">{item.longDescription}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <Meta label="Portion">{item.portion}</Meta>
            <Meta label="Spice">
              {item.spice === 0 ? (
                <span className="inline-flex items-center gap-1"><Leaf className="h-3.5 w-3.5" /> Mild</span>
              ) : (
                <span className="inline-flex items-center gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Flame
                      key={i}
                      className={`h-4 w-4 ${i < item.spice ? "text-primary" : "text-muted-foreground/30"}`}
                      fill={i < item.spice ? "currentColor" : "none"}
                    />
                  ))}
                </span>
              )}
            </Meta>
            <Meta label="Allergens">
              {item.allergens.length ? item.allergens.join(", ") : "None declared"}
            </Meta>
            <Meta label="Halal">{item.halal ? "Yes" : "No"}</Meta>
          </dl>

          <div className="mt-8 flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border bg-card">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => Math.min(20, q + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              size="lg"
              className="flex-1 rounded-full"
              onClick={() => {
                add(item.id, qty);
                toast.success(`Added ${qty} × ${item.name}`);
              }}
            >
              Add to basket · {formatPrice(item.pricePence * qty)}
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
