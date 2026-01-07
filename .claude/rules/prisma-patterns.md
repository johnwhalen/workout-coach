---
paths:
  - prisma/**
  - app/api/**/*.ts
  - lib/**/*.ts
---

# Prisma Database Patterns

## Schema Conventions

- Use `@id @unique @default(uuid())` for primary keys
- Name ID fields as `{model}_id` (e.g., `workout_id`, `routine_id`)
- Use `@default(now())` for timestamp fields
- Make optional fields nullable with `?`

## Relationships

```
User → Routine → Workout → Set
```

- User owns Routines (1:many via `user_id`)
- Routine contains Workouts (1:many via `routine_id`)
- Workout contains Sets (1:many via `workout_id`)

## Client Usage

- Import from `@/prisma/prisma` (singleton instance)
- Use `findMany` with `where` for filtered queries
- Use `create` with `data` object for inserts
- Use `update` with `where` and `data` for updates

## Fuzzy Matching Pattern

When matching user input to existing records:

```typescript
import Fuse from "fuse.js";

const records = await prisma.model.findMany({ where: { ... } });
const fuse = new Fuse(records, { keys: ["name_field"], threshold: 0.4 });
const result = fuse.search(searchTerm);
if (result.length > 0) {
    return result[0].item.id;
}
// Create new record if no match
```

## Date Handling

- Store dates as `DateTime` type
- Parse user dates with `new Date(dateString)`
- Default to `new Date()` for current timestamp

## Common Queries

```typescript
// Get user's routines
const routines = await prisma.routine.findMany({
  where: { user_id: userId },
});

// Get workouts for a routine
const workouts = await prisma.workout.findMany({
  where: { routine_id: routineId },
});

// Create a set
await prisma.set.create({
  data: {
    workout_id,
    set_reps: reps,
    set_weight: parseFloat(weight),
    date: new Date(),
    calories_burned: null,
  },
});
```

## Bulk Operations

Use `Promise.all` for creating multiple records:

```typescript
await Promise.all(
    sets.map(set => prisma.set.create({ data: { ... } }))
);
```
