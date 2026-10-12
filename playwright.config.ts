import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 180_000,
  expect: { timeout: 15_000 },
  // Shared Sanctum logins are rate-limited; keep one worker so suites do not throttle each other.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  // offer-loop may wait out Laravel login throttling once.
  globalTimeout: 20 * 60_000,
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "bash e2e/serve-api.sh",
      url: "http://127.0.0.1:8001/up",
      reuseExistingServer: false,
      timeout: 180_000,
    },
    {
      command: "npx next dev --port 3001",
      url: "http://localhost:3001",
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        E2E_NEXT: "1",
        NEXT_PUBLIC_API_URL: "http://localhost:8001",
        // Soft gate works on localhost (session cookie host ignores port).
        AUTH_SOFT_GATE: "1",
        SESSION_COOKIE_NAME: "zbritjasot-session",
      },
    },
  ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
