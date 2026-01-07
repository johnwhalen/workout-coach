import { test, expect } from "@playwright/test";
import { waitForClerk } from "./fixtures/auth";

/**
 * Login to Chat Flow E2E Tests
 *
 * Critical path tests for the login → chat transition.
 * This flow was experiencing issues on Vercel deployment.
 *
 * Tests cover:
 * 1. Login page loads and renders correctly
 * 2. Auth redirect works properly
 * 3. Post-login navigation to chat
 * 4. Chat page initializes correctly after auth
 */

test.describe("Login to Chat Critical Path", () => {
  test("login page loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/login");
    await waitForClerk(page);

    const loadTime = Date.now() - startTime;

    // Login should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);

    // Clerk sign-in form should be visible
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible();
  });

  test("login page has all required elements", async ({ page }) => {
    await page.goto("/login");
    await waitForClerk(page);

    // Email input
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();

    // Continue button (use exact match to avoid matching Google button)
    await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeVisible();

    // Google OAuth button
    await expect(page.getByRole("button", { name: /Google/i })).toBeVisible();

    // Sign up link
    await expect(page.getByRole("link", { name: /Sign up/i })).toBeVisible();
  });

  test("chat redirect shows login correctly", async ({ page }) => {
    // Attempting to access chat should redirect to login
    await page.goto("/chat");

    // Should end up at login
    await expect(page).toHaveURL(/login|sign-in/, { timeout: 15000 });

    // Login form should be functional
    await waitForClerk(page);
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible({ timeout: 15000 });
  });

  test("metrics redirect shows login correctly", async ({ page }) => {
    // Attempting to access metrics should redirect to login
    await page.goto("/metrics");

    // Should end up at login
    await expect(page).toHaveURL(/login|sign-in/, { timeout: 15000 });

    // Login form should be functional
    await waitForClerk(page);
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible({ timeout: 15000 });
  });

  test("login form accepts email input", async ({ page }) => {
    await page.goto("/login");
    await waitForClerk(page);

    const emailInput = page.getByRole("textbox", { name: /email/i });
    await emailInput.fill("test@example.com");

    await expect(emailInput).toHaveValue("test@example.com");
  });

  test("continue button is clickable after email input", async ({ page }) => {
    await page.goto("/login");
    await waitForClerk(page);

    const emailInput = page.getByRole("textbox", { name: /email/i });
    await emailInput.fill("test@example.com");

    const continueButton = page.getByRole("button", { name: "Continue", exact: true });
    await expect(continueButton).toBeEnabled();

    // Clicking should work (will show error for non-existent account, but proves form works)
    await continueButton.click();

    // Should show some response (either password field or error)
    await expect(
      page
        .locator("body")
        .getByText(/password|couldn't find|error/i)
        .first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("page doesn't get stuck in loading state", async ({ page }) => {
    await page.goto("/login");

    // Wait for basic page load (networkidle can be flaky with Clerk's background requests)
    await page.waitForLoadState("domcontentloaded");

    // Should show login content after reasonable wait
    // (Clerk may still have background activity, but the main content should be visible)
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible({
      timeout: 20000,
    });
  });

  test("no console errors on login page", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        // Ignore known non-critical errors
        const text = msg.text();
        if (
          !text.includes("favicon") &&
          !text.includes("DevTools") &&
          !text.includes("React DevTools")
        ) {
          errors.push(text);
        }
      }
    });

    await page.goto("/login");
    await waitForClerk(page);

    // Wait for any async errors
    await page.waitForTimeout(2000);

    // Should have no critical errors (filter out known benign ones)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("Clerk") && // Clerk dev warnings are fine
        !e.includes("preload") && // Preload warnings are fine
        !e.includes("development") // Development mode warnings are fine
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("signup page loads correctly", async ({ page }) => {
    await page.goto("/signup");
    await waitForClerk(page);

    // Should show sign-up form (Clerk may use different heading text)
    await expect(
      page.getByRole("heading", { name: /Sign up|Create|account/i }).first()
    ).toBeVisible({ timeout: 15000 });
  });

  test("can navigate between login and signup", async ({ page }) => {
    // Start at login
    await page.goto("/login");
    await waitForClerk(page);

    // Wait for sign up link to be visible and click
    const signUpLink = page.getByRole("link", { name: /Sign up/i });
    await expect(signUpLink).toBeVisible({ timeout: 10000 });
    await signUpLink.click();

    // Should navigate to signup
    await expect(page).toHaveURL(/signup/, { timeout: 10000 });
  });
});

