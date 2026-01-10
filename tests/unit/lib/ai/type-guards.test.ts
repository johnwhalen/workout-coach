/**
 * Unit tests for AI type guards
 *
 * Tests the type guard functions in types/ai.ts
 */

import { describe, it, expect } from "vitest";
import {
  isLogWorkoutAction,
  isCheckInAction,
  isRecommendationAction,
  type ParsedAction,
} from "@/types/ai";

// =============================================================================
// isLogWorkoutAction Tests
// =============================================================================

describe("isLogWorkoutAction", () => {
  // All valid workout logging action types
  const workoutActions = [
    "log_workout",
    "log_workouts",
    "record_workout",
    "record_workouts",
    "save_workout",
    "save_workouts",
    "add_workout",
    "add_workouts",
    "add_multiple_workouts",
  ] as const;

  workoutActions.forEach((actionType) => {
    it(`returns true for "${actionType}" action`, () => {
      const parsed = {
        action: actionType,
        workoutName: ["Bench Press"],
        sets: [{ reps: 10, weight: 135 }],
      } as ParsedAction;
      expect(isLogWorkoutAction(parsed)).toBe(true);
    });
  });

  it("returns false for check_in action", () => {
    const parsed = {
      action: "check_in",
      checkIn: { energyLevel: 3, sleepQuality: 4, sorenessLevel: 2 },
    } as ParsedAction;
    expect(isLogWorkoutAction(parsed)).toBe(false);
  });

  it("returns false for fitness_question action", () => {
    const parsed = {
      action: "fitness_question",
      response: "Here is some fitness advice...",
    } as ParsedAction;
    expect(isLogWorkoutAction(parsed)).toBe(false);
  });

  it("returns false for fitness_response action", () => {
    const parsed = {
      action: "fitness_response",
      response: "Great question about form!",
    } as ParsedAction;
    expect(isLogWorkoutAction(parsed)).toBe(false);
  });

  it("returns false for get_recommendation action", () => {
    const parsed = {
      action: "get_recommendation",
      recommendation: {
        intensityAdjustment: 0.9,
        exercises: [],
        aiMessage: "Here's your workout",
      },
    } as ParsedAction;
    expect(isLogWorkoutAction(parsed)).toBe(false);
  });

  it("returns false for create_routine action", () => {
    const parsed = {
      action: "create_routine",
      routineName: "Push Day",
    } as ParsedAction;
    expect(isLogWorkoutAction(parsed)).toBe(false);
  });

  it("returns false for delete_routine action", () => {
    const parsed = {
      action: "delete_routine",
      routineName: "Push Day",
    } as ParsedAction;
    expect(isLogWorkoutAction(parsed)).toBe(false);
  });

  it("returns false for delete_workout action", () => {
    const parsed = {
      action: "delete_workout",
      workoutName: ["Bench Press"],
    } as ParsedAction;
    expect(isLogWorkoutAction(parsed)).toBe(false);
  });

  it("returns false for delete_set action", () => {
    const parsed = {
      action: "delete_set",
      workoutName: ["Bench Press"],
    } as ParsedAction;
    expect(isLogWorkoutAction(parsed)).toBe(false);
  });
});

// =============================================================================
// isCheckInAction Tests
// =============================================================================

describe("isCheckInAction", () => {
  it("returns true for check_in action", () => {
    const parsed = {
      action: "check_in",
      checkIn: {
        energyLevel: 4,
        sleepQuality: 5,
        sorenessLevel: 2,
        timeAvailable: 60,
        notes: "Feeling great today!",
      },
    } as ParsedAction;
    expect(isCheckInAction(parsed)).toBe(true);
  });

  it("returns true for check_in action with minimal data", () => {
    const parsed = {
      action: "check_in",
      checkIn: {
        energyLevel: 3,
        sleepQuality: 3,
        sorenessLevel: 3,
      },
    } as ParsedAction;
    expect(isCheckInAction(parsed)).toBe(true);
  });

  it("returns false for log_workout action", () => {
    const parsed = {
      action: "log_workout",
      workoutName: ["Squats"],
      sets: [{ reps: 8, weight: 185 }],
    } as ParsedAction;
    expect(isCheckInAction(parsed)).toBe(false);
  });

  it("returns false for fitness_question action", () => {
    const parsed = {
      action: "fitness_question",
      response: "Here is some advice...",
    } as ParsedAction;
    expect(isCheckInAction(parsed)).toBe(false);
  });

  it("returns false for get_recommendation action", () => {
    const parsed = {
      action: "get_recommendation",
      recommendation: {
        intensityAdjustment: 1.0,
        exercises: [],
        aiMessage: "Today's workout",
      },
    } as ParsedAction;
    expect(isCheckInAction(parsed)).toBe(false);
  });

  it("returns false for create_routine action", () => {
    const parsed = {
      action: "create_routine",
      routineName: "Leg Day",
    } as ParsedAction;
    expect(isCheckInAction(parsed)).toBe(false);
  });

  it("returns false for delete_routine action", () => {
    const parsed = {
      action: "delete_routine",
      routineName: "Leg Day",
    } as ParsedAction;
    expect(isCheckInAction(parsed)).toBe(false);
  });
});

