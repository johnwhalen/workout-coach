/**
 * Integration tests for /api/workouts, /api/sets, and /api/routines routes
 */

import { mockPrisma, resetPrismaMocks, testData } from "../../mocks/prisma";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST as POSTWorkouts } from "@/app/api/workouts/route";
import { POST as POSTSets } from "@/app/api/sets/route";
import { GET as GETRoutines } from "@/app/api/routines/route";
import { NextRequest } from "next/server";
import * as dbLookups from "@/lib/db/lookups";

// Mock lookups
vi.mock("@/lib/db/lookups", () => ({
  validateRoutineOwnership: vi.fn(),
  validateWorkoutOwnership: vi.fn(),
  findOrCreateRoutine: vi.fn(),
  findOrCreateWorkout: vi.fn(),
}));

describe("Resource API Routes", () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
  });

  describe("GET /api/routines", () => {
    it("returns routines for the authenticated user", async () => {
      const mockRoutines = [testData.routine()];
      mockPrisma.routine.findMany.mockResolvedValue(mockRoutines);

      const req = new NextRequest("http://localhost:3000/api/routines");
      const res = await GETRoutines(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.routines).toHaveLength(1);
      expect(data.routines[0].routine_name).toBe("Test Routine");
    });
  });

  describe("POST /api/workouts", () => {
    it("returns workouts for a valid routine", async () => {
      const mockWorkouts = [testData.workout()];
      mockPrisma.workout.findMany.mockResolvedValue(mockWorkouts);

      vi.mocked(dbLookups.validateRoutineOwnership).mockResolvedValue(true);

      const req = new NextRequest("http://localhost:3000/api/workouts", {
        method: "POST",
        body: JSON.stringify({ routineId: "test-routine-id" }),
      });
      const res = await POSTWorkouts(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.workouts).toHaveLength(1);
    });

    it("returns 404 if user doesn't own routine", async () => {
      vi.mocked(dbLookups.validateRoutineOwnership).mockResolvedValue(false);

      const req = new NextRequest("http://localhost:3000/api/workouts", {
        method: "POST",
        body: JSON.stringify({ routineId: "other-routine" }),
      });
      const res = await POSTWorkouts(req);

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/sets", () => {
    it("returns sets for a valid workout", async () => {
      const mockSets = [testData.set()];
      mockPrisma.set.findMany.mockResolvedValue(mockSets);

      vi.mocked(dbLookups.validateWorkoutOwnership).mockResolvedValue(true);

      const req = new NextRequest("http://localhost:3000/api/sets", {
        method: "POST",
        body: JSON.stringify({ workoutId: "test-workout-id" }),
      });
      const res = await POSTSets(req);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.sets).toHaveLength(1);
    });

    it("returns 404 if user doesn't own workout", async () => {
      vi.mocked(dbLookups.validateWorkoutOwnership).mockResolvedValue(false);

      const req = new NextRequest("http://localhost:3000/api/sets", {
        method: "POST",
        body: JSON.stringify({ workoutId: "other-workout" }),
      });
      const res = await POSTSets(req);

      expect(res.status).toBe(404);
    });
  });
});
