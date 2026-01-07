import XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

function parseDate(value) {
  if (!value) return null;

  // Already a Date object
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // String like "25-01-02" (YY-MM-DD)
  if (typeof value === "string") {
    const parts = value.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0]) + 2000;
      const month = parseInt(parts[1]) - 1;
      const day = parseInt(parts[2]);
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    }
    // Try parsing as regular date string
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  // Excel serial number
  if (typeof value === "number") {
    const utc_days = Math.floor(value - 25569);
    const utc_value = utc_days * 86400;
    const date = new Date(utc_value * 1000);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function parseWorkoutsExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const results = [];

  const sheetName = "Full Super A";
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    console.error(`Sheet "${sheetName}" not found`);
    console.log("Available sheets:", workbook.SheetNames);
    return results;
  }

  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Row structure:
  // Row 0: Title ("Workout A")
  // Row 1: Dates (in columns 4, 6, 8, 10, 14, 16, 18, etc.)
  // Row 2: Headers ("lbs", "Reps", etc.)
  // Row 3+: Data (superset#, set#, exercise, basedate, weight, reps, weight, reps, ...)

  const dateRow = data[1];  // Row 1 has dates
  const sessions = new Map();

  // Find all date columns with data
  const dateColumns = [];

  console.log("\nScanning for workout dates...");

  for (let col = 4; col < (dateRow?.length || 0); col += 2) {
    const cellValue = dateRow[col];
    const date = parseDate(cellValue);

    if (date) {
      dateColumns.push({ col, date });
      console.log(`  Found date at col ${col}: ${date.toDateString()}`);
    }
  }

  console.log(`\nFound ${dateColumns.length} workout sessions`);

  if (dateColumns.length === 0) {
    console.log("No dates found. Date row values:", dateRow?.slice(0, 20));
    return results;
  }

  let currentSuperset = 0;

  // Process data rows starting at row 3 (index 3)
  for (let row = 3; row < data.length; row++) {
    const rowData = data[row];
    if (!rowData || rowData.length < 3) continue;

    const supersetCell = rowData[0];
    if (typeof supersetCell === "number") {
      currentSuperset = supersetCell;
    }

    const setNumber = typeof rowData[1] === "number" ? rowData[1] : 0;
    const exerciseName = rowData[2];
    if (!exerciseName || typeof exerciseName !== "string") continue;

    for (const { col, date } of dateColumns) {
      const weightCell = rowData[col];
      const repsCell = rowData[col + 1];

      if (weightCell === undefined || weightCell === null || weightCell === "") continue;
      if (repsCell === undefined || repsCell === null || repsCell === "") continue;

      const weight = typeof weightCell === "number" ? weightCell : parseFloat(String(weightCell));
      const reps = typeof repsCell === "number" ? repsCell : parseInt(String(repsCell));

      if (isNaN(weight) || isNaN(reps)) continue;

      const dateKey = date.toISOString().split("T")[0];

      if (!sessions.has(dateKey)) {
        sessions.set(dateKey, []);
      }

      sessions.get(dateKey).push({
        exerciseName,
        supersetNumber: currentSuperset,
        setNumber,
        weightLbs: weight,
        reps,
        date,
      });
    }
  }

  const workout = {
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

async function importWorkouts(userId) {
  const filePath = path.join(__dirname, "..", "..", "Workouts.xlsx");
  console.log(`Reading Excel file: ${filePath}`);

  const workouts = parseWorkoutsExcel(filePath);

  console.log(`\nFound ${workouts.length} workout templates`);
  for (const w of workouts) {
    console.log(`  - ${w.templateName}: ${w.sessions.length} sessions`);

    if (w.sessions.length > 0) {
      const exercises = [...new Set(w.sessions.flatMap(s => s.sets.map(set => set.exerciseName)))];
      console.log(`    Exercises: ${exercises.join(", ")}`);

      const totalSets = w.sessions.reduce((sum, s) => sum + s.sets.length, 0);
      console.log(`    Total sets to import: ${totalSets}`);

      console.log(`    Date range: ${w.sessions[0].date.toDateString()} to ${w.sessions[w.sessions.length - 1].date.toDateString()}`);
    }
  }

  let imported = 0;
  const errors = [];

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
      console.log(`\nCreated routine: ${workout.templateName}`);
    } else {
      console.log(`\nUsing existing routine: ${workout.templateName}`);
    }

    // Import each session
    let sessionCount = 0;
    for (const session of workout.sessions) {
      const exerciseGroups = new Map();
      for (const set of session.sets) {
        if (!exerciseGroups.has(set.exerciseName)) {
          exerciseGroups.set(set.exerciseName, []);
        }
        exerciseGroups.get(set.exerciseName).push(set);
      }

      for (const [exerciseName, sets] of exerciseGroups) {
        try {
          const workoutRecord = await prisma.workout.create({
            data: {
              workout_name: exerciseName,
              routine_id: routine.routine_id,
              date: session.date,
              notes: `Imported from Workouts.xlsx`,
            },
          });

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
      sessionCount++;
      process.stdout.write(`\r  Imported session ${sessionCount}/${workout.sessions.length}...`);
    }
    console.log(`\n  Completed ${sessionCount} sessions`);
  }

  console.log(`\n========================================`);
  console.log(`Total sets imported: ${imported}`);
  if (errors.length > 0) {
    console.log(`Errors: ${errors.length}`);
    errors.slice(0, 5).forEach((e) => console.log(`  - ${e}`));
    if (errors.length > 5) {
      console.log(`  ... and ${errors.length - 5} more`);
    }
  }
  console.log(`========================================`);

  await prisma.$disconnect();
}

// Get user ID from command line or use the one we found
const userId = process.argv[2] || "user_37nKhyQh1e31YilWlgJ0TGVfabP";
console.log(`Importing workouts for user: ${userId}\n`);

importWorkouts(userId)
  .then(() => {
    console.log("\nImport complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Import failed:", error);
    process.exit(1);
  });
