import { test, expect } from "@playwright/test";
import { waitForClerk } from "./fixtures/auth";

/**
 * Authentication E2E Tests
 *
 * Tests the authentication flow using Clerk.
 * Verifies protected routes, login page rendering, and auth redirects.
 */

test.describe("Authentication Flow", () => {
  test("homepage is accessible without authentication", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: /Golden Harbor/i, level: 1 })).toBeVisible();
  });

  test("login page renders Clerk sign-in component", async ({ page }) => {
    await page.goto("/login");

    // Wait for Clerk to load
    await waitForClerk(page);

    // Clerk sign-in should be visible
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
  });

  test("login page has Google OAuth option", async ({ page }) => {
    await page.goto("/login");
    await waitForClerk(page);

    await expect(page.getByRole("button", { name: /Google/i })).toBeVisible({ timeout: 10000 });
  });

  test("login page has email input", async ({ page }) => {
    await page.goto("/login");
    await waitForClerk(page);

    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible({ timeout: 10000 });
  });

  test("login page has link to sign up", async ({ page }) => {
    await page.goto("/login");
    await waitForClerk(page);

    await expect(page.getByRole("link", { name: /Sign up/i })).toBeVisible({ timeout: 10000 });
  });

  test("signup page renders Clerk sign-up component", async ({ page }) => {
    await page.goto("/signup");

    // Wait for Clerk to load
    await waitForClerk(page);

    // Clerk sign-up should be visible
    await expect(page.getByRole("heading", { name: /Sign up|Create/i })).toBeVisible({
      timeout: 10000,
    });
  });

  test("signup page has link to sign in", async ({ page }) => {
    await page.goto("/signup");
    await waitForClerk(page);

    await expect(page.getByRole("link", { name: /Sign in/i })).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Protected Routes", () => {
  test("chat page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/chat");

    // Should redirect to sign-in
    await expect(page).toHaveURL(/login|sign-in/);
  });

  test("metrics page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/metrics");

    // Should redirect to sign-in
    await expect(page).toHaveURL(/login|sign-in/);
  });

  test("protected routes show login form after redirect", async ({ page }) => {
    await page.goto("/chat");

    // After redirect, login form should be visible
    await waitForClerk(page);
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Login Form Validation", () => {
  test("shows error or password field for invalid email format", async ({ page }) => {
    await page.goto("/login");
    await waitForClerk(page);

    const emailInput = page.getByRole("textbox", { name: /email/i });
    await emailInput.fill("invalid-email");

    await page.getByRole("button", { name: "Continue", exact: true }).click();

    // Clerk may show validation error, password field, or "couldn't find" message
    // The exact behavior depends on Clerk's email validation and lookup
    await expect(page.getByText(/invalid|error|couldn't find|password/i).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("shows error or password field for non-existent account", async ({ page }) => {
    await page.goto("/login");
    await waitForClerk(page);

    const emailInput = page.getByRole("textbox", { name: /email/i });
    await emailInput.fill("nonexistent@example.com");

    await page.getByRole("button", { name: "Continue", exact: true }).click();

    // Clerk may show account not found error OR password field (for email+password flow)
    // Either response is valid - it means the form is processing
    await expect(page.getByText(/couldn't find|password|error/i).first()).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe("Auth UI Elements", () => {
  test("login page shows Clerk branding in development", async ({ page }) => {
    await page.goto("/login");
    await waitForClerk(page);

    // In dev mode, Clerk shows development mode badge
    await expect(page.getByText(/Development mode/i)).toBeVisible({ timeout: 10000 });
  });

  test("login page shows demo credentials hint", async ({ page }) => {
    await page.goto("/login");

    // Your app shows demo credentials
    await expect(page.getByText(/Demo credentials/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Navigation After Auth Attempt", () => {
  test("can navigate from login to signup", async ({ page }) => {
    await page.goto("/login");
    await waitForClerk(page);

    await page.getByRole("link", { name: /Sign up/i }).click();

    await expect(page).toHaveURL(/signup/);
  });

  test("can navigate from signup to login", async ({ page }) => {
    await page.goto("/signup");
    await waitForClerk(page);

    await page.getByRole("link", { name: /Sign in/i }).click();

    await expect(page).toHaveURL(/login|sign-in/);
  });

  test("can return to homepage from login", async ({ page }) => {
    await page.goto("/login");
    await waitForClerk(page);

    await page.goto("/");

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: /Golden Harbor/i, level: 1 })).toBeVisible();
  });
});
