import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Workout templates from Workouts.xlsx
const templates = [
  {
    name: "Full Super B",
    exercises: [
      "Bulgarian Split Squats",
      "Single-Leg Romanian Deadlifts",
      "Incline Dumbbell Press",
      "Dumbbell Rows",
      "Lateral Raises",
      "Face Pulls",
      "Hammer Curls",
      "Overhead Tricep Extension",
    ],
  },
  {
    name: "3-Day Fullbody A",
    exercises: [
      "Barbell Bench Press",
      "Barbell Back Squat",
      "Pull-Ups",
      "Hamstring Curls",
      "Overhead Press",
      "Facepulls",
      "Barbell Deadlift",
      "Incline Dumbbell Press",
      "Bulgarian Split Squat",
      "Chest Supported Row",
      "Dumbbell Lateral Raises",
    ],
  },
  {
    name: "5-Day Upper-Lower-Push-Pull-Legs",
    exercises: [
      // Upper
      "Bench Press",
      "Overhead Press",
      "Rows",
      "Pull-Ups",
      "Lateral Raises",
      "Bicep Curls",
      "Tricep Extensions",
      // Lower
      "Squats",
      "Romanian Deadlifts",
      "Leg Press",
      "Hamstring Curls",
      "Calf Raises",
      // Push
      "Incline Press",
      "Dumbbell Press",
      "Chest Flyes",
      "Shoulder Press",
      "Tricep Dips",
      // Pull
      "Deadlift",
      "Barbell Rows",
      "Lat Pulldown",
      "Face Pulls",
      "Hammer Curls",
      // Legs
      "Front Squats",
      "Lunges",
      "Leg Extensions",
      "Glute Bridges",
    ],
  },
  {
    name: "6-Day Push-Pull-Legs",
    exercises: [
      // Push
      "Flat Bench Press",
      "Incline Dumbbell Press",
      "Cable Flyes",
      "Overhead Press",
      "Lateral Raises",
      "Tricep Pushdowns",
      // Pull
      "Deadlift",
      "Bent Over Rows",
      "Lat Pulldown",
      "Face Pulls",
      "Barbell Curls",
      "Hammer Curls",
      // Legs
      "Squats",
      "Leg Press",
      "Romanian Deadlifts",
      "Leg Curls",
      "Calf Raises",
      "Lunges",
    ],
  },
];

async function addRoutineTemplates(userId) {
  console.log(`Adding routine templates for user: ${userId}\n`);

  for (const template of templates) {
    // Check if routine already exists
    const existing = await prisma.routine.findFirst({
      where: {
        user_id: userId,
        routine_name: template.name,
      },
    });

    if (existing) {
      console.log(`Routine "${template.name}" already exists, skipping...`);
      continue;
    }

    // Create the routine
    const routine = await prisma.routine.create({
      data: {
        routine_name: template.name,
        user_id: userId,
      },
    });

    console.log(`Created routine: ${template.name}`);

    // Add exercises as workouts (without any sets - just the structure)
    const uniqueExercises = [...new Set(template.exercises)];
    for (const exerciseName of uniqueExercises) {
      await prisma.workout.create({
        data: {
          workout_name: exerciseName,
          routine_id: routine.routine_id,
          date: new Date(),
          notes: "Template exercise - no sets logged yet",
        },
      });
    }

    console.log(`  Added ${uniqueExercises.length} exercises`);
  }

  console.log("\nDone!");
  await prisma.$disconnect();
}

const userId = process.argv[2] || "user_37nKhyQh1e31YilWlgJ0TGVfabP";
addRoutineTemplates(userId);
