import { defineConfig, devices } from "@playwright/test";

// E2E sits at the top of the testing trophy: a thin smoke layer, run via
// `pnpm -F web test:e2e` (not part of the default `turbo test` pipeline).
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "vp dev",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
  },
});
