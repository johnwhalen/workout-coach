import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const userId = "user_37nKhyQh1e31YilWlgJ0TGVfabP";

async function analyzeAndCleanup() {
  console.log("Analyzing workout data...\n");

  // Find workouts with no sets (these are templates)
  const workoutsWithSets = await prisma.workout.findMany({
    where: {
      routine: {
        user_id: userId,
      },
    },
    include: {
      Set: true,
      routine: true,
    },
  });

  const emptyWorkouts = workoutsWithSets.filter((w) => w.Set.length === 0);
  const workoutsWithData = workoutsWithSets.filter((w) => w.Set.length > 0);

  console.log("Total workouts: " + workoutsWithSets.length);
  console.log("Workouts with logged sets: " + workoutsWithData.length);
  console.log("Empty template workouts: " + emptyWorkouts.length);

  // Group empty workouts by routine
  const emptyByRoutine = {};
  for (const w of emptyWorkouts) {
    const routineName = w.routine?.routine_name || "Unknown";
    if (!emptyByRoutine[routineName]) {
      emptyByRoutine[routineName] = [];
    }
    emptyByRoutine[routineName].push(w.workout_name);
  }

  console.log("\nEmpty workouts by routine:");
  for (const [routine, exercises] of Object.entries(emptyByRoutine)) {
    console.log("  " + routine + ": " + exercises.length + " exercises");
    exercises.slice(0, 5).forEach((e) => console.log("    - " + e));
    if (exercises.length > 5) {
      console.log("    ... and " + (exercises.length - 5) + " more");
    }
  }

  // Ask before deleting
  console.log("\n" + "=".repeat(50));
  console.log("The empty template workouts were created by add-routine-templates.mjs");
  console.log("These contain exercise names but no logged sets.");
  console.log("\nTo delete these empty templates, run:");
  console.log("  node scripts/cleanup-templates.mjs --delete");
  console.log("=".repeat(50));

  // Check if --delete flag was passed
  if (process.argv.includes("--delete")) {
    console.log("\nDeleting " + emptyWorkouts.length + " empty template workouts...");

    for (const workout of emptyWorkouts) {
      await prisma.workout.delete({
        where: { workout_id: workout.workout_id },
      });
    }

    console.log("Done! Deleted " + emptyWorkouts.length + " empty workouts.");
  }

  await prisma.$disconnect();
}

analyzeAndCleanup();
