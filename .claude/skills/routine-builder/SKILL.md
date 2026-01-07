---
name: routine-builder
description: Create and modify workout routines. Use when user says "create routine", "add exercise to routine", "build workout plan", "modify my routine", or wants to organize their training program.
---

# Routine Builder

Create, modify, and manage workout routines.

## Trigger Phrases

- "Create a new push day routine"
- "Add deadlifts to my Full Body A routine"
- "Build me a 3-day workout plan"
- "What exercises are in my chest routine?"
- "Remove lunges from leg day"

## User Equipment Context

From user profile:

- **Hydrow rowing machine** (water resistance)
- **Adjustable bench** (incline/flat/decline)
- **Dumbbells** up to 55 lbs

## Routine Structure

```
Routine
├── Name (e.g., "Full Super A", "Push Day")
├── User ID
└── Workouts (exercises)
    ├── Bench Press
    ├── Rows
    ├── Squats
    └── ...
```

## Pre-Built Routines

User has these routines imported:

1. Full Super A
2. Full Super B
3. 3-Day Full Body (A/B/C)
4. General Workout (catch-all)

## Creating a New Routine

### 1. Gather Requirements

- Routine name/type (push/pull/legs/full body)
- Target muscle groups
- Available equipment
- Frequency (how many days/week)

### 2. Exercise Selection

Match equipment to exercises:
| Equipment | Exercises |
|-----------|-----------|
| Dumbbells | Bench press, rows, curls, shoulder press, lunges, goblet squats |
| Bench | Incline press, decline press, flyes, skull crushers |
| Hydrow | Rowing intervals, warm-up, cardio finisher |

### 3. Database Operations

```typescript
// Create routine
await prisma.routine.create({
  data: {
    routine_name: name,
    user_id: userId,
  },
});

// Add workout/exercise to routine
await prisma.workout.create({
  data: {
    workout_name: exerciseName,
    routine_id: routineId,
    date: new Date(),
  },
});
```

## Example Full Body Routine

```
Full Body A
├── Hydrow Warm-up (5 min)
├── Dumbbell Bench Press (3x10)
├── Dumbbell Rows (3x10)
├── Goblet Squats (3x12)
├── Shoulder Press (3x10)
├── Dumbbell Curls (2x12)
├── Tricep Extensions (2x12)
└── Hydrow Cool-down (5 min)
```

## Response Format

```
I've created your new routine "Push Day":

1. Incline Dumbbell Press - 3 sets x 10 reps
2. Flat Dumbbell Press - 3 sets x 10 reps
3. Dumbbell Flyes - 3 sets x 12 reps
4. Shoulder Press - 3 sets x 10 reps
5. Lateral Raises - 3 sets x 15 reps
6. Tricep Extensions - 3 sets x 12 reps

Ready to log a workout from this routine? Just tell me what you did!
```

## Related Files

- [app/api/routine/](app/api/routine/) - Routine API endpoints
- [prisma/schema.prisma](prisma/schema.prisma) - Database schema
