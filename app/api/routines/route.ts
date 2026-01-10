/**
 * Routines API endpoint
 *
 * GET /api/routines - Get all routines for the authenticated user
 */

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { logger } from "@/lib/utils/logger";
import { RoutineService } from "@/lib/services/routine.service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const routines = await RoutineService.getRoutinesForUser(user.id);

    return NextResponse.json({ routines });
  } catch (error) {
    logger.error("Error fetching routines", { source: "api/routines" }, error as Error);
    return NextResponse.json({ error: "Error fetching routines" }, { status: 500 });
  }
}
