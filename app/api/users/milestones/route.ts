/**
 * User Milestones API endpoint
 *
 * GET /api/users/milestones - Get current user's milestones
 * POST /api/users/milestones - Create a new milestone
 * PATCH /api/users/milestones - Update a milestone (e.g. toggle completion)
 */

import prisma from "@/prisma/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/utils/logger";

export const dynamic = "force-dynamic";

const CreateMilestoneSchema = z.object({
  description: z.string().min(1, "Description is required"),
  targetValue: z.number().optional(),
  targetMetric: z.string().optional(),
});

const UpdateMilestoneSchema = z.object({
  id: z.string(),
  isCompleted: z.boolean().optional(),
  description: z.string().optional(),
  targetValue: z.number().nullable().optional(), // Allow clearing the value
  targetMetric: z.string().nullable().optional(),
});

export async function GET(_request: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "User Not Signed In" }, { status: 401 });
  }

  try {
    const milestones = await prisma.userMilestone.findMany({
      where: {
        user_id: user.id,
      },
      orderBy: {
        is_completed: "asc", // Show uncompleted first
      },
    });

    return NextResponse.json({
      success: true,
      data: milestones,
    });
  } catch (error) {
    logger.error("Error fetching milestones", { source: "api/users/milestones" }, error as Error);
    return NextResponse.json({ error: "Failed to fetch milestones" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "User Not Signed In" }, { status: 401 });
  }

  try {
    const reqBody = await request.json();
    const parseResult = CreateMilestoneSchema.safeParse(reqBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { description, targetValue, targetMetric } = parseResult.data;

    const milestone = await prisma.userMilestone.create({
      data: {
        user_id: user.id,
        description,
        target_value: targetValue,
        target_metric: targetMetric,
      },
    });

    return NextResponse.json({
      success: true,
      data: milestone,
      message: "Milestone created successfully",
    });
  } catch (error) {
    logger.error("Error creating milestone", { source: "api/users/milestones" }, error as Error);
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "User Not Signed In" }, { status: 401 });
  }

  try {
    const reqBody = await request.json();
    const parseResult = UpdateMilestoneSchema.safeParse(reqBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { id, isCompleted, description, targetValue, targetMetric } = parseResult.data;

    // Verify ownership
    const existingMilestone = await prisma.userMilestone.findUnique({
      where: { id },
    });

    if (!existingMilestone || existingMilestone.user_id !== user.id) {
      return NextResponse.json({ error: "Milestone not found or unauthorized" }, { status: 404 });
    }

    const updateData: {
      is_completed?: boolean;
      completed_at?: Date | null;
      description?: string;
      target_value?: number | null;
      target_metric?: string | null;
    } = {};
    if (isCompleted !== undefined) {
      updateData.is_completed = isCompleted;
      updateData.completed_at = isCompleted ? new Date() : null;
    }
    if (description !== undefined) updateData.description = description;
    if (targetValue !== undefined) updateData.target_value = targetValue;
    if (targetMetric !== undefined) updateData.target_metric = targetMetric;

    const updatedMilestone = await prisma.userMilestone.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedMilestone,
      message: "Milestone updated successfully",
    });
  } catch (error) {
    logger.error("Error updating milestone", { source: "api/users/milestones" }, error as Error);
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 });
  }
}
