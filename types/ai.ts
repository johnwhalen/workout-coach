/**
 * AI-related type definitions
 *
 * Uses discriminated unions for type-safe action handling.
 * Each action type has its own interface with specific properties.
 */

// ============================================================================
// Base Types
// ============================================================================

/** Individual workout set with reps, weight, and optional calorie tracking */
export interface WorkoutSet {
  reps: number;
  weight: number;
  calories?: number;
}

/** User check-in data for intensity adjustments */
export interface CheckInData {
  /** Energy level from 1 (exhausted) to 5 (energized) */
  energyLevel: number;
  /** Sleep quality from 1 (poor) to 5 (excellent) */
  sleepQuality: number;
  /** Soreness level from 1 (none) to 5 (very sore) */
  sorenessLevel: number;
  /** Available time for workout in minutes */
  timeAvailable?: number;
  /** Additional notes from user */
  notes?: string;
}

/** Single exercise recommendation from AI */
export interface ExerciseRecommendation {
  name: string;
  targetWeight: number;
  targetReps: number;
  sets: number;
  videoUrl?: string;
  notes?: string;
}

/** Full workout recommendation with intensity and exercises */
export interface WorkoutRecommendation {
  /** Multiplier for workout intensity (0.7-1.1 typically) */
  intensityAdjustment: number;
  exercises: ExerciseRecommendation[];
  aiMessage: string;
}

/** User's fitness profile from database */
export interface UserProfile {
  current_weight: number | null;
  height: number | null;
  goal_weight: number | null;
  fitness_goal: string | null;
  profile_complete: boolean;
}

// ============================================================================
// Discriminated Union: Parsed Actions
// ============================================================================

/** Base properties shared by all action types */
interface BaseAction {
  date?: string;
  message?: string;
  response?: string;
}

/** Logging/saving workout action */
interface LogWorkoutAction extends BaseAction {
  action:
    | "log_workout"
    | "log_workouts"
    | "record_workout"
    | "record_workouts"
    | "save_workout"
    | "save_workouts"
    | "add_workout"
    | "add_workouts"
    | "add_multiple_workouts";
  workoutName?: string[];
  sets?: WorkoutSet[];
  routineName?: string;
  totalCalories?: number;
}

/** Create a new routine action */
interface CreateRoutineAction extends BaseAction {
  action: "create_routine";
  routineName: string;
}

/** Delete routine action */
interface DeleteRoutineAction extends BaseAction {
  action: "delete_routine";
  routineName: string;
}

/** Delete workout action */
interface DeleteWorkoutAction extends BaseAction {
  action: "delete_workout";
  workoutName?: string[];
  routineName?: string;
}

/** Delete set action */
interface DeleteSetAction extends BaseAction {
  action: "delete_set";
  workoutName?: string[];
  routineName?: string;
}

/** General fitness question/response */
interface FitnessQuestionAction extends BaseAction {
  action: "fitness_question" | "fitness_response";
}

/** Pre-workout check-in action */
interface CheckInAction extends BaseAction {
  action: "check_in";
  checkIn: CheckInData;
}

/** Get workout recommendation action */
interface RecommendationAction extends BaseAction {
  action: "get_recommendation";
  recommendation: WorkoutRecommendation;
}

/**
 * Discriminated union of all possible AI actions.
 * Use the `action` property to narrow the type in switch statements.
 *
 * @example
 * ```typescript
 * function handleAction(parsed: ParsedAction) {
 *   switch (parsed.action) {
 *     case "log_workout":
 *       // TypeScript knows parsed has workoutName, sets, etc.
 *       console.log(parsed.workoutName);
 *       break;
 *     case "check_in":
 *       // TypeScript knows parsed has checkIn
 *       console.log(parsed.checkIn.energyLevel);
 *       break;
 *   }
 * }
 * ```
 */
export type ParsedAction =
  | LogWorkoutAction
  | CreateRoutineAction
  | DeleteRoutineAction
  | DeleteWorkoutAction
  | DeleteSetAction
  | FitnessQuestionAction
  | CheckInAction
  | RecommendationAction;

/**
 * All possible action type strings
 * @deprecated Use ParsedAction discriminated union instead
 */
export type ActionType = ParsedAction["action"];

// ============================================================================
// Type Guards
// ============================================================================

/** Check if action is a workout logging action */
export function isLogWorkoutAction(action: ParsedAction): action is LogWorkoutAction {
  return [
    "log_workout",
    "log_workouts",
    "record_workout",
    "record_workouts",
    "save_workout",
    "save_workouts",
    "add_workout",
    "add_workouts",
    "add_multiple_workouts",
  ].includes(action.action);
}

/** Check if action is a check-in */
export function isCheckInAction(action: ParsedAction): action is CheckInAction {
  return action.action === "check_in";
}

/** Check if action is a recommendation request */
export function isRecommendationAction(action: ParsedAction): action is RecommendationAction {
  return action.action === "get_recommendation";
}
