import prisma from "@/prisma/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";

// Force dynamic rendering - required for Clerk auth which reads headers
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all workouts for the user with their sets
    const workouts = await prisma.workout.findMany({
      where: {
        routine: {
          user_id: user.id,
        },
      },
      include: {
        Set: true,
        routine: {
          select: {
            routine_name: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Group workouts by date
    type WorkoutSummary = {
      workout_id: string;
      workout_name: string;
      routine_name: string;
      date: Date;
      duration_minutes: number | null;
      notes: string | null;
      total_calories_burned: number | null;
      workout_type: string | null;
      sets_count: number;
      total_reps: number;
      total_weight: number;
    };
    const workoutsByDate = workouts.reduce(
      (acc: Record<string, WorkoutSummary[]>, workout: (typeof workouts)[number]) => {
        const dateKey = workout.date.toISOString().split("T")[0]; // YYYY-MM-DD format

        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }

        acc[dateKey].push({
          workout_id: workout.workout_id,
          workout_name: workout.workout_name,
          routine_name: workout.routine.routine_name,
          date: workout.date,
          duration_minutes: workout.duration_minutes,
          notes: workout.notes,
          total_calories_burned: workout.total_calories_burned,
          workout_type: workout.workout_type,
          sets_count: workout.Set.length,
          total_reps: workout.Set.reduce(
            (sum: number, set: (typeof workout.Set)[number]) => sum + set.set_reps,
            0
          ),
          total_weight: workout.Set.reduce(
            (sum: number, set: (typeof workout.Set)[number]) => sum + set.set_weight * set.set_reps,
            0
          ),
        });

        return acc;
      },
      {} as Record<string, WorkoutSummary[]>
    );

    return NextResponse.json({
      success: true,
      workoutsByDate,
      totalWorkoutDays: Object.keys(workoutsByDate).length,
      totalWorkouts: workouts.length,
    });
  } catch (error) {
    logger.error(
      "Error fetching workouts by date",
      { source: "api/workouts/by-date" },
      error as Error
    );
    return NextResponse.json({ error: "Error fetching workouts by date" }, { status: 500 });
  }
}
