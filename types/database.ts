/**
 * Database entity type definitions
 * These mirror the Prisma schema for use in application code
 */

export type FitnessGoal = "lose_weight" | "gain_weight" | "maintain_weight" | "add_muscle";

export interface User {
  user_id: string;
  password: string;
  email: string;
  created_at: Date;
  name?: string | null;
  current_weight?: number | null;
  height?: number | null;
  goal_weight?: number | null;
  fitness_goal?: FitnessGoal | null;
  profile_complete: boolean;
}

export interface Routine {
  routine_id: string;
  routine_name: string;
  user_id: string;
  date_created: Date;
}

export interface Workout {
  workout_id: string;
  workout_name: string;
  routine_id: string;
  date: Date;
  duration_minutes?: number | null;
  notes?: string | null;
  total_calories_burned?: number | null;
  workout_type?: string | null;
}

export interface Set {
  set_id: string;
  set_weight: number;
  set_reps: number;
  workout_id: string;
  date: Date;
  calories_burned?: number | null;
}

export interface UserChatHistory {
  userId: string;
  messages: string[];
}
