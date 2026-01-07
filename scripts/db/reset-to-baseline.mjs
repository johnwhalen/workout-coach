import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const userId = "user_37nKhyQh1e31YilWlgJ0TGVfabP";
const baselineDate = new Date("2025-12-31T12:00:00Z");

async function resetToBaseline() {
  console.log("Resetting workout data to baseline...\n");

  // Step 1: Find the most recent workout session (by set date)
  const allSets = await prisma.set.findMany({
    where: {
      workout: {
        routine: {
          user_id: userId,
        },
      },
    },
    include: {
      workout: {
        include: {
          routine: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  if (allSets.length === 0) {
    console.log("No sets found to process.");
    await prisma.$disconnect();
    return;
  }

  // Get the most recent date
  const mostRecentDate = allSets[0].date.toISOString().split("T")[0];
  console.log("Most recent workout date: " + mostRecentDate);

  // Get all sets from the most recent workout session
  const recentSets = allSets.filter((s) => s.date.toISOString().split("T")[0] === mostRecentDate);
  console.log("Sets from most recent session: " + recentSets.length);

  // Get unique exercises from the most recent session
  const recentExercises = [...new Set(recentSets.map((s) => s.workout.workout_name))];
  console.log("Exercises in most recent session: " + recentExercises.join(", "));

  // Step 2: Delete all sets EXCEPT those from the most recent session
  const olderSets = allSets.filter((s) => s.date.toISOString().split("T")[0] !== mostRecentDate);

  console.log("\nDeleting " + olderSets.length + " older sets...");

  for (const set of olderSets) {
    await prisma.set.delete({
      where: { set_id: set.set_id },
    });
  }
  console.log("Deleted older sets.");

  // Step 3: Update the remaining sets to December 31, 2025
  console.log("\nUpdating " + recentSets.length + " sets to baseline date (Dec 31, 2025)...");

  for (const set of recentSets) {
    await prisma.set.update({
      where: { set_id: set.set_id },
      data: { date: baselineDate },
    });
  }
  console.log("Updated set dates.");

  // Step 4: Update the workout records for these exercises to the baseline date
  const workoutIds = [...new Set(recentSets.map((s) => s.workout_id))];
  console.log("\nUpdating " + workoutIds.length + " workout records to baseline date...");

  for (const workoutId of workoutIds) {
    await prisma.workout.update({
      where: { workout_id: workoutId },
      data: { date: baselineDate },
    });
  }
  console.log("Updated workout dates.");

  // Step 5: Clean up orphaned workouts (those with no sets, except templates)
  // We'll keep empty workouts that are part of the template routines

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("BASELINE RESET COMPLETE");
  console.log("=".repeat(50));
  console.log("\nYour baseline workout (Dec 31, 2025):");

  // Show what's in the baseline
  const baselineSets = await prisma.set.findMany({
    where: {
      workout: {
        routine: {
          user_id: userId,
        },
      },
    },
    include: {
      workout: true,
    },
    orderBy: [{ workout: { workout_name: "asc" } }, { set_id: "asc" }],
  });

  // Group by exercise
  const byExercise = {};
  for (const set of baselineSets) {
    const name = set.workout.workout_name;
    if (!byExercise[name]) {
      byExercise[name] = [];
    }
    byExercise[name].push(set);
  }

  for (const [exercise, sets] of Object.entries(byExercise)) {
    console.log("\n" + exercise + ":");
    sets.forEach((s, i) => {
      console.log("  Set " + (i + 1) + ": " + s.set_reps + " reps @ " + s.set_weight + " lbs");
    });
  }

  console.log(
    "\nTotal: " +
      baselineSets.length +
      " sets across " +
      Object.keys(byExercise).length +
      " exercises"
  );

  await prisma.$disconnect();
}

resetToBaseline();
