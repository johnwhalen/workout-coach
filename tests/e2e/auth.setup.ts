import { clerk } from "@clerk/testing/playwright";
import { test as setup, expect } from "@playwright/test";
import path from "path";

/**
 * Auth Setup - Signs in and saves session state
 *
 * This runs after global setup to authenticate a test user.
 * The authenticated state is saved and reused by all authenticated tests.
 *
 * Required environment variables:
 * - E2E_CLERK_USER_EMAIL - Email of your test user
 * - E2E_CLERK_USER_PASSWORD - Password of your test user
 *
 * @see https://clerk.com/docs/testing/playwright/test-authenticated-flows
 */

const authFile = path.join(__dirname, ".clerk/user.json");

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_CLERK_USER_EMAIL;
  const password = process.env.E2E_CLERK_USER_PASSWORD;

  if (!email || !password) {
    console.warn(
      "⚠️  E2E_CLERK_USER_EMAIL and E2E_CLERK_USER_PASSWORD not set. Skipping auth setup."
    );
    console.warn("   Set these in your .env.local file to enable authenticated tests.");
    return;
  }

  // Navigate to the app first
  await page.goto("/");

  // Use Clerk's testing helper to sign in
  // This bypasses bot detection and signs in programmatically
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: email,
      password: password,
    },
  });

  // Verify we're signed in by navigating to a protected route
  await page.goto("/chat");
  await expect(page).toHaveURL("/chat");

  // Wait for the page to fully load with user session
  await expect(page.getByText(/Golden Harbor/i)).toBeVisible({ timeout: 10000 });

  // Save the authenticated state for reuse
  await page.context().storageState({ path: authFile });

  console.log("✅ Auth state saved to", authFile);
});
