import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, Menu as MenuIcon, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBasket } from "@/lib/basket";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
] as const;

export function SiteHeader() {
  const { count } = useBasket();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span
            className="grid h-9 w-9 place-items-center rounded-full text-primary-foreground"
            style={{ background: "var(--gradient-warm)" }}
            aria-hidden
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
                    : "text-foreground/80 hover:bg-secondary/60",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="relative">
            <Link to="/basket" aria-label="Basket">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <Badge
                  className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-primary p-0 px-1 text-[10px] text-primary-foreground"
                  aria-label={`${count} items in basket`}
                >
                  {count}
                </Badge>
              )}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>
        </div>
      </div>

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
          </nav>
        </div>
      )}
    </header>
  );
}
