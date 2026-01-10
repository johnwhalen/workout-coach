# Workout Table Display in Chat

**Status**: Planned  
**Created**: 2026-01-10

## Problem

When users ask the AI coach to share their workout, the AI responds with text descriptions but doesn't display the actual workout exercises in a structured, readable format. Users have to repeatedly ask "What is the first set?" or "Please share the entire workout step-by-step" without getting a clear tabular view.

**Current behavior**: AI describes the workout conversationally but doesn't render exercise details.  
**Desired behavior**: AI should display workouts in a clear tabular format within the chat.

---

## User Requirements

- Display workouts in a **table format** within chat messages
- Include exercise name, sets, reps, weight, and notes
- Support both:
  - **Recommended workouts** (when AI generates a workout plan)
  - **Logged workouts** (when reviewing what was done today)
- Visually distinct from regular text messages

---

## Proposed Solution

### Option A: Markdown Tables in AI Response

Teach the AI to format workouts as markdown tables, then render markdown in chat messages.

**Pros**: Simple, uses existing markdown rendering  
**Cons**: Limited styling, may not parse correctly

### Option B: Structured Workout Component

Add a new message type that renders a `WorkoutTableDisplay` component when the AI includes workout data.

**Pros**: Rich, interactive UI; consistent styling with app  
**Cons**: Requires AI response format changes

### Option C: Hybrid Approach (Recommended)

1. Update AI prompt to include workout data in structured JSON within responses
2. Parse chat messages for workout data blocks
3. Render `WorkoutTableDisplay` component inline when detected

---

## Implementation Plan

### Phase 1: Update AI Prompt System

**Modify `lib/ai/prompts.ts`:**

Add instructions for the AI to include structured workout data when sharing workouts:

```typescript
// Add to system prompt
When sharing a workout plan or exercise list, include a JSON block in this format:
\`\`\`workout
{
  "title": "Full Body Comeback Workout",
  "exercises": [
    { "name": "Hydrow Warmup", "duration": "5-10 min", "notes": "Conversational pace" },
    { "name": "Bench Press", "sets": 3, "reps": 10, "weight": "11 lbs" },
    { "name": "Goblet Squats", "sets": 3, "reps": 10, "weight": "15 lbs" }
  ]
}
\`\`\`
```

---

### Phase 2: Create Workout Table Component

**New file: `components/chat/WorkoutTableDisplay.tsx`**

```tsx
interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: string;
  duration?: string;
  notes?: string;
}

interface WorkoutTableDisplayProps {
  title?: string;
  exercises: Exercise[];
}

export function WorkoutTableDisplay({ title, exercises }: WorkoutTableDisplayProps) {
  return (
    <div className="workout-table bg-slate-800/50 rounded-xl p-4 my-2">
      {title && <h3 className="text-amber-500 font-semibold mb-3">{title}</h3>}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400 border-b border-slate-700">
            <th className="text-left py-2">Exercise</th>
            <th className="text-center py-2">Sets</th>
            <th className="text-center py-2">Reps</th>
            <th className="text-center py-2">Weight</th>
            <th className="text-left py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((ex, i) => (
            <tr key={i} className="border-b border-slate-700/50">
              <td className="py-2 text-white font-medium">{ex.name}</td>
              <td className="py-2 text-center text-slate-300">{ex.sets || "-"}</td>
              <td className="py-2 text-center text-slate-300">{ex.reps || "-"}</td>
              <td className="py-2 text-center text-amber-400">{ex.weight || ex.duration || "-"}</td>
              <td className="py-2 text-slate-400 text-xs">{ex.notes || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### Phase 3: Parse and Render Workout Blocks in Chat

**New file: `lib/chat/parseWorkoutBlocks.ts`**

````typescript
export interface WorkoutBlock {
  title?: string;
  exercises: Exercise[];
}

export function parseWorkoutBlocks(content: string): {
  text: string;
  workouts: WorkoutBlock[];
} {
  const workoutRegex = /```workout\n([\s\S]*?)```/g;
  const workouts: WorkoutBlock[] = [];

  const text = content.replace(workoutRegex, (_, json) => {
    try {
      workouts.push(JSON.parse(json));
      return ""; // Remove from text, will render as component
    } catch {
      return _; // Keep invalid blocks as-is
    }
  });

  return { text: text.trim(), workouts };
}
````

**Modify `components/chat/ChatMessageBubble.tsx`** (or equivalent):

- Import `parseWorkoutBlocks` and `WorkoutTableDisplay`
- Parse message content for workout blocks
- Render `WorkoutTableDisplay` components for each found workout

---

### Phase 4: Testing

1. Ask AI: "What's my workout for today?"
2. Ask AI: "Create a full body workout"
3. Ask AI: "Show me what I logged today"
4. Verify table renders correctly in all cases

---

## Files to Create/Modify

| File                                      | Changes                                        |
| ----------------------------------------- | ---------------------------------------------- |
| `components/chat/WorkoutTableDisplay.tsx` | **NEW** - Table component for exercises        |
| `lib/chat/parseWorkoutBlocks.ts`          | **NEW** - Parser for workout JSON blocks       |
| `lib/ai/prompts.ts`                       | Add instructions for structured workout output |
| `components/chat/ChatMessageBubble.tsx`   | Parse and render workout blocks                |
| `types/chat.ts`                           | Add `WorkoutBlock` and `Exercise` types        |

---

## Acceptance Criteria

- [ ] AI includes structured workout data when sharing exercise plans
- [ ] Workout tables render inline in chat messages
- [ ] Tables are styled consistently with app theme (dark, glassmorphic)
- [ ] Tables show: Exercise, Sets, Reps, Weight, Notes
- [ ] Works for both recommended and logged workouts
- [ ] Mobile-responsive table layout

---

## Design Notes

**Table styling should match existing UI:**

- Background: `bg-slate-800/50`
- Border radius: `rounded-xl`
- Header text: `text-amber-500`
- Accent color for weights: `text-amber-400`
- Subtle row borders: `border-slate-700/50`

---

## Future Enhancements

- [ ] Add "Copy workout" button
- [ ] Add "Log this workout" quick action
- [ ] Collapsible sections for supersets
- [ ] Rep/weight input fields for real-time logging
