import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const userId = "user_37nKhyQh1e31YilWlgJ0TGVfabP";

async function checkDates() {
  // Get all sets with their workout info
  const sets = await prisma.set.findMany({
    include: {
      workout: {
        include: {
          routine: true
        }
      }
    },
    where: {
      workout: {
        routine: {
          user_id: userId
        }
      }
    },
    orderBy: { date: 'asc' }
  });

  console.log("Found " + sets.length + " total sets\n");

  // Group by date
  const byDate = {};
  for (const set of sets) {
    const dateStr = set.date.toISOString().split('T')[0];
    if (!byDate[dateStr]) {
      byDate[dateStr] = [];
    }
    byDate[dateStr].push({
      workout: set.workout.workout_name,
      reps: set.set_reps,
      weight: set.set_weight,
      routine: set.workout.routine?.routine_name
    });
  }

  console.log("Sets grouped by date:");
  for (const [date, setsList] of Object.entries(byDate)) {
    console.log("\n" + date + ": " + setsList.length + " sets");
    // Show first few
    setsList.slice(0, 5).forEach(s => {
      console.log("  - " + s.workout + ": " + s.reps + " reps @ " + s.weight + " lbs (" + s.routine + ")");
    });
    if (setsList.length > 5) {
      console.log("  ... and " + (setsList.length - 5) + " more");
    }
  }

  // Also check workout dates
  console.log("\n\n--- Workout Records ---");
  const workouts = await prisma.workout.findMany({
    where: {
      routine: {
        user_id: userId
      }
    },
    include: { routine: true },
    orderBy: { date: 'asc' }
  });

  const workoutsByDate = {};
  for (const w of workouts) {
    const dateStr = w.date.toISOString().split('T')[0];
    if (!workoutsByDate[dateStr]) {
      workoutsByDate[dateStr] = [];
    }
    workoutsByDate[dateStr].push(w.workout_name);
  }

  console.log("\nWorkout records grouped by date:");
  for (const [date, names] of Object.entries(workoutsByDate)) {
    const preview = names.slice(0, 5).join(', ');
    const suffix = names.length > 5 ? '...' : '';
    console.log(date + ": " + names.length + " workouts - " + preview + suffix);
  }

  await prisma.$disconnect();
}

checkDates();
