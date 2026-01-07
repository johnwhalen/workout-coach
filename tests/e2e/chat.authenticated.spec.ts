import { test, expect } from "@playwright/test";

/**
 * Authenticated Chat E2E Tests
 *
 * These tests run with a pre-authenticated session from auth.setup.ts.
 * The storageState from .clerk/user.json is automatically loaded.
 *
 * To enable these tests:
 * 1. Create a test user in your Clerk dashboard
 * 2. Add E2E_CLERK_USER_EMAIL and E2E_CLERK_USER_PASSWORD to .env.local
 * 3. Run: npx playwright test
 *
 * @see https://clerk.com/docs/testing/playwright/test-authenticated-flows
 */

test.describe("Chat - Authenticated", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/chat");
  });

  test("displays chat interface without redirect", async ({ page }) => {
    // Should stay on /chat (not redirect to login)
    await expect(page).toHaveURL("/chat");

    // Chat header should be visible
    await expect(page.getByRole("heading", { name: "Golden Harbor", exact: true })).toBeVisible();
  });

  test("displays welcome message", async ({ page }) => {
    // Welcome message should appear
    await expect(page.getByText(/Welcome to.*Golden Harbor/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("has chat input ready for use", async ({ page }) => {
    const input = page.getByPlaceholder("Type your message...");

    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    // Should be able to type
    await input.fill("Test message");
    await expect(input).toHaveValue("Test message");
  });

  test("has dashboard link", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Dashboard/i })).toBeVisible();
  });

  test("can send a message", async ({ page }) => {
    const input = page.getByPlaceholder("Type your message...");

    await input.fill("Hello coach!");

    // Click send or press Enter
    await input.press("Enter");

    // Should show the user message
    await expect(page.getByText("Hello coach!")).toBeVisible({ timeout: 5000 });

    // Should show loading state then AI response
    await expect(page.getByText(/Welcome|understood|help|workout/i).first()).toBeVisible({
      timeout: 30000,
    });
  });

  test("can navigate to dashboard", async ({ page }) => {
    const dashboardLink = page.getByRole("link", { name: /Dashboard/i });
    await dashboardLink.click();

    await expect(page).toHaveURL(/metrics/);
    await expect(page.getByText(/Dashboard/i)).toBeVisible();
  });

  test("persists session on page refresh", async ({ page }) => {
    // Verify we're on chat
    await expect(page).toHaveURL("/chat");

    // Refresh
    await page.reload();

    // Should still be on chat (not redirected to login)
    await expect(page).toHaveURL("/chat");
    await expect(page.getByRole("heading", { name: "Golden Harbor", exact: true })).toBeVisible();
  });
});

test.describe("Metrics - Authenticated", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/metrics");
  });

  test("displays dashboard without redirect", async ({ page }) => {
    await expect(page).toHaveURL("/metrics");
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible();
  });

  test("shows all navigation tabs", async ({ page }) => {
    // Updated: Now only 3 tabs (Calendar, Workouts, Profile)
    const tabs = ["Calendar", "Workouts", "Profile"];

    for (const tab of tabs) {
      await expect(page.getByRole("button", { name: tab })).toBeVisible();
    }
  });

  test("calendar tab is active by default", async ({ page }) => {
    const calendarTab = page.getByRole("button", { name: "Calendar" });
    // Check for active styling (bg-gold on the new design)
    await expect(calendarTab).toHaveClass(/bg-gold|bg-blue-600/);
  });

  test("can switch between tabs", async ({ page }) => {
    // Click Workouts tab
    await page.getByRole("button", { name: "Workouts" }).click();
    await expect(page.getByRole("heading", { name: "Your Routines" })).toBeVisible();

    // Click Profile tab (now includes calories)
    await page.getByRole("button", { name: "Profile" }).click();
    await expect(page.getByRole("heading", { name: "Fitness Profile" })).toBeVisible();

    // Click Calendar tab
    await page.getByRole("button", { name: "Calendar" }).click();
    await expect(page.locator(".react-calendar")).toBeVisible();
  });

  test("has chat link in header", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Chat/i })).toBeVisible();
  });

  test("can navigate to chat", async ({ page }) => {
    await page.getByRole("link", { name: /Chat/i }).click();
    await expect(page).toHaveURL("/chat");
  });
});
