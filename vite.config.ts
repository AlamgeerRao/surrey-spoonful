import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "server", // uses src/server.ts if present
    },
  },

  vite: {
    build: {
      target: "esnext",
    },

    // ✅ helps avoid some route plugin edge cases
    optimizeDeps: {
      include: [],
    },
  },
});
