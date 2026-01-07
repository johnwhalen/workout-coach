---
name: metrics-analysis
description: Analyze workout trends and progress metrics. Use when user asks "how am I progressing", "show my progress", "workout trends", "strength gains", "training analysis", or wants to see their fitness data.
---

# Metrics Analysis

Analyze workout history and provide insights on progress.

## Trigger Phrases

- "How am I progressing on bench press?"
- "Show my workout trends"
- "What are my strength gains this month?"
- "Analyze my training history"
- "Am I getting stronger?"

## Available Metrics

### Per-Exercise Metrics

- **Volume**: Total sets x reps x weight
- **1RM Estimate**: Calculated from best set
- **Rep PR**: Highest reps at a given weight
- **Weight PR**: Heaviest weight lifted
- **Consistency**: Sessions per week/month

### Overall Metrics

- **Total workouts** (by date range)
- **Exercises performed**
- **Total volume** (all exercises)
- **Training frequency**
- **Most trained muscle groups**

## Data Queries

### Recent Workout History

```typescript
const sets = await prisma.set.findMany({
  where: {
    workout: {
      routine: { user_id: userId },
    },
    date: { gte: startDate },
  },
  include: {
    workout: true,
  },
  orderBy: { date: "desc" },
});
```

### Exercise Progress

```typescript
const progress = await prisma.set.findMany({
  where: {
    workout: {
      workout_name: { contains: exerciseName },
      routine: { user_id: userId },
    },
  },
  orderBy: { date: "asc" },
});
```

## Analysis Types

### 1. Single Exercise Progress

```
Bench Press Progress (Last 30 Days):
- Started: 115 lbs x 10
- Current: 135 lbs x 10
- Improvement: +20 lbs (+17%)
- Sessions: 6
- Trend: Consistent progression
```

### 2. Weekly Summary

```
This Week's Training:
- Workouts: 3
- Total sets: 45
- Volume: 12,500 lbs
- Exercises: Bench, Rows, Squats, Curls

Compared to last week:
- Volume: +8%
- Frequency: Same
```

### 3. Monthly Trends

```
January 2025 Overview:
- Total workouts: 12
- Most trained: Chest (18 sets), Back (15 sets)
- PRs set: 3
- Consistency: 3x/week average

Recommendations:
- Legs could use more attention (only 8 sets)
- Great chest progress - keep it up!
```

## Visualization Notes

The `/metrics` page displays charts for:

- Weight progression over time
- Volume by muscle group
- Training frequency calendar
- PR history

## Response Format

```
Here's your bench press analysis:

📈 Progress (Last 4 Weeks):
Week 1: 125 lbs x 8 (est. 1RM: 156 lbs)
Week 2: 130 lbs x 8 (est. 1RM: 162 lbs)
Week 3: 130 lbs x 10 (est. 1RM: 173 lbs)
Week 4: 135 lbs x 8 (est. 1RM: 169 lbs)

💪 Strength Gain: +13 lbs estimated 1RM (+8%)
📊 Volume Trend: Increasing
🎯 Next Goal: Hit 135 x 10 to unlock 140 lbs

Keep pushing! You're making solid progress.
```

## Related Files

- [app/metrics/page.tsx](app/metrics/page.tsx) - Metrics dashboard
- [app/api/sets/displaysets/route.ts](app/api/sets/displaysets/route.ts) - Sets API
