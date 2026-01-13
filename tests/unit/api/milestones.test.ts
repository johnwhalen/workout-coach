import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, PATCH } from "@/app/api/users/milestones/route";
import { NextRequest } from "next/server";
import prisma from "@/prisma/prisma";
import * as clerk from "@clerk/nextjs/server";

// Mock Prisma
vi.mock("@/prisma/prisma", () => ({
  default: {
    userMilestone: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock Logger
vi.mock("@/lib/utils/logger", () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe("Milestones API", () => {
  const mockUserId = "test-user-id";

  beforeEach(() => {
    vi.clearAllMocks();
    // Default currentUser mock from vitest.setup.ts returns test-user-id
  });

  describe("GET", () => {
    it("returns milestones for authenticated user", async () => {
      const mockMilestones = [
        {
          id: "1",
          user_id: mockUserId,
          description: "Bench Press 25lbs",
          target_value: null,
          target_metric: null,
          is_completed: false,
          completed_at: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "2",
          user_id: mockUserId,
          description: "Run 5k",
          target_value: null,
          target_metric: null,
          is_completed: true,
          completed_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      vi.mocked(prisma.userMilestone.findMany).mockResolvedValue(mockMilestones);

      const request = new NextRequest("http://localhost:3000/api/users/milestones");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockMilestones);
      expect(prisma.userMilestone.findMany).toHaveBeenCalledWith({
        where: { user_id: mockUserId },
        orderBy: { is_completed: "asc" },
      });
    });

    it("returns 401 if not authenticated", async () => {
      vi.spyOn(clerk, "currentUser").mockResolvedValueOnce(null);

      const request = new NextRequest("http://localhost:3000/api/users/milestones");
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe("POST", () => {
    it("creates a new milestone", async () => {
      const newMilestone = {
        description: "New Goal",
        targetValue: 100,
        targetMetric: "lbs",
      };

      const createdMilestone = {
        id: "1",
        user_id: mockUserId,
        description: newMilestone.description,
        target_value: newMilestone.targetValue,
        target_metric: newMilestone.targetMetric,
        is_completed: false,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      vi.mocked(prisma.userMilestone.create).mockResolvedValue(createdMilestone);

      const request = new NextRequest("http://localhost:3000/api/users/milestones", {
        method: "POST",
        body: JSON.stringify(newMilestone),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(createdMilestone);
      expect(prisma.userMilestone.create).toHaveBeenCalledWith({
        data: {
          user_id: mockUserId,
          description: "New Goal",
          target_value: 100,
          target_metric: "lbs",
        },
      });
    });

    it("returns 400 for invalid input", async () => {
      const request = new NextRequest("http://localhost:3000/api/users/milestones", {
        method: "POST",
        body: JSON.stringify({}), // Missing description
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe("PATCH", () => {
    it("updates an existing milestone", async () => {
      const updateData = {
        id: "1",
        isCompleted: true,
      };

      vi.mocked(prisma.userMilestone.findUnique).mockResolvedValue({
        id: "1",
        user_id: mockUserId,
        description: "Test",
        target_value: null,
        target_metric: null,
        is_completed: false,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      vi.mocked(prisma.userMilestone.update).mockResolvedValue({
        id: "1",
        user_id: mockUserId,
        description: "Test",
        target_value: null,
        target_metric: null,
        is_completed: true,
        completed_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      });

      const request = new NextRequest("http://localhost:3000/api/users/milestones", {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.userMilestone.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: expect.objectContaining({
          is_completed: true,
        }),
      });
    });

    it("returns 404 if milestone not found or unauthorized", async () => {
      vi.mocked(prisma.userMilestone.findUnique).mockResolvedValue({
        id: "1",
        user_id: "other-user", // Different user
        description: "Test",
        target_value: null,
        target_metric: null,
        is_completed: false,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const request = new NextRequest("http://localhost:3000/api/users/milestones", {
        method: "PATCH",
        body: JSON.stringify({ id: "1", isCompleted: true }),
      });

      const response = await PATCH(request);
      expect(response.status).toBe(404);
    });
  });
});
