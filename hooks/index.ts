/**
 * Hooks barrel export
 *
 * Central export point for all custom hooks.
 */

// Workout data hooks
export {
  useRoutines,
  useWorkouts,
  useSets,
  useWorkoutsByDate,
  useWorkoutsForDate,
  useInvalidateWorkouts,
  workoutKeys,
  type WorkoutsByDate,
  type WorkoutWithDetails,
} from "./useWorkoutData";

// User profile hooks
export {
  useEnsureUser,
  useUserProfile,
  useUpdateProfile,
  useCalorieData,
  userKeys,
  type UserProfile,
  type ProfileUpdateData,
  type CalorieData,
} from "./useUserProfile";

// Analytics hooks
export {
  useAnalytics,
  useMonthSummary,
  type AnalyticsSummary,
  type StreakDay,
  type WeeklyStrength,
} from "./useAnalytics";
