import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "hpk.cookie.v1";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  const choose = (value: "accepted" | "rejected") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:left-3 sm:max-w-md">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
        <p className="text-sm text-foreground">
          We use a few essential cookies to keep your basket and checkout
          working. With your consent, we'll also use analytics to improve the
          site.
        </p>
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => choose("accepted")}>Accept all</Button>
          <Button size="sm" variant="outline" onClick={() => choose("rejected")}>
            Essential only
          </Button>
        </div>
      </div>
    </div>
  );
}
