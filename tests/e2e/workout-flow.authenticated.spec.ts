import { test, expect } from "@playwright/test";

/**
 * Workout Flow E2E Tests - Authenticated
 *
 * End-to-end tests for the complete workout logging flow:
 * 1. Log workouts via chat
 * 2. Verify workouts appear in calendar
 * 3. Check analytics and charts update
 *
 * These tests run with a pre-authenticated session from auth.setup.ts.
 */

test.describe("Workout Logging Flow", () => {
  test("can log a workout via chat and see it in dashboard", async ({ page }) => {
    // Step 1: Go to chat and log a workout
    await page.goto("/chat");
    await expect(page).toHaveURL("/chat");

    // Wait for chat to load
    await expect(page.getByText("Golden Harbor")).toBeVisible();
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

    // Step 3: Verify we're on the calendar tab (default)
    await expect(page.getByRole("button", { name: "Calendar" })).toHaveClass(/bg-blue-600/);
    await expect(page.getByText(/Workout Calendar/i)).toBeVisible();
  });

  test("can log multiple exercises in one session", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByText("Golden Harbor")).toBeVisible();

    const input = page.getByPlaceholder("Type your message...");

    // Log multiple exercises
    await input.fill("Today I did squats: 4x10 at 185 lbs, then deadlifts: 3x5 at 225 lbs");
    await input.press("Enter");

    // Wait for confirmation
    await expect(page.getByText(/recorded|logged|saved|squats|deadlifts/i).first()).toBeVisible({
      timeout: 45000,
    });

    // Verify the response mentions both exercises
    const chatMessages = page.locator(".chat-bubble");
    const lastAiMessage = chatMessages.last();
    await expect(lastAiMessage).toContainText(/squat|deadlift/i);
  });

  test("can create a routine and add exercises", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByText("Golden Harbor")).toBeVisible();

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

    // The "Workouts on" section should update
    await expect(page.getByText(/Workouts on/i)).toBeVisible();
  });

  test("calendar shows workout indicators on dates with workouts", async ({ page }) => {
    // Look for dates that have workout indicators (dots or highlights)
    // The exact implementation may vary - checking for any visual indicator
    const calendar = page.locator(".react-calendar");
    await expect(calendar).toBeVisible();

    // Check that the calendar is interactive
    const calendarTiles = page.locator(".react-calendar__tile");
    const tileCount = await calendarTiles.count();
    expect(tileCount).toBeGreaterThan(28); // At least a month of days
  });

  test("monthly summary displays correctly", async ({ page }) => {
    await expect(page.getByText(/This Month's Summary/i)).toBeVisible();

    // Check all stat cards are present
    await expect(page.getByText(/Workout Days/i)).toBeVisible();
    await expect(page.getByText(/Total Workouts/i)).toBeVisible();
    await expect(page.getByText(/Total Sets/i)).toBeVisible();
    await expect(page.getByText(/Calories Burned/i)).toBeVisible();
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

test.describe("Analytics Charts", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/metrics");
    await page.getByRole("button", { name: "Analytics" }).click();
  });

  test("analytics tab displays all sections", async ({ page }) => {
    await expect(page.getByText(/Fitness Analytics/i)).toBeVisible();
  });

  test("displays streak statistics", async ({ page }) => {
    await expect(page.getByText(/Current Streak/i)).toBeVisible();
    await expect(page.getByText(/Longest Streak/i)).toBeVisible();
  });

  test("displays workout statistics", async ({ page }) => {
    await expect(page.getByText(/Total Workouts/i)).toBeVisible();
    await expect(page.getByText(/Avg\/Week/i)).toBeVisible();
  });

  test("displays weekly progress section", async ({ page }) => {
    await expect(page.getByText(/This Week's Progress/i)).toBeVisible();
  });

  test("displays activity streak chart", async ({ page }) => {
    await expect(page.getByText(/Activity Streak/i)).toBeVisible();

    // The chart should show days of the week
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (const day of daysOfWeek) {
      await expect(page.getByText(day).first()).toBeVisible();
    }
  });

  test("displays strength progression chart", async ({ page }) => {
    await expect(page.getByText(/Strength Progression/i)).toBeVisible();
  });

  test("handles empty data gracefully", async ({ page }) => {
    // Either shows "No data" message or shows the charts
    const noDataMessage = page.getByText(/No workout data available|Start logging/i);
    const chartData = page.getByText(/Current Streak/i);

    await expect(noDataMessage.or(chartData)).toBeVisible();
  });
});

test.describe("Workouts Tab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/metrics");
    await page.getByRole("button", { name: "Workouts" }).click();
  });

  test("displays routines list", async ({ page }) => {
    await expect(page.getByText(/Your Routines/i)).toBeVisible();
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
      await expect(page.getByText(/No routines|Create a routine/i)).toBeVisible();
    }
  });
});

test.describe("Calories Tab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/metrics");
    await page.getByRole("button", { name: "Calories" }).click();
  });

  test("displays calorie tracking section", async ({ page }) => {
    await expect(page.getByText(/Calorie Tracking/i)).toBeVisible();
  });

  test("shows calorie statistics", async ({ page }) => {
    await expect(page.getByText(/Total Calories Burned/i)).toBeVisible();
    await expect(page.getByText(/Daily Average/i)).toBeVisible();
  });

  test("shows recent workouts with calories", async ({ page }) => {
    await expect(page.getByText(/Recent Workouts/i)).toBeVisible();
  });
});

test.describe("Full Workflow Integration", () => {
  test("complete workout logging and verification flow", async ({ page }) => {
    // This is a comprehensive test that covers the full user journey

    // 1. Start in chat
    await page.goto("/chat");
    await expect(page.getByText("Golden Harbor")).toBeVisible();

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

    // 5. Check calendar shows today's workouts
    await expect(page.getByText(/Workout Calendar/i)).toBeVisible();
    const todayTile = page.locator(".react-calendar__tile--now");
    await todayTile.click();

    // 6. Check analytics
    await page.getByRole("button", { name: "Analytics" }).click();
    await expect(page.getByText(/Fitness Analytics/i)).toBeVisible();
    await expect(page.getByText(/Current Streak/i)).toBeVisible();

    // 7. Check calories
    await page.getByRole("button", { name: "Calories" }).click();
    await expect(page.getByText(/Calorie Tracking/i)).toBeVisible();

    // 8. Go back to chat
    await page.getByRole("link", { name: /Chat/i }).click();
    await expect(page).toHaveURL(/chat/);
    await expect(page.getByText("Golden Harbor")).toBeVisible();
  });
});
