/**
 * Sets API endpoint
 *
 * POST /api/sets - Get sets for a specific workout
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

    const { workoutId } = await req.json();

    if (!workoutId) {
      return NextResponse.json({ error: "Workout ID is required" }, { status: 400 });
    }

    const sets = await WorkoutService.getSetsForWorkout(user.id, workoutId);

    if (sets === null) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    return NextResponse.json({ sets });
  } catch (error) {
    logger.error("Error fetching sets", { source: "api/sets" }, error as Error);
    return NextResponse.json({ error: "Error fetching sets" }, { status: 500 });
  }
}
