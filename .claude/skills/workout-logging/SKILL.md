---
name: workout-logging
description: Parse and log natural language workout entries to the database. Use when user says "I did", "log workout", "record sets", "add exercise", or describes exercises with sets/reps/weight.
---

# Workout Logging

Parse natural language workout descriptions and save them to the database.

## Trigger Phrases

- "I did 3 sets of bench press at 135 lbs"
- "Log my workout: squats 185x8, 185x8, 185x6"
- "Record today's chest workout"
- "Add 4 sets of rows at 40 lbs, 10 reps each"

## Instructions

### 1. Parse Exercise Data

Extract from user input:

- **Exercise name**: Match against existing workouts using Fuse.js fuzzy search
- **Sets**: Number of sets performed
- **Reps**: Repetitions per set (can vary per set)
- **Weight**: Weight used (in lbs)
- **Date**: Workout date (default: today)
- **Routine name**: Optional, default "General Workout"

### 2. Match to Database Records

Use the fuzzy matching pattern from `@/lib/ai`:

```typescript
const fuse = new Fuse(workouts, { keys: ["workout_name"], threshold: 0.4 });
const result = fuse.search(exerciseName);
```

### 3. Database Structure

```
Routine (routine_name, user_id)
  └── Workout (workout_name, routine_id, date)
        └── Set (set_reps, set_weight, workout_id, date)
```

### 4. Save to Database

Via API: `POST /api/handler-stream`

- Creates Routine if not exists
- Creates Workout if not exists
- Creates Set records for each set

### 5. Confirmation Response

Return summary:

- Exercise logged
- Total sets/reps
- Weight used
- Any progressive overload notes

## Example Parsing

Input: "I did bench press today: 135x10, 135x8, 135x6"

Extracted:

```json
{
  "workoutName": "Bench Press",
  "routineName": "General Workout",
  "date": "2025-01-06",
  "sets": [
    { "reps": 10, "weight": 135 },
    { "reps": 8, "weight": 135 },
    { "reps": 6, "weight": 135 }
  ]
}
```

## Related Files

- [app/api/handler-stream/route.ts](app/api/handler-stream/route.ts) - Main API endpoint
- [lib/ai.ts](lib/ai.ts) - AI processing logic
- [prisma/schema.prisma](prisma/schema.prisma) - Database schema
