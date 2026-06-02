// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// SPA mode is enabled when BUILD_TARGET=spa (used by Azure Static Web Apps GitHub Action).
// In Lovable's preview / production worker, BUILD_TARGET is unset and SSR runs as normal.
const isSpa = process.env.BUILD_TARGET === "spa";

export default defineConfig({
  tanstackStart: isSpa
    ? {
        // SPA mode: emit a single index.html shell + client bundle. Routes resolve
        // client-side; Azure SWA's navigationFallback rewrites all deep links to index.html.
        // Per-route <head> meta is applied client-side (Google renders JS; sufficient for SEO).
        spa: {
          enabled: true,
          prerender: { enabled: false, outputPath: "/index.html", crawlLinks: false, retryCount: 0 },
        },
      }
    : {
        // SSR mode (Lovable preview / Cloudflare Worker): custom server entry with error wrapper.
        server: { entry: "server" },
      },
});
