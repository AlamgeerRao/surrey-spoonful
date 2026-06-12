import { Link } from "@tanstack/react-router";


export function SiteFooter() {
  return (
    <footer className="mt-6 border-t border-border/60 bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="font-display text-xl text-foreground">
            ZAIQAS
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Homemade Pakistani Kitchen
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Authentic, slow-cooked Pakistani home food, made in a Surrey kitchen
            and delivered fresh to your door. Halal. Family recipes. No
            shortcuts.
          </p>
          <div
            className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: "color-mix(in oklab, var(--cardamom) 14%, transparent)",
              color: "var(--cardamom)",
            }}
          >
            <span aria-hidden>✦</span> 100% Halal certified
          </div>
        </div>
        
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Information
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-primary">About us</Link></li>
            <li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
            <li><Link to="/privacy" className="hover:text-primary">Privacy</Link></li>
            <li><Link to="/terms" className="hover:text-primary">Terms</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <span>© {new Date().getFullYear()} Zaiqas — Homemade Pakistani Kitchen. Made with love in Surrey.</span>
          <span>Allergen disclaimer: prepared in a kitchen handling nuts, dairy, gluten & sesame.</span>
        </div>
      </div>
    </footer>
  );
}
