import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { importFromExcel, parseWorkoutsExcel } from "@/lib/import-workouts";
import path from "path";

// Force dynamic rendering - required for Clerk auth which reads headers
export const dynamic = "force-dynamic";

// GET: Preview what will be imported
export async function GET() {
  try {
    // Path to the Workouts.xlsx file (one directory up from workout-coach)
    const filePath = path.join(process.cwd(), "..", "Workouts.xlsx");

    const workouts = parseWorkoutsExcel(filePath);

    // Return preview data
    const preview = workouts.map((w) => ({
      templateName: w.templateName,
      sessionCount: w.sessions.length,
      dateRange: {
        earliest: w.sessions[0]?.date,
        latest: w.sessions[w.sessions.length - 1]?.date,
      },
      exercises: Array.from(
        new Set(w.sessions.flatMap((s) => s.sets.map((set) => set.exerciseName)))
      ),
      totalSets: w.sessions.reduce((sum, s) => sum + s.sets.length, 0),
    }));

    return NextResponse.json({
      success: true,
      preview,
      message: "Preview of data to import. POST to this endpoint to import.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Failed to read Excel file: ${error}`,
      },
      { status: 500 }
    );
  }
}

// POST: Actually import the data
export async function POST(_request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Path to the Workouts.xlsx file
    const filePath = path.join(process.cwd(), "..", "Workouts.xlsx");

    const result = await importFromExcel(userId, filePath);

    return NextResponse.json({
      success: result.success,
      imported: result.imported,
      errors: result.errors,
      message: result.success
        ? `Successfully imported ${result.imported} sets from Workouts.xlsx`
        : `Import completed with ${result.errors.length} errors`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `Import failed: ${error}`,
      },
      { status: 500 }
    );
  }
}
