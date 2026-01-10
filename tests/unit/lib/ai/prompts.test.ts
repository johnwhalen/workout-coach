/**
 * Unit tests for AI prompt builder
 *
 * Tests the buildSystemPrompt function in lib/ai/prompts.ts
 */

import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import type { UserProfile } from "@/types/ai";

// =============================================================================
// buildSystemPrompt Tests
// =============================================================================

describe("buildSystemPrompt", () => {
  // ---------------------------------------------------------------------------
  // Null / Incomplete Profile Tests
  // ---------------------------------------------------------------------------

  describe("when userProfile is null", () => {
    it("returns a valid prompt string", () => {
      const result = buildSystemPrompt(null, "");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("does not include personalized context", () => {
      const result = buildSystemPrompt(null, "");
      expect(result).not.toContain("User's Fitness Profile:");
      expect(result).not.toContain("Current Weight:");
      expect(result).not.toContain("Height:");
      expect(result).not.toContain("Goal Weight:");
    });

    it("still includes equipment context", () => {
      const result = buildSystemPrompt(null, "");
      expect(result).toContain("User's Equipment:");
      expect(result).toContain("Hydrow rowing machine");
      expect(result).toContain("Adjustable bench");
      expect(result).toContain("Dumbbells up to 55 lbs");
    });

    it("includes the coach persona", () => {
      const result = buildSystemPrompt(null, "");
      expect(result).toContain("supportive personal workout coach");
    });
  });

  describe("when profile_complete is false", () => {
    it("returns a valid prompt without personalized context", () => {
      const incompleteProfile: UserProfile = {
        current_weight: 180,
        height: 175,
        goal_weight: 170,
        fitness_goal: "weight_loss",
        profile_complete: false,
      };

      const result = buildSystemPrompt(incompleteProfile, "");
      expect(result).not.toContain("User's Fitness Profile:");
      expect(result).not.toContain("180kg");
    });

    it("still includes equipment context", () => {
      const incompleteProfile: UserProfile = {
        current_weight: null,
        height: null,
        goal_weight: null,
        fitness_goal: null,
        profile_complete: false,
      };

      const result = buildSystemPrompt(incompleteProfile, "");
      expect(result).toContain("User's Equipment:");
      expect(result).toContain("Hydrow rowing machine");
    });
  });

  // ---------------------------------------------------------------------------
  // Complete Profile Tests
  // ---------------------------------------------------------------------------

  describe("when profile is complete", () => {
    const completeProfile: UserProfile = {
      current_weight: 85,
      height: 180,
      goal_weight: 80,
      fitness_goal: "muscle_gain",
      profile_complete: true,
    };

    it("includes user weight and height", () => {
      const result = buildSystemPrompt(completeProfile, "");
      expect(result).toContain("Current Weight: 85kg");
      expect(result).toContain("Height: 180cm");
    });

    it("includes goal weight", () => {
      const result = buildSystemPrompt(completeProfile, "");
      expect(result).toContain("Goal Weight: 80kg");
    });

    it("includes fitness goal with underscore replaced by space", () => {
      const result = buildSystemPrompt(completeProfile, "");
      expect(result).toContain("Fitness Goal: muscle gain");
    });

    it("includes progressive overload guidance", () => {
      const result = buildSystemPrompt(completeProfile, "");
      expect(result).toContain("Progressive overload");
      expect(result).toContain("2.5-5 lbs");
      expect(result).toContain("1-2 reps per week");
      expect(result).toContain("max 10% increase");
    });

    it("includes return from break guidance", () => {
      const result = buildSystemPrompt(completeProfile, "");
      expect(result).toContain("returning to training after a 3-6 month break");
      expect(result).toContain("50% of previous maximums");
    });

    it("includes equipment context", () => {
      const result = buildSystemPrompt(completeProfile, "");
      expect(result).toContain("User's Equipment:");
      expect(result).toContain("Hydrow rowing machine");
      expect(result).toContain("incline, flat, decline");
      expect(result).toContain("Dumbbells up to 55 lbs");
    });
  });

  // ---------------------------------------------------------------------------
  // Edge Cases for Profile Data
  // ---------------------------------------------------------------------------

  describe("edge cases for profile data", () => {
    it("handles null fitness_goal gracefully", () => {
      const profileWithNullGoal: UserProfile = {
        current_weight: 75,
        height: 170,
        goal_weight: 72,
        fitness_goal: null,
        profile_complete: true,
      };

      // Should not throw
      const result = buildSystemPrompt(profileWithNullGoal, "");
      expect(result).toContain("Fitness Goal:");
    });

    it("handles null weight values in complete profile", () => {
      const profileWithNulls: UserProfile = {
        current_weight: null,
        height: null,
        goal_weight: null,
        fitness_goal: "general_fitness",
        profile_complete: true,
      };

      // Should not throw
      const result = buildSystemPrompt(profileWithNulls, "");
      expect(result).toContain("Current Weight: nullkg");
    });

    it("handles fitness_goal with no underscores", () => {
      const simpleGoal: UserProfile = {
        current_weight: 90,
        height: 185,
        goal_weight: 85,
        fitness_goal: "strength",
        profile_complete: true,
      };

      const result = buildSystemPrompt(simpleGoal, "");
      expect(result).toContain("Fitness Goal: strength");
    });

    it("handles fitness_goal with multiple underscores", () => {
      const multiUnderscoreGoal: UserProfile = {
        current_weight: 90,
        height: 185,
        goal_weight: 85,
        fitness_goal: "build_lean_muscle",
        profile_complete: true,
      };

      const result = buildSystemPrompt(multiUnderscoreGoal, "");
      // Note: replace() only replaces first occurrence
      expect(result).toContain("Fitness Goal: build lean_muscle");
    });
  });

  // ---------------------------------------------------------------------------
  // Recent History Tests
  // ---------------------------------------------------------------------------

  describe("recent conversation history", () => {
    it("appends empty history", () => {
      const result = buildSystemPrompt(null, "");
      expect(result).toContain("Recent conversation:");
    });

    it("appends recent conversation history to prompt", () => {
      const history = "User: I did 3 sets of bench press today\nAssistant: Great job!";
      const result = buildSystemPrompt(null, history);
      expect(result).toContain(history);
    });

    it("includes history at the end of the prompt", () => {
      const history = "User: What should I work on today?";
      const result = buildSystemPrompt(null, history);
      const historyIndex = result.indexOf(history);
      const jsonInstructionIndex = result.indexOf("Respond with ONLY valid JSON");

      // History should appear before the final JSON instruction
      expect(historyIndex).toBeGreaterThan(-1);
      expect(jsonInstructionIndex).toBeGreaterThan(historyIndex);
    });

    it("combines profile and history correctly", () => {
      const profile: UserProfile = {
        current_weight: 80,
        height: 175,
        goal_weight: 75,
        fitness_goal: "weight_loss",
        profile_complete: true,
      };
      const history = "User: How many calories should I eat?";

      const result = buildSystemPrompt(profile, history);
      expect(result).toContain("Current Weight: 80kg");
      expect(result).toContain(history);
    });
  });

  // ---------------------------------------------------------------------------
  // JSON Response Format Tests
  // ---------------------------------------------------------------------------

  describe("response format instructions", () => {
    it("includes check-in response format", () => {
      const result = buildSystemPrompt(null, "");
      expect(result).toContain('"action": "check_in"');
      expect(result).toContain('"energyLevel"');
      expect(result).toContain('"sleepQuality"');
      expect(result).toContain('"sorenessLevel"');
    });

    it("includes workout management format", () => {
      const result = buildSystemPrompt(null, "");
      expect(result).toContain('"action": "log_workout"');
      expect(result).toContain('"workoutName"');
      expect(result).toContain('"sets"');
      expect(result).toContain('"routineName"');
    });

    it("includes fitness question format", () => {
      const result = buildSystemPrompt(null, "");
      expect(result).toContain('"action": "fitness_question"');
    });

    it("includes recommendation format", () => {
      const result = buildSystemPrompt(null, "");
      expect(result).toContain('"action": "get_recommendation"');
      expect(result).toContain('"intensityAdjustment"');
      expect(result).toContain('"exercises"');
    });

    it("instructs to respond with only valid JSON", () => {
      const result = buildSystemPrompt(null, "");
      expect(result).toContain("Respond with ONLY valid JSON, no additional text");
    });
  });

  // ---------------------------------------------------------------------------
  // Coaching Guidance Tests
  // ---------------------------------------------------------------------------

  describe("coaching guidance", () => {
    it("includes guidance for returning from a break", () => {
      const result = buildSystemPrompt(null, "");
      expect(result).toContain("Start conservative (50% of previous weights)");
      expect(result).toContain("Focus on form over weight");
      expect(result).toContain("Build consistency before intensity");
    });

    it("includes encouragement directive", () => {
      const result = buildSystemPrompt(null, "");
      expect(result).toContain("encouraging but realistic");
    });
  });
});
