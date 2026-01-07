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

/**
 * Hook to fetch all workouts grouped by date
 * This is a complex query that fetches routines, workouts, and sets in parallel
 */
export function useWorkoutsByDate() {
  return useQuery({
    queryKey: workoutKeys.workoutsByDate(),
    queryFn: async (): Promise<WorkoutsByDate> => {
      // First get all routines
      const routinesResponse = await api.get<RoutinesResponse>("/api/routines");
      const routines = routinesResponse.routines || [];

      if (routines.length === 0) return {};

      // Fetch all workouts for each routine in parallel
      const workoutPromises = routines.map(async (routine) => {
        try {
          const response = await api.post<WorkoutsResponse>("/api/workouts", {
            routineId: routine.routine_id,
          });
          return (response.workouts || []).map((workout) => ({
            ...workout,
            routine_name: routine.routine_name,
          }));
        } catch {
          return [];
        }
      });

      const workoutArrays = await Promise.all(workoutPromises);
      const allWorkouts = workoutArrays.flat();

      // Fetch sets for all workouts in parallel (batch into groups of 10)
      const batchSize = 10;
      const workoutsByDate: WorkoutsByDate = {};

      for (let i = 0; i < allWorkouts.length; i += batchSize) {
        const batch = allWorkouts.slice(i, i + batchSize);
        const setsPromises = batch.map(async (workout) => {
          try {
            const response = await api.post<SetsResponse>("/api/sets", {
              workoutId: workout.workout_id,
            });
            const sets = response.sets || [];
            return {
              workout,
              sets,
            };
          } catch {
            return { workout, sets: [] as Set[] };
          }
        });

        const results = await Promise.all(setsPromises);

        for (const { workout, sets } of results) {
          const dateKey = new Date(workout.date).toISOString().split("T")[0];
          if (!workoutsByDate[dateKey]) {
            workoutsByDate[dateKey] = [];
          }

          workoutsByDate[dateKey].push({
            ...workout,
            sets_count: sets.length,
            total_reps: sets.reduce((sum, set) => sum + set.set_reps, 0),
            total_weight: sets.reduce((sum, set) => sum + set.set_weight * set.set_reps, 0),
          } as WorkoutWithDetails);
        }
      }

      return workoutsByDate;
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
