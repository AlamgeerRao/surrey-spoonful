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
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this. Ignored in SPA mode (no server runtime emitted).
    server: { entry: "server" },
    // When BUILD_TARGET=spa, prerender every route's shell into static HTML and ship
    // the rest client-side. Output is a normal Vite dist/ — works on Azure SWA, Netlify, S3, etc.
    ...(isSpa && {
      spa: {
        enabled: true,
        prerender: {
          enabled: true,
          outputPath: "/index.html",
          crawlLinks: true,
          retryCount: 1,
        },
      },
    }),
  },
});
