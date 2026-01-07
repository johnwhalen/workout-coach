/**
 * Central type exports
 */

// AI types
export type {
  WorkoutSet,
  CheckInData,
  ExerciseRecommendation,
  WorkoutRecommendation,
  ActionType,
  ParsedAction,
  UserProfile,
} from "./ai";

// API types
export type {
  ApiResponse,
  ChatRequest,
  ChatStreamEvent,
  CaloriesInfo,
  RateLimitResult,
} from "./api";

// Database types
export type { FitnessGoal, User, Routine, Workout, Set, UserChatHistory } from "./database";
