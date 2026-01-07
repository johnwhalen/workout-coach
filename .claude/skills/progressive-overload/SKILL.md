---
name: progressive-overload
description: Calculate progressive overload recommendations for exercises. Use when user asks "what should I lift", "progression", "what weight next time", "how much should I increase", or wants workout recommendations.
---

# Progressive Overload Calculator

Recommend weight/rep progressions based on workout history.

## Trigger Phrases

- "What should I lift for bench press today?"
- "How much should I increase my squat?"
- "What's my progression for deadlift?"
- "Recommend weights for today's workout"

## Progressive Overload Logic

### Standard Progression (Completed All Reps)

```
IF completed all target reps last session:
  - Suggest +2.5-5 lbs for upper body
  - Suggest +5-10 lbs for lower body
  - OR +1-2 reps at same weight
```

### Returning from Break

```
IF returning after 1-2 week break:
  - Start at 90% of last recorded weight
IF returning after 2-4 week break:
  - Start at 75% of last recorded weight
IF returning after 1+ month break:
  - Start at 50-60% of last recorded weight
```

### Incomplete Reps

```
IF missed target reps:
  - Maintain same weight next session
IF missed by 3+ reps:
  - Reduce weight by 5-10%
```

### Check-in Adjustments

Based on pre-workout check-in:

- **Energy: Low** → Reduce planned weight by 10-20%
- **Energy: Great** → Can push +5% beyond recommendation
- **Soreness: High** → Focus on form, reduce volume
- **Sleep: Poor** → Conservative weights, extra rest

## Data Requirements

Query from database:

- Last 3-5 sessions for the exercise
- Reps achieved vs target
- Weight used
- Date of last session (calculate break duration)

## Example Calculation

Last session (Jan 3): Bench Press 135 lbs x 10, 10, 8
Target was: 3x10

Recommendation for Jan 6:

```
- Achieved 28/30 reps (93%)
- Not all sets complete
- Recommendation: Stay at 135 lbs, aim for 3x10
- If you hit 3x10: next session try 140 lbs
```

## Response Format

```
Based on your last bench press session:
- You lifted 135 lbs for 10, 10, 8 reps
- Today's recommendation: 135 lbs for 3 sets of 10
- Once you hit 3x10, increase to 140 lbs

Your check-in shows good energy - you're cleared to push it!
```

## Related Files

- [lib/ai.ts](lib/ai.ts) - Recommendation logic
- [CLAUDE.md](CLAUDE.md) - Progressive overload rules
