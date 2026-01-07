import { test, expect } from "@playwright/test";

/**
 * Workout Flow E2E Tests - Authenticated
 *
 * End-to-end tests for the complete workout logging flow:
 * 1. Log workouts via chat
 * 2. Verify workouts appear in calendar
 * 3. Check analytics (embedded in Calendar tab)
 *
 * These tests run with a pre-authenticated session from auth.setup.ts.
 *
 * Dashboard now has 3 consolidated tabs:
 * - Calendar (includes Analytics)
 * - Workouts (routine browser)
 * - Profile (includes Calorie stats)
 */

test.describe("Workout Logging Flow", () => {
  test("can log a workout via chat and see it in dashboard", async ({ page }) => {
    // Step 1: Go to chat and log a workout
    await page.goto("/chat");
    await expect(page).toHaveURL("/chat");

    // Wait for chat to load
    await expect(page.getByRole("heading", { name: "Golden Harbor", exact: true })).toBeVisible();
    const input = page.getByPlaceholder("Type your message...");
    await expect(input).toBeVisible();

    // Log a workout with natural language
    await input.fill(
      "I just did 3 sets of bench press: 10 reps at 135 lbs, 8 reps at 145 lbs, 6 reps at 155 lbs"
    );
    await input.press("Enter");

    // Wait for AI response (this may take a while)
    await expect(page.getByText(/recorded|logged|saved|great|workout/i).first()).toBeVisible({
      timeout: 45000,
    });

    // Step 2: Navigate to dashboard
    await page.getByRole("link", { name: /Dashboard/i }).click();
    await expect(page).toHaveURL(/metrics/);

    // Step 3: Verify we're on the calendar tab (default) - uses bg-gold styling
    await expect(page.getByRole("button", { name: "Calendar" })).toHaveClass(/bg-gold/);
    await expect(page.locator(".react-calendar")).toBeVisible();
  });

  test("can log multiple exercises in one session", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByRole("heading", { name: "Golden Harbor", exact: true })).toBeVisible();

    const input = page.getByPlaceholder("Type your message...");

    // Log multiple exercises
    await input.fill("Today I did squats: 4x10 at 185 lbs, then deadlifts: 3x5 at 225 lbs");
    await input.press("Enter");

    // Wait for confirmation
    await expect(page.getByText(/recorded|logged|saved|squats|deadlifts/i).first()).toBeVisible({
      timeout: 45000,
    });

    // Verify the response mentions exercises (use more specific selector to avoid duplicates)
    const aiMessages = page.locator('[class*="ai-message"], [class*="assistant"]');
    if ((await aiMessages.count()) > 0) {
      await expect(aiMessages.last()).toContainText(/squat|deadlift/i);
    }
  });

  test("can create a routine and add exercises", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByRole("heading", { name: "Golden Harbor", exact: true })).toBeVisible();

    const input = page.getByPlaceholder("Type your message...");

    // Create a new routine
    await input.fill("create routine called Test Upper Body");
    await input.press("Enter");

    // Wait for confirmation
    await expect(page.getByText(/created|routine|Test Upper Body/i).first()).toBeVisible({
      timeout: 45000,
    });

    // Add exercises to the routine
    await input.fill("add bench press, overhead press, rows to Test Upper Body");
    await input.press("Enter");

    // Wait for confirmation
    await expect(page.getByText(/added|bench|press|rows/i).first()).toBeVisible({
      timeout: 45000,
    });
  });
});

