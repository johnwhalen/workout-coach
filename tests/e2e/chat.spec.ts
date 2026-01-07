import { test, expect } from "@playwright/test";
import { chatElements, testWorkouts } from "./fixtures/auth";

/**
 * Chat E2E Tests
 *
 * Tests the chat interface functionality.
 * Note: Authenticated tests require Clerk test user setup.
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
 * Authenticated Chat Tests
 *
 * These tests require a valid Clerk session. To enable:
 * 1. Create a test user in Clerk dashboard
 * 2. Set up Clerk testing tokens OR
 * 3. Use storageState to save authenticated session
 *
 * For now, these are marked as skip but document expected behavior.
 */
test.describe.skip("Chat - Authenticated", () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Set up authentication before each test
    // Option 1: Use Clerk testing tokens
    // Option 2: Load saved session from storageState
    await page.goto("/chat");
  });

  test("displays chat interface", async ({ page }) => {
    // Header with title
    await expect(page.getByText(chatElements.title)).toBeVisible();

    // Dashboard link
    await expect(page.getByRole("link", { name: chatElements.dashboardLink })).toBeVisible();

    // User button (Clerk)
    await expect(page.locator("[data-clerk-user-button]")).toBeVisible();
  });

  test("displays welcome message on first load", async ({ page }) => {
    await expect(page.getByText(/Welcome to.*Golden Harbor/i)).toBeVisible();
    await expect(page.getByText(/What I can do/i)).toBeVisible();
  });

  test("has chat input with placeholder", async ({ page }) => {
    const input = page.getByPlaceholder(chatElements.inputPlaceholder);
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
  });

  test("has send button", async ({ page }) => {
    const sendButton = page.locator("button[type='submit']");
    await expect(sendButton).toBeVisible();
  });

  test("can type in chat input", async ({ page }) => {
    const input = page.getByPlaceholder(chatElements.inputPlaceholder);
    await input.fill("Hello");

    await expect(input).toHaveValue("Hello");
  });

  test("can send a message", async ({ page }) => {
    const input = page.getByPlaceholder(chatElements.inputPlaceholder);
    await input.fill(testWorkouts.simple);

    await page.locator("button[type='submit']").click();

    // User message should appear
    await expect(page.getByText(testWorkouts.simple)).toBeVisible();
  });

  test("shows loading state while processing", async ({ page }) => {
    const input = page.getByPlaceholder(chatElements.inputPlaceholder);
    await input.fill("Log a workout");
    await page.locator("button[type='submit']").click();

    // Should show loading dots
    await expect(page.locator(".typing-dot").first()).toBeVisible();
  });

  test("receives AI response", async ({ page }) => {
    const input = page.getByPlaceholder(chatElements.inputPlaceholder);
    await input.fill(testWorkouts.simple);
    await page.locator("button[type='submit']").click();

    // Wait for response (longer timeout for AI)
    await expect(page.locator(".chat-bubble").last()).not.toBeEmpty({
      timeout: 30000,
    });
  });

  test("can submit with Enter key", async ({ page }) => {
    const input = page.getByPlaceholder(chatElements.inputPlaceholder);
    await input.fill("Test message");
    await input.press("Enter");

    // Message should appear
    await expect(page.getByText("Test message")).toBeVisible();
  });

  test("Shift+Enter does not submit", async ({ page }) => {
    const input = page.getByPlaceholder(chatElements.inputPlaceholder);
    await input.fill("Line 1");
    await input.press("Shift+Enter");
    await input.type("Line 2");

    // Should still be in input, not submitted
    await expect(input).toBeFocused();
  });

  test("can navigate to dashboard", async ({ page }) => {
    await page.getByRole("link", { name: chatElements.dashboardLink }).click();

    await expect(page).toHaveURL(/metrics/);
  });
});

/**
 * Chat API Integration Tests
 *
 * Tests the chat API endpoint directly, useful for testing
 * without full UI authentication.
 */
test.describe("Chat API", () => {
  test.skip("POST /api/chat returns 401 for unauthenticated requests", async ({ request }) => {
    const response = await request.post("/api/chat", {
      data: {
        prompt: "Hello",
        user: "test-user",
      },
    });

    expect(response.status()).toBe(401);
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

/**
 * Chat Message Formatting
 *
 * Tests for markdown rendering in chat messages.
 * These require authentication to fully test.
 */
test.describe.skip("Chat Message Formatting", () => {
  test("renders markdown in AI responses", async ({ page }) => {
    await page.goto("/chat");

    // The welcome message uses markdown
    // Check for rendered headings
    await expect(page.locator("h1, h2, h3").first()).toBeVisible();

    // Check for rendered lists
    await expect(page.locator("ul, ol").first()).toBeVisible();

    // Check for code formatting
    await expect(page.locator("code").first()).toBeVisible();
  });

  test("renders emoji correctly", async ({ page }) => {
    await page.goto("/chat");

    // Welcome message has emoji
    await expect(page.getByText("💪")).toBeVisible();
  });
});

/**
 * Chat Error Handling
 *
 * Tests for error states in chat.
 */
test.describe.skip("Chat Error Handling", () => {
  test("shows error message on API failure", async ({ page }) => {
    await page.goto("/chat");

    // Simulate network error by going offline
    await page.context().setOffline(true);

    const input = page.getByPlaceholder(chatElements.inputPlaceholder);
    await input.fill("Test message");
    await page.locator("button[type='submit']").click();

    // Should show error
    await expect(page.getByText(/error|failed/i)).toBeVisible({
      timeout: 10000,
    });

    // Restore network
    await page.context().setOffline(false);
  });

  test("handles empty message submission", async ({ page }) => {
    await page.goto("/chat");

    // Try to submit empty message
    await page.locator("button[type='submit']").click();

    // Should not add empty message to chat
    const messageBubbles = page.locator(".chat-bubble");
    const initialCount = await messageBubbles.count();

    await page.locator("button[type='submit']").click();

    // Count should not increase
    expect(await messageBubbles.count()).toBe(initialCount);
  });
});
