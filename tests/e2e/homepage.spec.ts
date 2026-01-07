import { test, expect } from "@playwright/test";
import { homepageElements } from "./fixtures/auth";

/**
 * Homepage E2E Tests
 *
 * Tests the public-facing homepage for Golden Harbor Workout Coach.
 * These tests verify content, navigation, and responsiveness.
 */

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays the correct page title", async ({ page }) => {
    await expect(page).toHaveTitle(/Golden Harbor/i);
  });

  test("displays hero section with branding", async ({ page }) => {
    // Check for main heading
    await expect(page.getByRole("heading", { name: /Golden Harbor/i, level: 1 })).toBeVisible();

    // Check for tagline
    await expect(page.getByText(homepageElements.tagline)).toBeVisible();

    // Check for value proposition
    await expect(page.getByText(/AI-powered personal training companion/i)).toBeVisible();
  });

  test("displays all feature cards", async ({ page }) => {
    for (const feature of homepageElements.features) {
      await expect(page.getByRole("heading", { name: feature })).toBeVisible();
    }
  });

  test("displays equipment section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Your Equipment/i })).toBeVisible();

    for (const equipment of homepageElements.equipment) {
      await expect(page.getByText(equipment)).toBeVisible();
    }
  });

  test("displays navigation with Start Training button", async ({ page }) => {
    const startButton = page.getByRole("link", { name: /Start Training/i }).first();
    await expect(startButton).toBeVisible();
  });

  test("Start Training button links to login when not authenticated", async ({ page }) => {
    const startButton = page.getByRole("link", { name: /Start Training/i }).first();
    await expect(startButton).toHaveAttribute("href", "/login");
  });

  test("displays footer with copyright", async ({ page }) => {
    await expect(page.getByText(/© 2026 Golden Harbor/i)).toBeVisible();
    await expect(page.getByText(/Center Harbor Road/i)).toBeVisible();
  });

  test("displays stats badges", async ({ page }) => {
    await expect(page.getByText(/135 sets imported/i)).toBeVisible();
    await expect(page.getByText(/Progress tracking/i)).toBeVisible();
  });

  test("CTA section invites user to train", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Ready to Train/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Start Today's Workout/i })).toBeVisible();
  });
});

test.describe("Homepage Navigation", () => {
  test("clicking Start Training navigates to login", async ({ page }) => {
    await page.goto("/");

    // Wait for page to fully load and hydrate
    await page.waitForLoadState("networkidle");

    const startButton = page.getByRole("link", { name: /Start Training/i }).first();
    await startButton.click();

    // Should navigate to login
    await expect(page).toHaveURL(/login/);
  });

  test("clicking Start Your Workout navigates to login", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const startButton = page.getByRole("link", { name: /Start Your Workout/i });
    await startButton.click();

    await expect(page).toHaveURL(/login/);
  });

  test("clicking Start Today's Workout navigates to login", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const ctaButton = page.getByRole("link", { name: /Start Today's Workout/i });
    await ctaButton.click();

    await expect(page).toHaveURL(/login/);
  });
});

test.describe("Homepage Responsive Design", () => {
  test("displays correctly on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Main content should still be visible
    await expect(page.getByRole("heading", { name: /Golden Harbor/i, level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /Start Training/i }).first()).toBeVisible();

    // Feature cards should be visible
    await expect(page.getByText(/Pre-Workout Check-In/i)).toBeVisible();
  });

  test("displays correctly on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Golden Harbor/i, level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Your Equipment/i })).toBeVisible();
  });

  test("displays correctly on desktop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Golden Harbor/i, level: 1 })).toBeVisible();

    // All features should be visible in grid
    for (const feature of homepageElements.features) {
      await expect(page.getByRole("heading", { name: feature })).toBeVisible();
    }
  });
});

test.describe("Homepage Accessibility", () => {
  test("has proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    // Should have h1
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();

    // Should have h2s for sections
    const h2s = page.getByRole("heading", { level: 2 });
    expect(await h2s.count()).toBeGreaterThan(0);

    // Should have h3s for features and equipment
    const h3s = page.getByRole("heading", { level: 3 });
    expect(await h3s.count()).toBeGreaterThan(0);
  });

  test("links have accessible names", async ({ page }) => {
    await page.goto("/");

    const links = page.getByRole("link");
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const name = (await link.getAttribute("aria-label")) || (await link.textContent());
      expect(name?.trim().length).toBeGreaterThan(0);
    }
  });

  test("images have alt text or are decorative", async ({ page }) => {
    await page.goto("/");

    // Check that images either have alt text or are marked decorative
    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      const role = await img.getAttribute("role");

      // Image should have alt text or be presentation/none
      const isDecorative = role === "presentation" || role === "none" || alt === "";
      const hasAlt = alt !== null && alt.length > 0;

      expect(isDecorative || hasAlt).toBe(true);
    }
  });
});
