/**
 * Workouts API endpoint
 *
 * POST /api/workouts - Get workouts for a specific routine
 */

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { logger } from "@/lib/utils/logger";
import { WorkoutService } from "@/lib/services/workout.service";

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

    const workouts = await WorkoutService.getWorkoutsForRoutine(user.id, routineId);

    if (workouts === null) {
      logger.warn("Routine access denied", { source: "api/workouts", userId: user.id, routineId });
      return NextResponse.json({ error: "Routine not found" }, { status: 404 });
    }

    return NextResponse.json({ workouts });
  } catch (error) {
    logger.error("Error fetching workouts", { source: "api/workouts" }, error as Error);
    return NextResponse.json({ error: "Error fetching workouts" }, { status: 500 });
  }
}
