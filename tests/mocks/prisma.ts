import { vi } from "vitest";

/**
 * Mock Prisma client for testing
 *
 * Provides mocked implementations of common Prisma methods.
 * Import this in tests that need database access.
 */

export const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
  },
  routine: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  workout: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  set: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
  },
  userChatHistory: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  },
  $transaction: vi.fn((fn) => fn(mockPrisma)),
  $connect: vi.fn(),
  $disconnect: vi.fn(),
};

// Mock the prisma import
vi.mock("@/prisma/prisma", () => ({
  default: mockPrisma,
}));

/**
 * Helper to reset all mocks between tests
 */
export function resetPrismaMocks() {
  Object.values(mockPrisma).forEach((model) => {
    if (typeof model === "object" && model !== null) {
      Object.values(model).forEach((method) => {
        if (typeof method === "function" && "mockReset" in method) {
          (method as ReturnType<typeof vi.fn>).mockReset();
        }
      });
    }
  });
}

/**
 * Sample test data factories
 */
export const testData = {
  user: (overrides = {}) => ({
    user_id: "test-user-id",
    email: "test@example.com",
    password: "",
    name: "Test User",
    created_at: new Date(),
    current_weight: null,
    height: null,
    goal_weight: null,
    fitness_goal: null,
    profile_complete: false,
    ...overrides,
  }),

  routine: (overrides = {}) => ({
    routine_id: "test-routine-id",
    routine_name: "Test Routine",
    user_id: "test-user-id",
    date_created: new Date(),
    ...overrides,
  }),

  workout: (overrides = {}) => ({
    workout_id: "test-workout-id",
    workout_name: "Bench Press",
    routine_id: "test-routine-id",
    date: new Date(),
    duration_minutes: null,
    notes: null,
    total_calories_burned: null,
    workout_type: null,
    ...overrides,
  }),

  set: (overrides = {}) => ({
    set_id: "test-set-id",
    set_weight: 135,
    set_reps: 10,
    workout_id: "test-workout-id",
    date: new Date(),
    calories_burned: null,
    ...overrides,
  }),
};
