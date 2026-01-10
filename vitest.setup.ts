import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock Clerk auth
vi.mock("@clerk/nextjs", () => ({
  auth: () => ({ userId: "test-user-id" }),
  currentUser: () =>
    Promise.resolve({
      id: "test-user-id",
      emailAddresses: [{ emailAddress: "test@example.com" }],
    }),
  useUser: () => ({
    user: { id: "test-user-id" },
    isLoaded: true,
    isSignedIn: true,
  }),
  useAuth: () => ({
    userId: "test-user-id",
    isLoaded: true,
    isSignedIn: true,
  }),
  SignIn: () => null,
  SignUp: () => null,
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: vi.fn(() => ({ userId: "test-user-id" })),
  currentUser: vi.fn(() =>
    Promise.resolve({
      id: "test-user-id",
      emailAddresses: [{ emailAddress: "test@example.com" }],
    })
  ),
}));

// Mock environment variables
vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");
vi.stubEnv("ANTHROPIC_API_KEY", "test-api-key");
