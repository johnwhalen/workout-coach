/**
 * Routines API endpoint
 *
 * GET /api/routines - Get all routines for the authenticated user
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const routines = await prisma.routine.findMany({
      where: {
        user_id: user.id,
      },
    });

    return NextResponse.json({ routines });
  } catch (error) {
    logger.error("Error fetching routines", { source: "api/routines" }, error as Error);
    return NextResponse.json({ error: "Error fetching routines" }, { status: 500 });
  }
}
