# Task Brief: Unit Tests for AI Module

## Objective

Add comprehensive unit tests for the AI processing module, specifically targeting type guards and prompt building logic.

---

## Context

This is a Next.js workout coaching app with Claude AI integration. The testing infrastructure is already set up:

- **Framework**: Vitest (configured in `vitest.config.ts`)
- **Coverage threshold**: 70% (already configured)
- **Test location**: `tests/unit/`

---

## Files to Test

### 1. Type Guards (`types/ai.ts`)

**Functions to test:**

- `isLogWorkoutAction(action)` - Returns true for workout logging actions
- `isCheckInAction(action)` - Returns true for check-in actions
- `isRecommendationAction(action)` - Returns true for recommendation actions

**Test cases needed:**

```typescript
// Example test structure
describe("isLogWorkoutAction", () => {
  it("returns true for log_workout action", () => {});
  it("returns true for add_workout action", () => {});
  it("returns true for record_workout action", () => {});
  it("returns false for check_in action", () => {});
  it("returns false for fitness_question action", () => {});
});
```

### 2. Prompt Builder (`lib/ai/prompts.ts`)

**Function to test:**

- `buildSystemPrompt(userProfile, recentHistory)` - Builds the AI system prompt

**Test cases needed:**

- Returns valid prompt when userProfile is null
- Returns valid prompt when userProfile.profile_complete is false
- Includes user weight/height when profile is complete
- Includes progressive overload guidance
- Includes equipment context (Hydrow, dumbbells, bench)
- Appends recent conversation history

---

## Test File Locations

Create these files:

```
tests/unit/lib/
├── ai/
│   ├── prompts.test.ts
│   └── type-guards.test.ts   # or put in types/ folder
```

---

## Running Tests

```bash
# Run all unit tests
npx vitest run

# Run with coverage
npx vitest run --coverage

# Watch mode during development
npx vitest
```

---

## Example Test File

```typescript
// tests/unit/lib/ai/type-guards.test.ts
import { describe, it, expect } from "vitest";
import {
  isLogWorkoutAction,
  isCheckInAction,
  isRecommendationAction,
  type ParsedAction,
} from "@/types/ai";

describe("isLogWorkoutAction", () => {
  const workoutActions = [
    "log_workout",
    "log_workouts",
    "add_workout",
    "record_workout",
    "save_workout",
  ];

  workoutActions.forEach((action) => {
    it(`returns true for ${action}`, () => {
      const parsed = { action, workoutName: ["Bench Press"] } as ParsedAction;
      expect(isLogWorkoutAction(parsed)).toBe(true);
    });
  });

  it("returns false for check_in", () => {
    const parsed = {
      action: "check_in",
      checkIn: { energyLevel: 3, sleepQuality: 4, sorenessLevel: 2 },
    } as ParsedAction;
    expect(isLogWorkoutAction(parsed)).toBe(false);
  });
});
```

---

## Acceptance Criteria

- [ ] All type guard functions have tests
- [ ] `buildSystemPrompt` has tests for all branches
- [ ] Tests pass: `npx vitest run`
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] Commit with message: `test(ai): add unit tests for type guards and prompts`

---

## Notes

- The codebase uses path aliases (`@/` maps to root)
- Vitest is already configured with jsdom environment
- Don't mock anything - these are pure functions
