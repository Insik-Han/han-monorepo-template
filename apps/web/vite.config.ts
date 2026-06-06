import { lingui } from "@lingui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";
import babel from "@rolldown/plugin-babel";

// The Start plugin generates the SPA shell and server bundles; it gets in
// the way of the Vitest transform, so it is skipped under `vp test`
// (Vitest sets VITEST before the config loads).
const isTest = Boolean(process.env.VITEST);

export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    // Route code splitting (autoCodeSplitting) is enabled by default in Start.
    ...(isTest
      ? []
      : [
          tanstackStart({
            spa: {
              enabled: true,
              // Emit the SPA shell as index.html so Cloudflare Pages' default
              // single-page-app fallback serves it for every non-asset route.
              prerender: {
                outputPath: "/index.html",
              },
            },
          }),
        ]),
    react(),
    babel({
      presets: [reactCompilerPreset()],
      plugins: ["@lingui/babel-plugin-lingui-macro"],
    }),
    lingui(),
  ],
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
