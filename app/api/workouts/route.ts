/**
 * Workouts API endpoint
 *
 * POST /api/workouts - Get workouts for a specific routine
 *
 * Security: Validates that the routine belongs to the requesting user
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { validateRoutineOwnership } from "@/lib/db/lookups";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { routineId } = await req.json();

    if (!routineId) {
      return NextResponse.json({ error: "Routine ID is required" }, { status: 400 });
    }

    // Validate user owns this routine
    const isOwner = await validateRoutineOwnership(user.id, routineId);
    if (!isOwner) {
      logger.warn("Routine access denied", { source: "api/workouts", userId: user.id, routineId });
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    const workouts = await prisma.workout.findMany({
      where: {
        routine_id: routineId,
      },
    });

    return NextResponse.json({ workouts });
  } catch (error) {
    logger.error("Error fetching workouts", { source: "api/workouts" }, error as Error);
    return NextResponse.json({ error: "Error fetching workouts" }, { status: 500 });
  }
}
