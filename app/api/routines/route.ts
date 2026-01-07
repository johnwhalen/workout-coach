/**
 * Routines API endpoint
 *
 * GET /api/routines - Get all routines for the authenticated user
 */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/prisma";
import { currentUser } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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
    console.error("Error fetching routines:", error);
    return NextResponse.json({ error: "Error fetching routines" }, { status: 500 });
  }
}
