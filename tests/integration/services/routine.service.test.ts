/**
 * Integration tests for RoutineService
 *
 * Tests the service layer with mocked Prisma client.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockPrisma, resetPrismaMocks, testData } from "../../mocks/prisma";

// Must import after mocks are set up
import { RoutineService } from "@/lib/services/routine.service";

// Mock the lookups module
vi.mock("@/lib/db/lookups", () => ({
  findOrCreateRoutine: vi.fn().mockResolvedValue("new-routine-id"),
  validateRoutineOwnership: vi.fn().mockResolvedValue(true),
}));

describe("RoutineService", () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();
  });

  describe("getRoutinesForUser", () => {
    it("returns all routines for a user ordered by date", async () => {
      const routines = [
        testData.routine({ routine_name: "Push Day" }),
        testData.routine({ routine_name: "Pull Day" }),
      ];
      mockPrisma.routine.findMany.mockResolvedValue(routines);

      const result = await RoutineService.getRoutinesForUser("test-user-id");

      expect(result).toEqual(routines);
      expect(mockPrisma.routine.findMany).toHaveBeenCalledWith({
        where: { user_id: "test-user-id" },
        orderBy: { date_created: "desc" },
      });
    });

    it("returns empty array when user has no routines", async () => {
      mockPrisma.routine.findMany.mockResolvedValue([]);

      const result = await RoutineService.getRoutinesForUser("new-user-id");

      expect(result).toEqual([]);
    });
  });

  describe("createRoutine", () => {
    it("creates a new routine using findOrCreateRoutine", async () => {
      const result = await RoutineService.createRoutine("test-user-id", "Leg Day");

      expect(result).toBe("new-routine-id");
    });
  });

  describe("deleteRoutine", () => {
    it("deletes routine when user owns it", async () => {
      mockPrisma.routine.delete.mockResolvedValue(testData.routine());

      await RoutineService.deleteRoutine("test-user-id", "test-routine-id");

      expect(mockPrisma.routine.delete).toHaveBeenCalledWith({
        where: { routine_id: "test-routine-id" },
      });
    });

    it("throws error when user does not own routine", async () => {
      const { validateRoutineOwnership } = await import("@/lib/db/lookups");
      vi.mocked(validateRoutineOwnership).mockResolvedValueOnce(false);

      await expect(RoutineService.deleteRoutine("other-user", "test-routine-id")).rejects.toThrow(
        "Routine not found or not owned by user"
      );
    });
  });
});
