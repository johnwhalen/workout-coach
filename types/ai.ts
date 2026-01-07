/**
 * AI-related type definitions
 */

export interface WorkoutSet {
  reps: number;
  weight: number;
  calories?: number;
}

export interface CheckInData {
  energyLevel: number; // 1-5
  sleepQuality: number; // 1-5
  sorenessLevel: number; // 1-5
  timeAvailable?: number; // minutes
  notes?: string;
}

export interface ExerciseRecommendation {
  name: string;
  targetWeight: number;
  targetReps: number;
  sets: number;
  videoUrl?: string;
  notes?: string;
}

export interface WorkoutRecommendation {
  intensityAdjustment: number;
  exercises: ExerciseRecommendation[];
  aiMessage: string;
}

export type ActionType =
  | "log_workout"
  | "log_workouts"
  | "record_workout"
  | "record_workouts"
  | "save_workout"
  | "save_workouts"
  | "add_workout"
  | "add_workouts"
  | "add_multiple_workouts"
  | "create_routine"
  | "delete_routine"
  | "delete_workout"
  | "delete_set"
  | "fitness_question"
  | "fitness_response"
  | "check_in"
  | "get_recommendation";

export interface ParsedAction {
  action: ActionType | string;
  workoutName?: string[];
  sets?: WorkoutSet[];
  routineName?: string;
  date?: string;
  totalCalories?: number;
  response?: string;
  message?: string;
  checkIn?: CheckInData;
  recommendation?: WorkoutRecommendation;
}

export interface UserProfile {
  current_weight: number | null;
  height: number | null;
  goal_weight: number | null;
  fitness_goal: string | null;
  profile_complete: boolean;
}
