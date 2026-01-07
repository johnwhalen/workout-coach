import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration with Clerk Integration
 *
 * This config supports both unauthenticated and authenticated tests:
 * - "global setup" runs first to get Clerk testing tokens
 * - "auth setup" signs in and saves session state (requires E2E_CLERK_USER_* env vars)
 * - Regular tests run without auth
 * - Authenticated tests use saved auth state
 *
 * Set E2E_BASE_URL to test against a deployed environment:
 *   E2E_BASE_URL=https://workout-coach-lyart.vercel.app npx playwright test
 *
 * @see https://clerk.com/docs/testing/playwright/overview
 */

const authFile = "./tests/e2e/.clerk/user.json";

// Use Vercel URL if E2E_BASE_URL is set, otherwise localhost
const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";
const isLocalhost = baseURL.includes("localhost");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  reporter: "html",
  timeout: 60000, // Longer timeout for Vercel cold starts
  expect: {
    timeout: 15000,
  },
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    actionTimeout: 20000,
    navigationTimeout: 45000, // Longer for Vercel cold starts
  },
  projects: [
    // Setup projects - run first
    {
      name: "global setup",
      testMatch: /global\.setup\.ts/,
    },
    {
      name: "auth setup",
      testMatch: /auth\.setup\.ts/,
      dependencies: ["global setup"],
    },

    // Unauthenticated tests - run after global setup (for Clerk testing token)
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["global setup"],
      testIgnore: /\.authenticated\.spec\.ts/,
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
      dependencies: ["global setup"],
      testIgnore: /\.authenticated\.spec\.ts/,
    },

    // Authenticated tests - run after auth setup, use saved session
    {
      name: "chromium-authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
      dependencies: ["auth setup"],
      testMatch: /\.authenticated\.spec\.ts/,
    },
    {
      name: "Mobile Chrome-authenticated",
      use: {
        ...devices["Pixel 5"],
        storageState: authFile,
      },
      dependencies: ["auth setup"],
      testMatch: /\.authenticated\.spec\.ts/,
    },

    // Uncomment these if you have Firefox/WebKit installed:
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    //   dependencies: ["global setup"],
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    //   dependencies: ["global setup"],
    // },
  ],
  // Only start dev server when testing locally
  ...(isLocalhost
    ? {
        webServer: {
          command: "npm run dev",
          url: "http://localhost:3000",
          reuseExistingServer: !process.env.CI,
          timeout: 120 * 1000,
        },
      }
    : {}),
});
