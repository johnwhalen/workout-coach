/**
 * Integration tests for /api/chat route
 */

import { mockPrisma, resetPrismaMocks } from "../../mocks/prisma";
import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { POST } from "@/app/api/chat/route";
import { NextRequest } from "next/server";
import { processWithAI } from "@/lib/ai";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { currentUser } from "@clerk/nextjs/server";
import * as dbLookups from "@/lib/db/lookups";

// Mock AI processor
vi.mock("@/lib/ai", () => ({
  processWithAI: vi.fn(),
}));

// Mock Rate Limiter
vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: vi.fn(),
  getRateLimitHeaders: vi.fn().mockReturnValue({ "X-Rate-Limit": "test" }),
}));

// Mock lookups
vi.mock("@/lib/db/lookups", () => ({
  findOrCreateRoutine: vi.fn(),
  findOrCreateWorkout: vi.fn(),
  validateRoutineOwnership: vi.fn(),
  validateWorkoutOwnership: vi.fn(),
}));

describe("Chat API Route", () => {
  beforeEach(() => {
    resetPrismaMocks();
    vi.clearAllMocks();

    // Default rate limit allow
    (checkRateLimit as Mock).mockReturnValue({ allowed: true, remaining: 5, resetIn: 60 });

    // Default auth
    vi.mocked(currentUser).mockResolvedValue({
      id: "test-user-id",
      emailAddresses: [{ emailAddress: "test@example.com" }],
    } as any);
  });

  const createRequest = (body: any) => {
    return new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify(body),
    });
  };

  it("returns 401 if user is not authenticated", async () => {
    vi.mocked(currentUser).mockResolvedValue(null);

    const req = createRequest({ prompt: "Hello" });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 429 if rate limited", async () => {
    (checkRateLimit as Mock).mockReturnValue({ allowed: false, remaining: 0, resetIn: 60 });

    const req = createRequest({ prompt: "Hello" });
    const res = await POST(req);

    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain("Too many requests");
  });

  it("returns 400 for invalid request body", async () => {
    const req = createRequest({}); // Missing prompt
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid request");
  });

  it("streams AI response successfully", async () => {
    const mockAIResult = {
      action: "fitness_question",
      response: "Keep up the good work!",
    };
    (processWithAI as Mock).mockResolvedValue(mockAIResult);

    const req = createRequest({ prompt: "How am I doing?" });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/event-stream");

    // Read stream
    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let output = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      output += decoder.decode(value);
    }

    expect(output).toContain('"type":"start"');
    expect(output).toContain('"type":"complete"');
    expect(output).toContain("Keep up the good work!");
  });

  it("handles exercise logging action", async () => {
    const mockAIResult = {
      action: "log_workout",
      workoutName: ["Bench Press"],
      sets: [{ reps: 10, weight: 135 }],
      routineName: "Push Day",
      message: "Logged your bench press!",
    };
    (processWithAI as Mock).mockResolvedValue(mockAIResult);

    vi.mocked(dbLookups.findOrCreateRoutine).mockResolvedValue("routine-123");
    vi.mocked(dbLookups.findOrCreateWorkout).mockResolvedValue("workout-456");

    const req = createRequest({ prompt: "Log bench press 135 for 10" });
    const res = await POST(req);

    expect(res.status).toBe(200);

    // Must read the stream to completion to ensure async work inside start() is finished
    const reader = res.body?.getReader();
    while (true) {
      const { done } = await reader!.read();
      if (done) break;
    }

    // Check if prisma.set.create was called (via WorkoutService -> ChatActionHandler)
    expect(mockPrisma.set.create).toHaveBeenCalled();
  });
});
