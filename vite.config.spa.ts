// SPA-only Vite config for Azure Static Web Apps deployment.
// Bypasses @lovable.dev/vite-tanstack-config (which targets Cloudflare Worker SSR)
// and uses TanStack Start's raw plugin in SPA mode. Output: pure static dist/.
//
// Used by .github/workflows/azure-static-web-apps.yml via `vite build --config vite.config.spa.ts`.
// Lovable preview / production worker continues to use vite.config.ts (SSR).

import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: {
          enabled: true,
          outputPath: "/index.html",
          crawlLinks: true,
          retryCount: 1,
        },
      },
      // Default nitro target is node-server — works fine for prerender.
    }),
    viteReact(),
  ],
  build: {
    outDir: "dist",
  },
});
