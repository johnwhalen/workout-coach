import { test, expect } from "@playwright/test";

/**
 * Authenticated Metrics/Dashboard E2E Tests
 *
 * These tests run with a pre-authenticated session from auth.setup.ts.
 * The storageState from .clerk/user.json is automatically loaded.
 *
 * The dashboard now has 3 consolidated tabs:
 * - Calendar (includes Analytics)
 * - Workouts (routine browser)
 * - Profile (includes Calorie stats)
 *
 * @see https://clerk.com/docs/testing/playwright/test-authenticated-flows
 */

test.describe("Metrics - Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/metrics");
  });

  test("displays dashboard without redirect", async ({ page }) => {
    await expect(page).toHaveURL("/metrics");
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible();
  });

  test("displays all navigation tabs", async ({ page }) => {
    // Updated: 3 consolidated tabs
    const tabs = ["Calendar", "Workouts", "Profile"];

    for (const tab of tabs) {
      await expect(page.getByRole("button", { name: tab })).toBeVisible();
    }
  });

  test("calendar tab is active by default", async ({ page }) => {
    const calendarTab = page.getByRole("button", { name: "Calendar" });
    await expect(calendarTab).toHaveClass(/bg-gold|bg-blue-600/);
  });

  test("has chat link in header", async ({ page }) => {
    await expect(page.getByRole("link", { name: /Chat/i })).toBeVisible();
  });
});

test.describe("Metrics - Calendar View", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/metrics");
    // Ensure we're on calendar tab
    await page.getByRole("button", { name: "Calendar" }).click();
  });

  test("displays react-calendar component", async ({ page }) => {
    await expect(page.locator(".react-calendar")).toBeVisible();
  });

  test("displays monthly summary stats", async ({ page }) => {
    // UI shows "Days Active", "Workouts", "Sets", "Calories"
    await expect(page.getByText(/Days Active/i)).toBeVisible();
    await expect(page.getByText(/^Sets$/i)).toBeVisible();
  });

  test("can click on calendar dates", async ({ page }) => {
    // Click on a date in the calendar
    const dateButton = page.locator(".react-calendar__tile").first();
    await dateButton.click();

    // Calendar should still be visible (no error)
    await expect(page.locator(".react-calendar")).toBeVisible();
  });

  test("calendar navigation works", async ({ page }) => {
    // Find and click next month button
    const nextButton = page.locator(".react-calendar__navigation__next-button");
    await nextButton.click();

    // Calendar should update (no error)
    await expect(page.locator(".react-calendar")).toBeVisible();
  });
});

test.describe("Metrics - Workouts View", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/metrics");
    await page.getByRole("button", { name: "Workouts" }).click();
  });

  test("displays routines list", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Your Routines" })).toBeVisible();
  });

  test("shows empty state when no routines or displays routines", async ({ page }) => {
    // If no routines exist
    const emptyState = page.getByText(/No routines available/i);
    const routineItem = page.locator("[class*='itemStyle']").first();

    // Either should be visible
    await expect(emptyState.or(routineItem)).toBeVisible();
  });

  test("can select a routine if available", async ({ page }) => {
    // Wait for routines to load
    await page.waitForTimeout(1000);

    // If routines exist, click on first one
    const routineItem = page.locator("text=/Full Super|Push|Pull|Leg/i").first();
    if (await routineItem.isVisible()) {
      await routineItem.click();

      // Should show workouts for that routine
      await expect(page.getByText(/Workouts/i)).toBeVisible();
    }
  });

  test("back to routines button works", async ({ page }) => {
    // Wait for routines
    await page.waitForTimeout(1000);

    const routineItem = page.locator("[class*='bg-slate-800']").first();
    if (await routineItem.isVisible()) {
      await routineItem.click();

      // Click back button
      const backButton = page.getByRole("button", { name: /Back to Routines/i });
      if (await backButton.isVisible()) {
        await backButton.click();
        await expect(page.getByRole("heading", { name: "Your Routines" })).toBeVisible();
      }
    }
  });
});

test.describe("Metrics - Profile View", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/metrics");
    await page.getByRole("button", { name: "Profile" }).click();
  });

  test("displays fitness profile section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Fitness Profile" })).toBeVisible();
  });

  test("shows profile incomplete message if not set up or displays stats", async ({ page }) => {
    // Either complete profile or incomplete message
    const incompleteMessage = page.getByText(/Profile Incomplete/i);
    const currentStats = page.getByText(/Current Stats/i);

    await expect(incompleteMessage.or(currentStats)).toBeVisible();
  });

  test("displays current stats when profile complete", async ({ page }) => {
    const currentStats = page.getByText(/Current Stats/i);
    if (await currentStats.isVisible()) {
      await expect(page.getByText(/Weight:/i)).toBeVisible();
      await expect(page.getByText(/Height:/i)).toBeVisible();
      await expect(page.getByText(/BMI:/i)).toBeVisible();
    }
  });

  test("displays goals when profile complete", async ({ page }) => {
    const goals = page.getByText(/Goals/i);
    if (await goals.isVisible()) {
      await expect(page.getByText(/Target:/i)).toBeVisible();
      await expect(page.getByText(/Goal:/i)).toBeVisible();
    }
  });

  test("has edit button when profile complete", async ({ page }) => {
    const editButton = page.getByRole("button", { name: /Edit/i });
    if (await editButton.isVisible()) {
      await editButton.click();

      // Should show edit form
      await expect(page.getByText(/Edit Fitness Profile/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /Save/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Cancel/i })).toBeVisible();
    }
  });

  test("can cancel profile editing", async ({ page }) => {
    const editButton = page.getByRole("button", { name: /Edit/i });
    if (await editButton.isVisible()) {
      await editButton.click();
      await page.getByRole("button", { name: /Cancel/i }).click();

      // Should return to view mode
      await expect(page.getByRole("button", { name: /Edit/i })).toBeVisible();
    }
  });
});

test.describe("Metrics - Tab Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/metrics");
  });

  test("switching tabs updates content", async ({ page }) => {
    // Click Workouts tab
    await page.getByRole("button", { name: "Workouts" }).click();
    await expect(page.getByRole("heading", { name: "Your Routines" })).toBeVisible();

    // Click Profile tab
    await page.getByRole("button", { name: "Profile" }).click();
    await expect(page.getByRole("heading", { name: "Fitness Profile" })).toBeVisible();

    // Click Calendar tab
    await page.getByRole("button", { name: "Calendar" }).click();
    await expect(page.locator(".react-calendar")).toBeVisible();
  });

  test("active tab has correct styling", async ({ page }) => {
    const workoutsTab = page.getByRole("button", { name: "Workouts" });
    await workoutsTab.click();

    // Active tab should have gold/blue background
    await expect(workoutsTab).toHaveClass(/bg-gold|bg-blue-600/);
  });
});

test.describe("Metrics - Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/metrics");
  });

  test("can navigate to chat from dashboard", async ({ page }) => {
    await page.getByRole("link", { name: /Chat/i }).click();
    await expect(page).toHaveURL(/chat/);
  });

  test("persists session on page refresh", async ({ page }) => {
    // Verify we're on metrics
    await expect(page).toHaveURL("/metrics");

    // Refresh
    await page.reload();

    // Should still be on metrics (not redirected to login)
    await expect(page).toHaveURL("/metrics");
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible();
  });
});

test.describe("Metrics - Responsive Design", () => {
  test("displays correctly on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/metrics");

    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible();
    // Tabs should still be visible (may wrap)
    await expect(page.getByRole("button", { name: "Calendar" })).toBeVisible();
  });

  test("displays correctly on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/metrics");

    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible();
  });
});
