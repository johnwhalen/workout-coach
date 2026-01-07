/**
 * AI module exports
 *
 * This module provides AI-powered workout coaching capabilities.
 */

// Main processor
export { processWithAI, processWithClaude } from "./processor";

// Utility functions
export { calculateIntensityAdjustment } from "./intensity";
export { getUserHistory, updateUserHistory } from "./history";
export { buildSystemPrompt } from "./prompts";

// Re-export types for convenience
export type {
  ParsedAction,
  WorkoutSet,
  CheckInData,
  WorkoutRecommendation,
  ExerciseRecommendation,
  UserProfile,
  ActionType,
} from "@/types/ai";