// =============================================================================
// isRecommendationAction Tests
// =============================================================================

describe("isRecommendationAction", () => {
  it("returns true for get_recommendation action", () => {
    const parsed = {
      action: "get_recommendation",
      recommendation: {
        intensityAdjustment: 0.85,
        exercises: [
          {
            name: "Dumbbell Press",
            targetWeight: 40,
            targetReps: 10,
            sets: 3,
            notes: "Focus on controlled movement",
          },
        ],
        aiMessage: "Based on your check-in, here's a moderate intensity workout",
      },
    } as ParsedAction;
    expect(isRecommendationAction(parsed)).toBe(true);
  });

  it("returns true for get_recommendation with empty exercises", () => {
    const parsed = {
      action: "get_recommendation",
      recommendation: {
        intensityAdjustment: 1.0,
        exercises: [],
        aiMessage: "Rest day recommended",
      },
    } as ParsedAction;
    expect(isRecommendationAction(parsed)).toBe(true);
  });

  it("returns true for get_recommendation with low intensity", () => {
    const parsed = {
      action: "get_recommendation",
      recommendation: {
        intensityAdjustment: 0.7,
        exercises: [
          {
            name: "Light Rowing",
            targetWeight: 0,
            targetReps: 1,
            sets: 1,
            notes: "10 minute warmup only",
          },
        ],
        aiMessage: "Take it easy today",
      },
    } as ParsedAction;
    expect(isRecommendationAction(parsed)).toBe(true);
  });

  it("returns true for get_recommendation with high intensity", () => {
    const parsed = {
      action: "get_recommendation",
      recommendation: {
        intensityAdjustment: 1.1,
        exercises: [
          {
            name: "Heavy Squats",
            targetWeight: 225,
            targetReps: 5,
            sets: 5,
          },
        ],
        aiMessage: "You're feeling great - push it today!",
      },
    } as ParsedAction;
    expect(isRecommendationAction(parsed)).toBe(true);
  });

  it("returns false for check_in action", () => {
    const parsed = {
      action: "check_in",
      checkIn: {
        energyLevel: 5,
        sleepQuality: 5,
        sorenessLevel: 1,
      },
    } as ParsedAction;
    expect(isRecommendationAction(parsed)).toBe(false);
  });

  it("returns false for log_workout action", () => {
    const parsed = {
      action: "log_workout",
      workoutName: ["Deadlift"],
      sets: [{ reps: 5, weight: 315 }],
    } as ParsedAction;
    expect(isRecommendationAction(parsed)).toBe(false);
  });

  it("returns false for fitness_question action", () => {
    const parsed = {
      action: "fitness_question",
      response: "To improve grip strength...",
    } as ParsedAction;
    expect(isRecommendationAction(parsed)).toBe(false);
  });

  it("returns false for fitness_response action", () => {
    const parsed = {
      action: "fitness_response",
      response: "That's a great observation!",
    } as ParsedAction;
    expect(isRecommendationAction(parsed)).toBe(false);
  });

  it("returns false for create_routine action", () => {
    const parsed = {
      action: "create_routine",
      routineName: "Full Body",
    } as ParsedAction;
    expect(isRecommendationAction(parsed)).toBe(false);
  });

  it("returns false for delete_workout action", () => {
    const parsed = {
      action: "delete_workout",
      workoutName: ["Curls"],
    } as ParsedAction;
    expect(isRecommendationAction(parsed)).toBe(false);
  });
});