/**
 * Post-Authentication Flow Tests
 *
 * These tests verify behavior after successful authentication.
 * They require a valid Clerk session to run.
 */
test.describe.skip("Post-Login Chat Initialization", () => {
  // These tests require authentication setup
  // To enable: set up Clerk testing tokens or storageState

  test("chat page loads after authentication", async ({ page }) => {
    await page.goto("/chat");

    // Should show chat interface (not redirect to login)
    await expect(page).toHaveURL("/chat");

    // Chat header should be visible
    await expect(page.getByText("Golden Harbor")).toBeVisible();
  });

  test("welcome message appears immediately", async ({ page }) => {
    await page.goto("/chat");

    // Welcome message should appear quickly
    await expect(page.getByText(/Welcome to.*Golden Harbor/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("chat input is ready for use", async ({ page }) => {
    await page.goto("/chat");

    const input = page.getByPlaceholder("Type your message...");

    // Input should be visible and enabled
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    // Should be able to type
    await input.fill("Test");
    await expect(input).toHaveValue("Test");
  });

  test("user button is visible in chat header", async ({ page }) => {
    await page.goto("/chat");

    // Clerk user button should be visible
    await expect(page.locator("[data-clerk-user-button]")).toBeVisible();
  });

  test("dashboard link works from chat", async ({ page }) => {
    await page.goto("/chat");

    // Click dashboard link
    await page.getByRole("link", { name: /Dashboard/i }).click();

    // Should navigate to metrics
    await expect(page).toHaveURL(/metrics/);
  });

  test("chat maintains session on page refresh", async ({ page }) => {
    await page.goto("/chat");

    // Verify we're on chat
    await expect(page).toHaveURL("/chat");

    // Refresh the page
    await page.reload();

    // Should still be on chat (not redirected to login)
    await expect(page).toHaveURL("/chat");
    await expect(page.getByText("Golden Harbor")).toBeVisible();
  });
});

/**
 * Error Recovery Tests
 *
 * Tests for handling errors during the login flow.
 */
test.describe("Login Error Recovery", () => {
  test("recovers from network timeout on login page", async ({ page }) => {
    // Go offline briefly
    await page.context().setOffline(true);

    // Try to navigate (will fail)
    await page.goto("/login").catch(() => {});

    // Come back online
    await page.context().setOffline(false);

    // Retry navigation
    await page.goto("/login");
    await waitForClerk(page);

    // Should work now
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible();
  });

  test("shows response for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await waitForClerk(page);

    // Enter a non-existent email
    const emailInput = page.getByRole("textbox", { name: /email/i });
    await emailInput.fill("definitely-not-a-real-user@fake-domain-12345.com");

    await page.getByRole("button", { name: "Continue", exact: true }).click();

    // Should show user-friendly error OR password field (depending on Clerk config)
    await expect(page.getByText(/couldn't find|password|error/i).first()).toBeVisible({
      timeout: 10000,
    });
  });
});

/**
 * Performance Tests
 *
 * Basic performance checks for the login flow.
 */
test.describe("Login Performance", () => {
  test("login page has reasonable LCP", async ({ page }) => {
    // Navigate and measure
    const startTime = Date.now();

    await page.goto("/login");

    // Wait for the main heading (LCP element) to be visible
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible({
      timeout: 10000,
    });

    const lcpTime = Date.now() - startTime;

    // LCP should be under 4 seconds (reasonable for dev, adjust for prod)
    expect(lcpTime).toBeLessThan(4000);
  });

  test("login page is interactive quickly", async ({ page }) => {
    await page.goto("/login");
    await waitForClerk(page);

    const emailInput = page.getByRole("textbox", { name: /email/i });

    // Should be able to interact immediately after visibility
    await expect(emailInput).toBeEnabled();

    // Typing should work immediately
    const startType = Date.now();
    await emailInput.fill("test@example.com");
    const typeTime = Date.now() - startType;

    // Typing should complete quickly (under 1 second)
    expect(typeTime).toBeLessThan(1000);
  });
});
