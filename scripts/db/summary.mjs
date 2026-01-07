import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const userId = "user_37nKhyQh1e31YilWlgJ0TGVfabP";

async function summary() {
  // Get routines
  const routines = await prisma.routine.findMany({
    where: { user_id: userId },
    include: { Workout: { include: { Set: true } } },
  });

  console.log("=".repeat(50));
  console.log("DATABASE SUMMARY");
  console.log("=".repeat(50));
  console.log("");
  console.log("ROUTINES (" + routines.length + " total):");

  for (const r of routines) {
    const workoutCount = r.Workout.length;
    const setCount = r.Workout.reduce((sum, w) => sum + w.Set.length, 0);
    console.log(
      "  - " + r.routine_name + ": " + workoutCount + " exercises, " + setCount + " logged sets"
    );
  }

  // Get total sets
  const totalSets = await prisma.set.count({
    where: { workout: { routine: { user_id: userId } } },
  });

  console.log("");
  console.log("TOTAL LOGGED SETS: " + totalSets);
  console.log("");

  await prisma.$disconnect();
}
summary();
