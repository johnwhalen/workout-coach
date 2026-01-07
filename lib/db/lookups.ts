/**
 * Optimized database lookup functions
 *
 * Provides cached and optimized lookups for common operations,
 * reducing N+1 queries and improving performance.
 */

import prisma from "@/prisma/prisma";
import Fuse from "fuse.js";

// Request-level cache with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 30 * 1000; // 30 seconds
const routineCache = new Map<string, CacheEntry<RoutineLookup[]>>();
const workoutCache = new Map<string, CacheEntry<WorkoutLookup[]>>();

interface RoutineLookup {
  routine_id: string;
  routine_name: string;
}

interface WorkoutLookup {
  workout_id: string;
  workout_name: string;
}

/**
 * Get cached routines for a user, or fetch from database
 */
async function getCachedRoutines(userId: string): Promise<RoutineLookup[]> {
  const cacheKey = `routines:${userId}`;
  const cached = routineCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const routines = await prisma.routine.findMany({
    where: { user_id: userId },
    select: {
      routine_id: true,
      routine_name: true,
    },
  });

  routineCache.set(cacheKey, { data: routines, timestamp: now });
  return routines;
}

/**
 * Get cached workouts for a routine, or fetch from database
 */
async function getCachedWorkouts(routineId: string): Promise<WorkoutLookup[]> {
  const cacheKey = `workouts:${routineId}`;
  const cached = workoutCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const workouts = await prisma.workout.findMany({
    where: { routine_id: routineId },
    select: {
      workout_id: true,
      workout_name: true,
    },
    distinct: ["workout_name"],
  });

  workoutCache.set(cacheKey, { data: workouts, timestamp: now });
  return workouts;
}

/**
 * Find or create a routine by name for a user
 *
 * Uses exact match first, then fuzzy search, then creates if not found.
 * Much more efficient than fetching all routines and filtering in memory.
 */
export async function findOrCreateRoutine(userId: string, routineName: string): Promise<string> {
  // First, try exact match (most common case)
  const exactMatch = await prisma.routine.findFirst({
    where: {
      user_id: userId,
      routine_name: {
        equals: routineName,
        mode: "insensitive",
      },
    },
    select: { routine_id: true },
  });

  if (exactMatch) {
    return exactMatch.routine_id;
  }

  // Fall back to fuzzy search using cached data
  const routines = await getCachedRoutines(userId);
  const fuse = new Fuse(routines, {
    keys: ["routine_name"],
    threshold: 0.3, // Stricter threshold
  });

  const fuzzyResult = fuse.search(routineName);
  if (fuzzyResult.length > 0) {
    return fuzzyResult[0].item.routine_id;
  }

  // Create new routine
  const newRoutine = await prisma.routine.create({
    data: {
      routine_name: routineName,
      user_id: userId,
    },
  });

  // Invalidate cache
  routineCache.delete(`routines:${userId}`);

  return newRoutine.routine_id;
}

/**
 * Find or create a workout by name within a routine
 *
 * Validates that the routine belongs to the user for security.
 */
export async function findOrCreateWorkout(
  userId: string,
  routineId: string,
  workoutName: string
): Promise<string> {
  // Verify routine ownership
  const routine = await prisma.routine.findFirst({
    where: {
      routine_id: routineId,
      user_id: userId,
    },
    select: { routine_id: true },
  });

  if (!routine) {
    throw new Error("Routine not found or not owned by user");
  }

  // Try exact match first
  const exactMatch = await prisma.workout.findFirst({
    where: {
      routine_id: routineId,
      workout_name: {
        equals: workoutName,
        mode: "insensitive",
      },
    },
    select: { workout_id: true },
  });

  if (exactMatch) {
    return exactMatch.workout_id;
  }

  // Fall back to fuzzy search
  const workouts = await getCachedWorkouts(routineId);
  const fuse = new Fuse(workouts, {
    keys: ["workout_name"],
    threshold: 0.3,
  });

  const fuzzyResult = fuse.search(workoutName);
  if (fuzzyResult.length > 0) {
    return fuzzyResult[0].item.workout_id;
  }

  // Create new workout
  const newWorkout = await prisma.workout.create({
    data: {
      workout_name: workoutName,
      routine_id: routineId,
    },
  });

  // Invalidate cache
  workoutCache.delete(`workouts:${routineId}`);

  return newWorkout.workout_id;
}

/**
 * Get all routines with their workout names for a user
 *
 * Optimized single query with proper select/include.
 */
export async function getRoutinesWithWorkouts(userId: string) {
  return prisma.routine.findMany({
    where: { user_id: userId },
    select: {
      routine_id: true,
      routine_name: true,
      Workout: {
        select: {
          workout_name: true,
        },
        distinct: ["workout_name"],
      },
    },
    orderBy: { date_created: "desc" },
  });
}

/**
 * Validate that a user owns a specific routine
 */
export async function validateRoutineOwnership(
  userId: string,
  routineId: string
): Promise<boolean> {
  const routine = await prisma.routine.findFirst({
    where: {
      routine_id: routineId,
      user_id: userId,
    },
    select: { routine_id: true },
  });

  return routine !== null;
}

/**
 * Validate that a user owns a specific workout (through routine)
 */
export async function validateWorkoutOwnership(
  userId: string,
  workoutId: string
): Promise<boolean> {
  const workout = await prisma.workout.findFirst({
    where: {
      workout_id: workoutId,
      routine: {
        user_id: userId,
      },
    },
    select: { workout_id: true },
  });

  return workout !== null;
}

/**
 * Clear all caches (useful for testing or manual refresh)
 */
export function clearLookupCaches(): void {
  routineCache.clear();
  workoutCache.clear();
}
