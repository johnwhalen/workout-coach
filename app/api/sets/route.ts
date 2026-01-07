/**
 * Sets API endpoint
 *
 * POST /api/sets - Get sets for a specific workout
 *
 * Security: Validates that the workout belongs to the requesting user
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { validateWorkoutOwnership } from "@/lib/db/lookups";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workoutId } = await req.json();

    if (!workoutId) {
      return NextResponse.json({ error: "Workout ID is required" }, { status: 400 });
    }

    // Validate user owns this workout (through routine)
    const isOwner = await validateWorkoutOwnership(user.id, workoutId);
    if (!isOwner) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    const sets = await prisma.set.findMany({
      where: {
        workout_id: workoutId,
      },
    });

    return NextResponse.json({ sets });
  } catch (error) {
    logger.error("Error fetching sets", { source: "api/sets" }, error as Error);
    return NextResponse.json({ error: "Error fetching sets" }, { status: 500 });
  }
}
