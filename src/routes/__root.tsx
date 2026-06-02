import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BasketProvider } from "@/lib/basket";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import { CookieBanner } from "@/components/site/cookie-banner";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Homemade Pakistani Kitchen — Authentic Halal Home Food, Surrey" },
      {
        name: "description",
        content:
          "Authentic Pakistani home cooking, made in Surrey and delivered fresh to Byfleet, West Byfleet, Woking & Weybridge. Halal. Family recipes.",
      },
      { name: "author", content: "Homemade Pakistani Kitchen" },
      { property: "og:title", content: "Homemade Pakistani Kitchen — Authentic Halal Home Food, Surrey" },
      {
        property: "og:description",
        content:
          "Halal Pakistani home food, delivered fresh to Byfleet, West Byfleet, Woking and Weybridge.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Homemade Pakistani Kitchen" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#c2563b" },
      { name: "twitter:title", content: "Homemade Pakistani Kitchen — Authentic Halal Home Food, Surrey" },
      { name: "description", content: "Surrey Spice Hub is a mobile-first UK food ordering website for authentic Pakistani/Asian homemade meals." },
      { property: "og:description", content: "Surrey Spice Hub is a mobile-first UK food ordering website for authentic Pakistani/Asian homemade meals." },
      { name: "twitter:description", content: "Surrey Spice Hub is a mobile-first UK food ordering website for authentic Pakistani/Asian homemade meals." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7d7a6092-9c14-4ca2-8ea3-4246fec04944/id-preview-df8ef32b--e05e4a4e-d53d-40d2-ad28-61a69e289da4.lovable.app-1780358659123.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7d7a6092-9c14-4ca2-8ea3-4246fec04944/id-preview-df8ef32b--e05e4a4e-d53d-40d2-ad28-61a69e289da4.lovable.app-1780358659123.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Restaurant",
          name: "Homemade Pakistani Kitchen",
          servesCuisine: ["Pakistani", "South Asian", "Halal"],
          areaServed: ["Byfleet", "West Byfleet", "Woking", "Weybridge", "Surrey"],
          priceRange: "££",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <BasketProvider>
        <div className="flex min-h-screen flex-col bg-background">
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <WhatsAppFab />
        <CookieBanner />
        <Toaster richColors position="top-center" />
      </BasketProvider>
    </QueryClientProvider>
  );
}
