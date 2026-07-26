// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    // The v0 preview proxy serves the app from DEV_PORT (5173). The Lovable
    // config otherwise defaults the dev server to 8080, which the preview
    // proxy cannot reach — resulting in a 502. Bind to DEV_PORT so the preview
    // can reach the dev server.
    server: {
      host: true,
      port: Number(process.env.DEV_PORT) || 5173,
    },
  },
});
