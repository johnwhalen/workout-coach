import { test, expect } from "@playwright/test";

/**
 * Metrics/Dashboard E2E Tests - Unauthenticated
 *
 * Tests the dashboard for unauthenticated users.
 * For authenticated tests, see metrics.authenticated.spec.ts
 */

test.describe("Metrics - Unauthenticated", () => {
  test("redirects to login when accessing metrics", async ({ page }) => {
    await page.goto("/metrics");

    // Should redirect to login
    await expect(page).toHaveURL(/login|sign-in/);
  });

  test("shows login form after redirect from metrics", async ({ page }) => {
    await page.goto("/metrics");

    // Should show Clerk sign-in
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible({
      timeout: 10000,
    });
  });
});
