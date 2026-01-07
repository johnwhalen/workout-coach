/**
 * Workouts API Client
 *
 * Functions for fetching workout-related data.
 * Used by React Query hooks for caching and deduplication.
 */

import { api } from "./client";
import type { Routine, Workout, Set } from "@/types/database";

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

interface WorkoutsByDateResponse {
  workouts: (Workout & {
    routine: { routine_name: string };
    Set: Set[];
  })[];
}

/**
 * Fetch all routines for the current user
 */
export async function fetchRoutines(): Promise<Routine[]> {
  const response = await api.get<RoutinesResponse>("/api/routines");
  return response.routines;
}

/**
 * Fetch workouts for a specific routine
 */
export async function fetchWorkouts(routineId: string): Promise<Workout[]> {
  const response = await api.post<WorkoutsResponse>("/api/workouts", {
    routineId,
  });
  return response.workouts;
}

/**
 * Fetch sets for a specific workout
 */
export async function fetchSets(workoutId: string): Promise<Set[]> {
  const response = await api.post<SetsResponse>("/api/sets", { workoutId });
  return response.sets;
}

/**
 * Fetch workouts grouped by date
 */
export async function fetchWorkoutsByDate(): Promise<WorkoutsByDateResponse["workouts"]> {
  const response = await api.get<WorkoutsByDateResponse>("/api/workouts/by-date");
  return response.workouts;
}

/**
 * Fetch all routines with their workouts for the browser view
 */
export async function fetchRoutinesWithWorkouts(): Promise<(Routine & { workouts: Workout[] })[]> {
  const routines = await fetchRoutines();

  // Fetch workouts for each routine in parallel
  const routinesWithWorkouts = await Promise.all(
    routines.map(async (routine) => {
      const workouts = await fetchWorkouts(routine.routine_id);
      return {
        ...routine,
        workouts,
      };
    })
  );

  return routinesWithWorkouts;
}
