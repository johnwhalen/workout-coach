import { clerkSetup } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

/**
 * Global Setup for Clerk Testing
 *
 * This runs once before all tests to obtain a Testing Token from Clerk.
 * The token bypasses bot detection during E2E tests.
 *
 * Required environment variables:
 * - CLERK_PUBLISHABLE_KEY (or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
 * - CLERK_SECRET_KEY
 *
 * @see https://clerk.com/docs/testing/playwright/overview
 */
setup("global setup", async () => {
  await clerkSetup();
});
