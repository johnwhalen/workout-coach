import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ParsedSet {
  exerciseName: string;
  supersetNumber: number;
  setNumber: number;
  weightLbs: number;
  reps: number;
  date: Date;
}

interface ParsedWorkout {
  templateName: string;
  sessions: {
    date: Date;
    sets: ParsedSet[];
  }[];
}

/**
 * Parse the Workouts.xlsx file and extract workout data
 *
 * Structure of Full Super A sheet:
 * - Column A (0): Superset number (1, 2, 3, 4)
 * - Column B (1): Set number within superset (1, 2, 3)
 * - Column C (2): Exercise name
 * - Column D (3): Base date (when exercise was added)
 * - Columns E+ : Date sessions with alternating weight/reps pairs
 */
export function parseWorkoutsExcel(filePath: string): ParsedWorkout[] {
  const workbook = XLSX.readFile(filePath);
  const results: ParsedWorkout[] = [];

  // Process "Full Super A" sheet (the main active one)
  const sheetName = "Full Super A";
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    console.error(`Sheet "${sheetName}" not found`);
    return results;
  }

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

  // Row 0: Empty or header
  // Row 1: Date row (dates in columns E, G, I, etc. - every other column)
  // Row 2+: Data rows

  const dateRow = data[0] as (string | Date | undefined)[];
  const sessions: Map<string, ParsedSet[]> = new Map();

  // Find all date columns (starting from column E, index 4)
  const dateColumns: { col: number; date: Date }[] = [];

  for (let col = 4; col < (dateRow?.length || 0); col += 2) {
    const cellValue = dateRow[col];
    if (cellValue) {
      let date: Date;
      if (cellValue instanceof Date) {
        date = cellValue;
      } else if (typeof cellValue === "string") {
        // Parse date strings like "25-01-02" (YY-MM-DD)
        const parts = cellValue.split("-");
        if (parts.length === 3) {
          const year = parseInt(parts[0]) + 2000;
          const month = parseInt(parts[1]) - 1;
          const day = parseInt(parts[2]);
          date = new Date(year, month, day);
        } else {
          date = new Date(cellValue);
        }
      } else if (typeof cellValue === "number") {
        // Excel serial date
        date = XLSX.SSF.parse_date_code(cellValue) as unknown as Date;
      } else {
        continue;
      }

      if (!isNaN(date.getTime())) {
        dateColumns.push({ col, date });
      }
    }
  }

  // Track current superset number for rows where it's not specified
  let currentSuperset = 0;

  // Process data rows (starting from row 2, index 2)
  for (let row = 2; row < data.length; row++) {
    const rowData = data[row] as (string | number | undefined)[];
    if (!rowData || rowData.length < 3) continue;

    // Column A: Superset number (may be empty if same as previous)
    const supersetCell = rowData[0];
    if (typeof supersetCell === "number") {
      currentSuperset = supersetCell;
    }

    // Column B: Set number
    const setNumber = typeof rowData[1] === "number" ? rowData[1] : 0;

    // Column C: Exercise name
    const exerciseName = rowData[2] as string;
    if (!exerciseName || typeof exerciseName !== "string") continue;

    // Process each date column
    for (const { col, date } of dateColumns) {
      const weightCell = rowData[col];
      const repsCell = rowData[col + 1];

      // Skip if no data for this date
      if (weightCell === undefined || weightCell === null || weightCell === "") continue;
      if (repsCell === undefined || repsCell === null || repsCell === "") continue;

      const weight = typeof weightCell === "number" ? weightCell : parseFloat(String(weightCell));
      const reps = typeof repsCell === "number" ? repsCell : parseInt(String(repsCell));

      if (isNaN(weight) || isNaN(reps)) continue;

      const dateKey = date.toISOString().split("T")[0];

      if (!sessions.has(dateKey)) {
        sessions.set(dateKey, []);
      }

      sessions.get(dateKey)!.push({
        exerciseName,
        supersetNumber: currentSuperset,
        setNumber,
        weightLbs: weight,
        reps,
        date,
      });
    }
  }

  // Convert to ParsedWorkout format
  const workout: ParsedWorkout = {
    templateName: sheetName,
    sessions: Array.from(sessions.entries())
      .map(([dateKey, sets]) => ({
        date: new Date(dateKey),
        sets,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime()),
  };

  results.push(workout);
  return results;
}

/**
 * Import parsed workout data into the database
 */
export async function importWorkoutsToDatabase(
  userId: string,
  workouts: ParsedWorkout[]
): Promise<{ imported: number; errors: string[] }> {
  const errors: string[] = [];
  let imported = 0;

  for (const workout of workouts) {
    // Create or find routine
    let routine = await prisma.routine.findFirst({
      where: {
        user_id: userId,
        routine_name: workout.templateName,
      },
    });

    if (!routine) {
      routine = await prisma.routine.create({
        data: {
          routine_name: workout.templateName,
          user_id: userId,
        },
      });
    }

    // Import each session
    for (const session of workout.sessions) {
      // Group sets by exercise
      const exerciseGroups = new Map<string, ParsedSet[]>();
      for (const set of session.sets) {
        if (!exerciseGroups.has(set.exerciseName)) {
          exerciseGroups.set(set.exerciseName, []);
        }
        exerciseGroups.get(set.exerciseName)!.push(set);
      }

      // Create workout for each exercise
      for (const [exerciseName, sets] of Array.from(exerciseGroups.entries())) {
        try {
          const workoutRecord = await prisma.workout.create({
            data: {
              workout_name: exerciseName,
              routine_id: routine.routine_id,
              date: session.date,
              notes: `Imported from Workouts.xlsx`,
            },
          });

          // Create sets
          for (const set of sets) {
            await prisma.set.create({
              data: {
                workout_id: workoutRecord.workout_id,
                set_weight: set.weightLbs,
                set_reps: set.reps,
                date: session.date,
              },
            });
            imported++;
          }
        } catch (error) {
          errors.push(`Error importing ${exerciseName} on ${session.date}: ${error}`);
        }
      }
    }
  }

  await prisma.$disconnect();
  return { imported, errors };
}

/**
 * Main function to import workouts from Excel file
 */
export async function importFromExcel(
  userId: string,
  filePath: string
): Promise<{ success: boolean; imported: number; errors: string[] }> {
  try {
    console.log(`Parsing Excel file: ${filePath}`);
    const workouts = parseWorkoutsExcel(filePath);

    console.log(`Found ${workouts.length} workout templates`);
    for (const w of workouts) {
      console.log(`  - ${w.templateName}: ${w.sessions.length} sessions`);
    }

    console.log("Importing to database...");
    const result = await importWorkoutsToDatabase(userId, workouts);

    console.log(`Imported ${result.imported} sets`);
    if (result.errors.length > 0) {
      console.log(`Errors: ${result.errors.length}`);
    }

    return {
      success: result.errors.length === 0,
      imported: result.imported,
      errors: result.errors,
    };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      errors: [`Failed to import: ${error}`],
    };
  }
}

// Export types
export type { ParsedSet, ParsedWorkout };
