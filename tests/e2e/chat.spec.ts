import { test, expect } from "@playwright/test";

/**
 * Chat E2E Tests - Unauthenticated
 *
 * Tests the chat interface for unauthenticated users.
 * For authenticated tests, see chat.authenticated.spec.ts
 */

test.describe("Chat - Unauthenticated", () => {
  test("redirects to login when accessing chat", async ({ page }) => {
    await page.goto("/chat");

    // Should redirect to login
    await expect(page).toHaveURL(/login|sign-in/);
  });

  test("shows login form after redirect", async ({ page }) => {
    await page.goto("/chat");

    // Should show Clerk sign-in
    await expect(page.getByRole("heading", { name: /Sign in/i })).toBeVisible({
      timeout: 10000,
    });
  });
});

/**
 * Chat UI Components
 *
 * Tests for specific UI elements that can be verified without auth.
 */
test.describe("Chat UI - via Homepage", () => {
  test("homepage links to chat correctly", async ({ page }) => {
    await page.goto("/");

    // Start Training should link to login (when not auth'd)
    const startButton = page.getByRole("link", { name: /Start Training/i }).first();
    const href = await startButton.getAttribute("href");

    expect(href).toMatch(/login|chat/);
  });
});
