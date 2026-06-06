import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Leaf, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MealCard } from "@/components/site/meal-card";
import { getPopular, getWeeklySpecials } from "@/lib/menu-data";
import { DELIVERY_AREAS, DELIVERY_FEE_PENCE } from "@/lib/delivery";
import { formatPrice } from "@/lib/format";
import heroFeast from "@/assets/hero-feast.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Homemade Pakistani Food, Surrey — Halal delivery in Byfleet, Woking & Weybridge" },
      {
        name: "description",
        content:
          "Order authentic Homemade Pakistani Food delivered fresh across Surrey — Byfleet, West Byfleet, Woking and Weybridge. Halal karahi, biryani, daal & sides.",
      },
      { property: "og:title", content: "Homemade Pakistani Food — Surrey" },
      {
        property: "og:description",
        content: "Halal Pakistani home cooking, delivered in Byfleet, West Byfleet, Woking and Weybridge.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const popular = getPopular();
  const specials = getWeeklySpecials();

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroFeast}
            alt=""
            width={1920}
            height={1080}
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: "var(--gradient-hero)" }}
          />
          <div className="absolute inset-0 bg-clove/40 mix-blend-multiply" />
        </div>

        <div className="mx-auto flex min-h-[80svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24">
          <div
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/90 backdrop-blur"
          >
            <span aria-hidden>✦</span> Halal · Made in Surrey
          </div>
          <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.05] text-white sm:text-6xl md:text-7xl">
            Home-cooked Pakistani food, delivered with love.
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
            Karahi from a real kadhai. Biryani on dum. Daal that took a day to
            make. Bringing our family kitchen to {" "}
            <span className="underline decoration-saffron decoration-2 underline-offset-4">
              Byfleet, West Byfleet, Woking & Weybridge
            </span>
            .
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link to="/menu">
                See today's menu <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-white/40 bg-white/10 px-6 text-white backdrop-blur hover:bg-white/20 hover:text-white"
            >
              <Link to="/about">Our story</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm sm:grid-cols-2 sm:px-6 md:grid-cols-4">
          <Feature icon={<ShieldCheck className="h-5 w-5" />} title="100% Halal" body="Certified meat, ethical sourcing." />
          <Feature icon={<Truck className="h-5 w-5" />} title={`${formatPrice(DELIVERY_FEE_PENCE)} delivery`} body="Across our Surrey delivery zones." />
          <Feature icon={<Clock className="h-5 w-5" />} title="Lunch & dinner" body="Order at least 2 hrs before your slot." />
          <Feature icon={<Leaf className="h-5 w-5" />} title="Made fresh daily" body="No shortcuts, never frozen." />
        </div>
      </section>

      {/* POPULAR */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">Most loved</div>
            <h2 className="mt-1 font-display text-3xl text-foreground sm:text-4xl">Popular this week</h2>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link to="/menu">Full menu <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((m) => (
            <MealCard key={m.id} item={m} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/menu">See full menu</Link>
          </Button>
        </div>
      </section>

      {/* WEEKLY SPECIALS */}
      {specials.length > 0 && (
        <section
          className="relative overflow-hidden border-y border-border"
          style={{ background: "color-mix(in oklab, var(--saffron) 14%, var(--background))" }}
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-[0.2em] text-primary">This week's specials</div>
              <h2 className="mt-1 font-display text-3xl text-foreground sm:text-4xl">
                From our kitchen, just for this week.
              </h2>
              <p className="mt-3 text-muted-foreground">
                A short rotating menu of dishes we cook only when the
                ingredients are right. Available while stocks last.
              </p>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {specials.map((m) => (
                <MealCard key={m.id} item={m} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DELIVERY ZONES */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary">Delivery</div>
            <h2 className="mt-1 font-display text-3xl text-foreground sm:text-4xl">
              We bring it straight to your door.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Flat {formatPrice(DELIVERY_FEE_PENCE)} delivery across our zones.
              Two slots a day — Lunch (11:30–14:30) and Dinner (16:30–19:30).
              Place orders at least <strong className="text-foreground">2 hours</strong> before your slot.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/menu">Start an order</Link>
            </Button>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {DELIVERY_AREAS.map((a) => (
              <li
                key={a.name}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="font-display text-lg text-foreground">{a.name}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {a.postcodes.join(" · ")}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mb-4 max-w-6xl px-4 sm:px-6">
        <div
          className="overflow-hidden rounded-3xl px-6 py-10 text-center sm:px-12 sm:py-14"
          style={{
            background: "var(--gradient-warm)",
            boxShadow: "var(--shadow-warm)",
          }}
        >
          <h2 className="font-display text-3xl text-primary-foreground sm:text-4xl">
            Hungry? Let's eat.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-primary-foreground/90">
            Slow-cooked Pakistani classics, in your kitchen tonight.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="mt-6 rounded-full bg-background px-6 text-foreground hover:bg-background/90"
          >
            <Link to="/menu">Order now</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary"
        style={{ background: "color-mix(in oklab, var(--primary) 12%, transparent)" }}
        aria-hidden
      >
        {icon}
      </div>
      <div>
        <div className="font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{body}</div>
      </div>
    </div>
  );
}
