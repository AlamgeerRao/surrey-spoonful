import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBasket, Menu as MenuIcon, X, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  getCart,
  subscribe,
  getCartDateLabel,
} from "@/lib/cart-store";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/", label: "Menu" }, // ✅ point to homepage
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [cartDateLabel, setCartDateLabel] = useState("");

  const path = useRouterState({
    select: (s) => s.location.pathname,
  });

  // ✅ Sync cart + date badge
  useEffect(() => {
    const update = () => {
      const cart = getCart();

      const total = cart.reduce(
        (sum, i) => sum + i.quantity,
        0
      );

      setCount(total);
      setCartDateLabel(getCartDateLabel());
    };

    update(); // initial load

    return subscribe(update);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* ✅ LOGO */}
        <Link
          to="/"
          className="flex items-center gap-2"
          onClick={() => setOpen(false)}
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-full text-primary-foreground"
            style={{ background: "var(--gradient-warm)" }}
          >
            <span className="font-display text-lg leading-none">H</span>
          </span>

          <span className="flex flex-col leading-tight">
            <span className="font-display text-base text-foreground">
              Homemade Pakistani Kitchen
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Surrey · Halal · Home-cooked
            </span>
          </span>
        </Link>

        {/* ✅ NAV */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = path === n.to;

            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-foreground/80 hover:bg-secondary/60"
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* ✅ RIGHT SIDE */}
        <div className="flex items-center gap-3">

          {/* ✅ DELIVERY DATE BADGE */}
          {cartDateLabel && (
            <div className="hidden sm:flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
              <Calendar className="h-3 w-3" />
              <span>{cartDateLabel}</span>
            </div>
          )}

          {/* ✅ BASKET */}
          <Link to="/basket" className="relative">
            <ShoppingBasket className="h-6 w-6 text-foreground" />

            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white">
                {count}
              </span>
            )}
          </Link>

          {/* ✅ MOBILE MENU BUTTON */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* ✅ MOBILE NAV */}
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-base text-foreground hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}

            {/* ✅ MOBILE DATE BADGE */}
            {cartDateLabel && (
              <div className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Delivery: {cartDateLabel}
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
