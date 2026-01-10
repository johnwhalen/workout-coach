/**
 * Integration tests for WorkoutService
 *
 * Tests the service layer with mocked Prisma client.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockPrisma, resetPrismaMocks, testData } from "../../mocks/prisma";

// Must import after mocks are set up
import { WorkoutService } from "@/lib/services/workout.service";

// Mock the lookups module
vi.mock("@/lib/db/lookups", () => ({
  findOrCreateRoutine: vi.fn().mockResolvedValue("test-routine-id"),
  findOrCreateWorkout: vi.fn().mockResolvedValue("test-workout-id"),
  validateRoutineOwnership: vi.fn().mockResolvedValue(true),
  validateWorkoutOwnership: vi.fn().mockResolvedValue(true),
}));

describe("WorkoutService", () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
  });

  describe("logWorkout", () => {
    it("creates sets when provided", async () => {
      mockPrisma.set.create.mockResolvedValue(testData.set());

      const result = await WorkoutService.logWorkout({
        userId: "test-user-id",
        workoutName: ["Bench Press"],
        sets: [
          { reps: 10, weight: 135 },
          { reps: 8, weight: 145 },
        ],
        routineName: "Push Day",
      });

      expect(result.routineId).toBe("test-routine-id");
      expect(result.workoutId).toBe("test-workout-id");
      expect(mockPrisma.set.create).toHaveBeenCalledTimes(2);
    });

    it("updates total calories when provided", async () => {
      mockPrisma.workout.update.mockResolvedValue(testData.workout());

      await WorkoutService.logWorkout({
        userId: "test-user-id",
        workoutName: ["Cardio"],
        totalCalories: 350,
      });

      expect(mockPrisma.workout.update).toHaveBeenCalledWith({
        where: { workout_id: "test-workout-id" },
        data: { total_calories_burned: 350 },
      });
    });

    it("uses default routine name when not provided", async () => {
      const { findOrCreateRoutine } = await import("@/lib/db/lookups");

      await WorkoutService.logWorkout({
        userId: "test-user-id",
      });

      expect(findOrCreateRoutine).toHaveBeenCalledWith("test-user-id", "General Workout");
    });
  });

  describe("getWorkoutsForRoutine", () => {
    it("returns workouts when user owns routine", async () => {
      const workouts = [testData.workout(), testData.workout({ workout_name: "Squats" })];
      mockPrisma.workout.findMany.mockResolvedValue(workouts);

      const result = await WorkoutService.getWorkoutsForRoutine("test-user-id", "test-routine-id");

      expect(result).toEqual(workouts);
      expect(mockPrisma.workout.findMany).toHaveBeenCalledWith({
        where: { routine_id: "test-routine-id" },
      });
    });

    it("returns null when user does not own routine", async () => {
      const { validateRoutineOwnership } = await import("@/lib/db/lookups");
      vi.mocked(validateRoutineOwnership).mockResolvedValueOnce(false);

      const result = await WorkoutService.getWorkoutsForRoutine("other-user", "test-routine-id");

      expect(result).toBeNull();
      expect(mockPrisma.workout.findMany).not.toHaveBeenCalled();
    });
  });

  describe("getSetsForWorkout", () => {
    it("returns sets when user owns workout", async () => {
      const sets = [testData.set(), testData.set({ set_reps: 8 })];
      mockPrisma.set.findMany.mockResolvedValue(sets);

      const result = await WorkoutService.getSetsForWorkout("test-user-id", "test-workout-id");

      expect(result).toEqual(sets);
    });

    it("returns null when user does not own workout", async () => {
      const { validateWorkoutOwnership } = await import("@/lib/db/lookups");
      vi.mocked(validateWorkoutOwnership).mockResolvedValueOnce(false);

      const result = await WorkoutService.getSetsForWorkout("other-user", "test-workout-id");

      expect(result).toBeNull();
    });
  });

  describe("deleteWorkout", () => {
    it("deletes the workout by ID", async () => {
      mockPrisma.workout.delete.mockResolvedValue(testData.workout());

      await WorkoutService.deleteWorkout("test-workout-id");

      expect(mockPrisma.workout.delete).toHaveBeenCalledWith({
        where: { workout_id: "test-workout-id" },
      });
    });
  });
});
