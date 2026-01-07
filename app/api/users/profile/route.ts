/**
 * User Profile API endpoint
 *
 * GET /api/users/profile - Get the current user's fitness profile
 * POST /api/users/profile - Update the current user's fitness profile
 */

import prisma from "@/prisma/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const FitnessProfileSchema = z.object({
  currentWeight: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num < 1000;
    },
    { message: "Weight must be between 0 and 1000 lbs" }
  ),
  height: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num < 300;
    },
    { message: "Height must be between 0 and 300 cm" }
  ),
  goalWeight: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num < 1000;
    },
    { message: "Goal weight must be between 0 and 1000 lbs" }
  ),
  fitnessGoal: z.enum(["lose_weight", "gain_weight", "maintain_weight", "add_muscle"]),
});

export async function GET(request: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "User Not Signed In" }, { status: 401 });
  }

  try {
    const userProfile = await prisma.user.findUnique({
      where: {
        user_id: user.id,
      },
      select: {
        current_weight: true,
        height: true,
        goal_weight: true,
        fitness_goal: true,
        profile_complete: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Error fetching fitness profile:", error);
    return NextResponse.json({ error: "Failed to fetch fitness profile" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "User Not Signed In" }, { status: 401 });
  }

  try {
    const reqBody = await request.json();
    const parseResult = FitnessProfileSchema.safeParse(reqBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { currentWeight, height, goalWeight, fitnessGoal } = parseResult.data;

    const updatedUser = await prisma.user.update({
      where: {
        user_id: user.id,
      },
      data: {
        current_weight: parseFloat(currentWeight),
        height: parseFloat(height),
        goal_weight: parseFloat(goalWeight),
        fitness_goal: fitnessGoal,
        profile_complete: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "Fitness profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating fitness profile:", error);
    return NextResponse.json({ error: "Failed to update fitness profile" }, { status: 500 });
  }
}
