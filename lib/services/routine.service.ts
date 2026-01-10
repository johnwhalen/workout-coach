/**
 * Routine Service
 *
 * Handles business logic for workout routines.
 */

import prisma from "@/prisma/prisma";
import { findOrCreateRoutine, validateRoutineOwnership } from "@/lib/db/lookups";

export class RoutineService {
  /**
   * Get all routines for a user
   */
  static async getRoutinesForUser(userId: string) {
    return prisma.routine.findMany({
      where: { user_id: userId },
      orderBy: { date_created: "desc" },
    });
  }

  /**
   * Create a new routine
   */
  static async createRoutine(userId: string, name: string) {
    return findOrCreateRoutine(userId, name);
  }

  /**
   * Delete a routine and its associated workouts/sets (handled by Prisma cascade or manual deletion)
   */
  static async deleteRoutine(userId: string, routineId: string) {
    const isOwner = await validateRoutineOwnership(userId, routineId);
    if (!isOwner) throw new Error("Routine not found or not owned by user");

    return prisma.routine.delete({
      where: { routine_id: routineId },
    });
  }
}
