import { test as base, expect, Page } from "@playwright/test";

/**
 * Authentication fixtures for Playwright E2E tests
 *
 * Provides utilities for testing both authenticated and unauthenticated flows.
 * For authenticated tests, you'll need to set up Clerk test mode or use
 * session storage.
 */

// Extended test fixture with auth utilities
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  // Authenticated page fixture - skipped by default until Clerk test user is configured
  authenticatedPage: async ({ page }, use) => {
    // TODO: Set up Clerk test authentication
    // Option 1: Use Clerk's testing tokens (recommended)
    // Option 2: Use browser context with saved session
    // Option 3: Programmatically sign in via Clerk's API

    // For now, we'll mark this as a placeholder
    // The test will be skipped if auth isn't configured
    await use(page);
  },
});

export { expect };

/**
 * Helper to check if we're in a CI environment
 */
export const isCI = !!process.env.CI;

/**
 * Wait for Clerk to initialize on a page
 */
export async function waitForClerk(page: Page, timeout = 15000): Promise<void> {
  // First wait for page to be ready
  await page.waitForLoadState("domcontentloaded");

  await page.waitForFunction(
    () => {
      return (
        document.querySelector("[data-clerk-sign-in-root]") !== null ||
        document.querySelector("[data-clerk-sign-up-root]") !== null ||
        document.querySelector("[data-clerk-user-button]") !== null ||
        // Also check for loaded state by looking for form elements
        document.querySelector('input[name="identifier"]') !== null ||
        document.querySelector('input[type="email"]') !== null ||
        // Or visible text content
        document.body.innerHTML.includes("Sign in") ||
        document.body.innerHTML.includes("Sign up") ||
        document.body.innerHTML.includes("Golden Harbor")
      );
    },
    { timeout }
  );

  // Small delay to let Clerk fully render
  await page.waitForTimeout(300);
}

/**
 * Check if user is authenticated by looking for Clerk user button
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  try {
    await page.waitForSelector("[data-clerk-user-button]", { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Navigate to login and wait for Clerk component
 */
export async function goToLogin(page: Page): Promise<void> {
  await page.goto("/login");
  await waitForClerk(page);
}

/**
 * Fill login form with email (first step of Clerk auth)
 */
export async function fillEmail(page: Page, email: string): Promise<void> {
  const emailInput = page.getByRole("textbox", { name: /email/i });
  await emailInput.fill(email);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
}

/**
 * Test data for workout logging tests
 */
export const testWorkouts = {
  simple: "I did 3 sets of bench press at 135 lbs for 10 reps",
  withRoutine: "Did bench press 3x10 at 135 lbs in my Full Super A routine",
  multiple: "Today I did: bench 3x10 at 135, squats 3x8 at 185, rows 3x12 at 95",
  checkin: "Feeling pretty tired today, maybe a 5 out of 10",
};

/**
 * Expected elements on the homepage
 */
export const homepageElements = {
  title: "Golden Harbor Workout Coach",
  tagline: "Your Personal Training Harbor",
  features: [
    "Pre-Workout Check-In",
    "Progressive Overload",
    "Return-to-Training Mode",
    "Superset Structure",
    "Progress Charts",
    "Natural Conversation",
  ],
  equipment: ["Hydrow", "Dumbbells", "Adj. Bench"],
  cta: "Start Training",
};

/**
 * Expected elements on the chat page
 */
export const chatElements = {
  title: "Golden Harbor",
  welcomeText: "Welcome to Golden Harbor Workout Coach",
  inputPlaceholder: "Type your message...",
  dashboardLink: "Dashboard",
};
