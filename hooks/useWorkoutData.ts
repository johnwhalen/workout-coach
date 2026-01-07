/**
 * Workout Data Hooks
 *
 * React Query hooks for fetching workout-related data.
 * Provides caching, deduplication, and optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Routine, Workout, Set } from "@/types/database";

// Query keys for cache management
export const workoutKeys = {
  all: ["workouts"] as const,
  routines: () => [...workoutKeys.all, "routines"] as const,
  routine: (id: string) => [...workoutKeys.routines(), id] as const,
  workouts: (routineId: string) => [...workoutKeys.all, "workouts", routineId] as const,
  sets: (workoutId: string) => [...workoutKeys.all, "sets", workoutId] as const,
  workoutsByDate: () => [...workoutKeys.all, "by-date"] as const,
};

// Response types
interface RoutinesResponse {
  routines: Routine[];
}

interface WorkoutsResponse {
  workouts: Workout[];
}

interface SetsResponse {
  sets: Set[];
}

export interface WorkoutWithDetails extends Workout {
  routine_name: string;
  sets_count: number;
  total_reps: number;
  total_weight: number;
}

export type WorkoutsByDate = Record<string, WorkoutWithDetails[]>;

/**
 * Hook to fetch all routines for the current user
 */
export function useRoutines() {
  return useQuery({
    queryKey: workoutKeys.routines(),
    queryFn: async () => {
      const response = await api.get<RoutinesResponse>("/api/routines");
      return response.routines;
    },
  });
}

/**
 * Hook to fetch workouts for a specific routine
 */
export function useWorkouts(routineId: string | null) {
  return useQuery({
    queryKey: workoutKeys.workouts(routineId || ""),
    queryFn: async () => {
      if (!routineId) return [];
      const response = await api.post<WorkoutsResponse>("/api/workouts", { routineId });
      return response.workouts;
    },
    enabled: !!routineId,
  });
}

/**
 * Hook to fetch sets for a specific workout
 */
export function useSets(workoutId: string | null) {
  return useQuery({
    queryKey: workoutKeys.sets(workoutId || ""),
    queryFn: async () => {
      if (!workoutId) return [];
      const response = await api.post<SetsResponse>("/api/sets", { workoutId });
      return response.sets;
    },
    enabled: !!workoutId,
  });
}

// Response type for the optimized by-date endpoint
interface WorkoutsByDateResponse {
  success: boolean;
  workoutsByDate: WorkoutsByDate;
  totalWorkoutDays: number;
  totalWorkouts: number;
}

/**
 * Hook to fetch all workouts grouped by date
 * Uses the optimized /api/workouts/by-date endpoint that fetches all data in a single query
 */
export function useWorkoutsByDate() {
  return useQuery({
    queryKey: workoutKeys.workoutsByDate(),
    queryFn: async (): Promise<WorkoutsByDate> => {
      const response = await api.get<WorkoutsByDateResponse>("/api/workouts/by-date");
      return response.workoutsByDate || {};
    },
    staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
  });
}

/**
 * Hook to get workouts for a specific date from cached data
 */
export function useWorkoutsForDate(
  workoutsByDate: WorkoutsByDate | undefined,
  date: Date
): WorkoutWithDetails[] {
  if (!workoutsByDate) return [];
  const dateKey = date.toISOString().split("T")[0];
  return workoutsByDate[dateKey] || [];
}

/**
 * Mutation to invalidate workout cache
 */
export function useInvalidateWorkouts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // This is just for triggering invalidation
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
    },
  });
}
