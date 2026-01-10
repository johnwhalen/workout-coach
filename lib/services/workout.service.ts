/**
 * Workout Service
 *
 * Handles business logic for workout operations including logging,
 * calorie tracking, and set management.
 */

import prisma from "@/prisma/prisma";
import {
  findOrCreateRoutine,
  findOrCreateWorkout,
  validateRoutineOwnership,
  validateWorkoutOwnership,
} from "@/lib/db/lookups";
import type { WorkoutSet } from "@/types/ai";

export class WorkoutService {
  /**
   * Log a workout with its sets and optional calories
   */
  static async logWorkout({
    userId,
    workoutName,
    sets,
    routineName,
    date,
    totalCalories,
  }: {
    userId: string;
    workoutName?: string[];
    sets?: WorkoutSet[];
    routineName?: string;
    date?: string;
    totalCalories?: number;
  }) {
    const rName = routineName || "General Workout";
    const wName = workoutName?.[0] || "Workout";
    const workoutDate = date ? new Date(date) : new Date();

    const routineId = await findOrCreateRoutine(userId, rName);
    const workoutId = await findOrCreateWorkout(userId, routineId, wName);

    // Update total calories if provided
    if (totalCalories) {
      await prisma.workout.update({
        where: { workout_id: workoutId },
        data: { total_calories_burned: totalCalories },
      });
    }

    // Create sets if provided
    if (sets && sets.length > 0) {
      await Promise.all(
        sets.map((set) =>
          prisma.set.create({
            data: {
              workout_id: workoutId,
              set_reps: set.reps,
              set_weight: parseFloat(String(set.weight)),
              calories_burned: set.calories || null,
              date: workoutDate,
            },
          })
        )
      );
    }

    return { routineId, workoutId };
  }

  /**
   * Get workouts for a specific routine
   */
  static async getWorkoutsForRoutine(userId: string, routineId: string) {
    // Validate ownership before fetching
    const isOwner = await validateRoutineOwnership(userId, routineId);
    if (!isOwner) return null;

    return prisma.workout.findMany({
      where: { routine_id: routineId },
    });
  }

  /**
   * Get sets for a specific workout
   */
  static async getSetsForWorkout(userId: string, workoutId: string) {
    // Validate ownership before fetching
    const isOwner = await validateWorkoutOwnership(userId, workoutId);
    if (!isOwner) return null;

    return prisma.set.findMany({
      where: { workout_id: workoutId },
    });
  }

  /**
   * Delete a workout
   */
  static async deleteWorkout(workoutId: string) {
    return prisma.workout.delete({
      where: { workout_id: workoutId },
    });
  }

  /**
   * Update workout notes
   */
  static async updateWorkoutNotes(workoutId: string, notes: string) {
    return prisma.workout.update({
      where: { workout_id: workoutId },
      data: { notes },
    });
  }
}