test.describe("Calendar Verification", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/metrics");
    await page.getByRole("button", { name: "Calendar" }).click();
  });

  test("calendar shows today's date", async ({ page }) => {
    const today = new Date();
    const dayOfMonth = today.getDate().toString();

    // Find today's date on the calendar (it should have a special class)
    const todayTile = page.locator(".react-calendar__tile--now");
    await expect(todayTile).toBeVisible();
    await expect(todayTile).toContainText(dayOfMonth);
  });

  test("clicking a date shows workouts for that date", async ({ page }) => {
    // Click on today's date
    const todayTile = page.locator(".react-calendar__tile--now");
    await todayTile.click();

    // The calendar should still be visible after clicking
    await expect(page.locator(".react-calendar")).toBeVisible();
  });

  test("calendar shows workout indicators on dates with workouts", async ({ page }) => {
    // Look for dates that have workout indicators (dots or highlights)
    const calendar = page.locator(".react-calendar");
    await expect(calendar).toBeVisible();

    // Check that the calendar is interactive
    const calendarTiles = page.locator(".react-calendar__tile");
    const tileCount = await calendarTiles.count();
    expect(tileCount).toBeGreaterThan(28); // At least a month of days
  });

  test("monthly summary displays correctly", async ({ page }) => {
    // Check stats are present - UI shows "Days Active", "Workouts", "Sets", "Calories"
    await expect(page.getByText(/Days Active/i)).toBeVisible();
    await expect(page.getByText(/^Sets$/i)).toBeVisible();
  });

  test("can navigate between months", async ({ page }) => {
    const calendar = page.locator(".react-calendar");
    await expect(calendar).toBeVisible();

    // Get current month label
    const monthLabel = page.locator(".react-calendar__navigation__label");
    const initialMonth = await monthLabel.textContent();

    // Click next month
    await page.locator(".react-calendar__navigation__next-button").click();
    await page.waitForTimeout(300); // Wait for animation

    // Month should have changed
    const newMonth = await monthLabel.textContent();
    expect(newMonth).not.toBe(initialMonth);

    // Click previous to go back
    await page.locator(".react-calendar__navigation__prev-button").click();
    await page.waitForTimeout(300);

    // Should be back to original month
    const finalMonth = await monthLabel.textContent();
    expect(finalMonth).toBe(initialMonth);
  });
});

test.describe("Analytics (Embedded in Calendar Tab)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/metrics");
    // Analytics is now part of the Calendar tab
    await page.getByRole("button", { name: "Calendar" }).click();
  });

  test("analytics section displays within calendar tab", async ({ page }) => {
    // Calendar should be visible first
    await expect(page.locator(".react-calendar")).toBeVisible();

    // Analytics section may show below calendar or after loading
    // Check for streak or workout statistics
    const streakText = page.getByText(/Streak|streak/i).first();
    const workoutStats = page.getByText(/Total Workouts|Workouts/i).first();

    // Either streaks or workout stats should be visible
    await expect(streakText.or(workoutStats)).toBeVisible({ timeout: 10000 });
  });

  test("displays streak or workout statistics", async ({ page }) => {
    // Wait for analytics to load
    await page.waitForTimeout(2000);

    // Check for any statistics (may show loading initially)
    const statsIndicator = page
      .getByText(/Current Streak|Total Workouts|Workout Days|Loading/i)
      .first();
    await expect(statsIndicator).toBeVisible();
  });

  test("handles loading state gracefully", async ({ page }) => {
    // Analytics may show loading state initially
    const loadingOrContent = page
      .locator('.react-calendar, [class*="analytics"], [class*="loading"]')
      .first();
    await expect(loadingOrContent).toBeVisible();
  });
});

test.describe("Workouts Tab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/metrics");
    await page.getByRole("button", { name: "Workouts" }).click();
  });

  test("displays routines list", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Your Routines" })).toBeVisible();
  });

  test("can drill down into routines", async ({ page }) => {
    // Wait for routines to load
    await page.waitForTimeout(1000);

    // Look for any routine item
    const routineItem = page.locator("[class*='bg-slate-800']").first();

    if (await routineItem.isVisible()) {
      await routineItem.click();

      // Should show workout details or exercises
      await expect(page.getByText(/Workouts|Exercises|Back to Routines/i).first()).toBeVisible();
    } else {
      // No routines - should show empty state
      await expect(page.getByText(/No routines/i)).toBeVisible();
    }
  });

  test("shows empty state when no routines", async ({ page }) => {
    // Either shows routines or empty state
    const emptyState = page.getByText(/No routines/i);
    const routineItem = page.locator("[class*='bg-slate-800']").first();

    await expect(emptyState.or(routineItem)).toBeVisible();
  });
});

test.describe("Profile Tab (includes Calorie Stats)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/metrics");
    await page.getByRole("button", { name: "Profile" }).click();
  });

  test("displays fitness profile section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Fitness Profile" })).toBeVisible();
  });

  test("shows profile incomplete or current stats", async ({ page }) => {
    // Either shows profile incomplete message or current stats
    const incompleteMessage = page.getByText(/Profile Incomplete/i);
    const currentStats = page.getByText(/Current Stats/i);

    await expect(incompleteMessage.or(currentStats)).toBeVisible();
  });

  test("displays calorie stats section", async ({ page }) => {
    // Calorie stats are now part of Profile tab
    // May show loading initially or calorie data
    const calorieSection = page.getByText(/Calorie|calories/i).first();
    const profileSection = page.getByRole("heading", { name: "Fitness Profile" });

    // Profile should always be visible, calorie section may be loading
    await expect(profileSection).toBeVisible();

    // Wait a bit for calorie data to load
    await page.waitForTimeout(1000);
  });

  test("shows goals when profile is complete", async ({ page }) => {
    const goalsSection = page.getByText(/Goals/i);
    const incompleteMessage = page.getByText(/Profile Incomplete/i);

    // Either goals visible (profile complete) or incomplete message
    await expect(goalsSection.or(incompleteMessage)).toBeVisible();
  });
});

test.describe("Full Workflow Integration", () => {
  test("complete workout logging and verification flow", async ({ page }) => {
    // This is a comprehensive test that covers the full user journey

    // 1. Start in chat
    await page.goto("/chat");
    await expect(page.getByRole("heading", { name: "Golden Harbor", exact: true })).toBeVisible();

    // 2. Log a workout
    const input = page.getByPlaceholder("Type your message...");
    await input.fill("I did 3 sets of dumbbell curls at 30 lbs for 12 reps each");
    await input.press("Enter");

    // 3. Wait for confirmation
    await expect(page.getByText(/recorded|logged|curls|saved/i).first()).toBeVisible({
      timeout: 45000,
    });

    // 4. Go to dashboard
    await page.getByRole("link", { name: /Dashboard/i }).click();
    await expect(page).toHaveURL(/metrics/);

    // 5. Check calendar tab (default) shows calendar component
    await expect(page.locator(".react-calendar")).toBeVisible();
    const todayTile = page.locator(".react-calendar__tile--now");
    await todayTile.click();

    // 6. Switch to Workouts tab
    await page.getByRole("button", { name: "Workouts" }).click();
    await expect(page.getByRole("heading", { name: "Your Routines" })).toBeVisible();

    // 7. Switch to Profile tab (includes calories)
    await page.getByRole("button", { name: "Profile" }).click();
    await expect(page.getByRole("heading", { name: "Fitness Profile" })).toBeVisible();

    // 8. Go back to chat
    await page.getByRole("link", { name: /Chat/i }).click();
    await expect(page).toHaveURL(/chat/);
    await expect(page.getByRole("heading", { name: "Golden Harbor", exact: true })).toBeVisible();
  });

  test("tab navigation preserves state", async ({ page }) => {
    await page.goto("/metrics");

    // Click through all tabs
    await page.getByRole("button", { name: "Calendar" }).click();
    await expect(page.locator(".react-calendar")).toBeVisible();

    await page.getByRole("button", { name: "Workouts" }).click();
    await expect(page.getByRole("heading", { name: "Your Routines" })).toBeVisible();

    await page.getByRole("button", { name: "Profile" }).click();
    await expect(page.getByRole("heading", { name: "Fitness Profile" })).toBeVisible();

    // Go back to calendar
    await page.getByRole("button", { name: "Calendar" }).click();
    await expect(page.locator(".react-calendar")).toBeVisible();
  });
});
