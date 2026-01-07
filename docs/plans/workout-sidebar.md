# Today's Workout Sidebar Feature

**Status**: Planned
**Created**: 2026-01-06

## Overview

Add a collapsible sidebar to the chat page that displays today's workout summary with exercise-level detail and real-time updates when workouts are logged.

## User Requirements

- **Placement**: Collapsible sidebar panel
- **Detail level**: Exercise summary (exercise names with total sets/reps/weight per exercise)
- **Updates**: Real-time refresh when AI confirms a logged workout

---

## Implementation Plan

### Phase 1: Create Sidebar Components

**New files in `components/chat/`:**

#### 1. `WorkoutSummaryCard.tsx`

Display a single exercise with aggregated metrics:

```
┌─────────────────────────────┐
│ Bench Press      [Routine]  │
│ ┌─────┐ ┌─────┐ ┌─────────┐│
│ │3 sets│ │24 reps│ │1,800 lbs││
│ └─────┘ └─────┘ └─────────┘│
└─────────────────────────────┘
```

#### 2. `WorkoutSidebar.tsx`

Main sidebar container with:

- Header with "Today's Workout" title and toggle button
- List of `WorkoutSummaryCard` components
- Loading skeleton state
- Empty state ("No workouts logged today")
- Uses `/api/workouts/by-date` filtered to today's date

**Props:**

```typescript
interface WorkoutSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  refreshTrigger: number; // Increment to trigger refetch
}
```

---

### Phase 2: Add Real-Time Update Signal to API

**Modify `app/api/chat/route.ts` (lines 225-233):**

Add `workoutLogged: true` flag to the SSE response when a workout is saved:

```typescript
// In the log_workout action block
controller.enqueue(
  encoder.encode(
    `data: ${JSON.stringify({
      type: "complete",
      message: responseMessage,
      isComplete: true,
      workoutLogged: true, // NEW: Signal to refresh sidebar
    })}\n\n`
  )
);
```

---

### Phase 3: Integrate Sidebar into Chat Page

**Modify `app/chat/page.tsx`:**

1. **Add new state variables:**

```typescript
const [sidebarOpen, setSidebarOpen] = useState(() => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("workoutSidebarOpen") !== "false";
  }
  return true;
});
const [sidebarRefreshTrigger, setSidebarRefreshTrigger] = useState(0);
```

2. **Persist sidebar state to localStorage:**

```typescript
useEffect(() => {
  localStorage.setItem("workoutSidebarOpen", String(sidebarOpen));
}, [sidebarOpen]);
```

3. **Update layout structure:**

```tsx
<div className="fixed inset-0 flex bg-slate-900 p-4">
  <WorkoutSidebar
    isOpen={sidebarOpen}
    onToggle={() => setSidebarOpen(!sidebarOpen)}
    refreshTrigger={sidebarRefreshTrigger}
  />
  <div className="flex-1 flex items-center justify-center">
    {/* Existing chat content with adjusted max-width */}
  </div>
</div>
```

4. **Add refresh trigger in SSE handler (around line 249-267):**

```typescript
if (data.type === "complete") {
  // ... existing logic ...
  if (data.workoutLogged) {
    setSidebarRefreshTrigger((prev) => prev + 1);
  }
}
```

---

### Phase 4: Styling

**Sidebar design (glassmorphic, matching existing UI):**

- Width: `w-80` (320px) when open, `w-0` when closed
- Transition: `transition-all duration-300 ease-in-out`
- Background: `bg-slate-800/50 backdrop-blur-lg`
- Border: `border border-slate-700 rounded-2xl`

**Responsive behavior:**

- Desktop (lg+): Sidebar pushes chat area
- Mobile: Overlay with backdrop click to close

---

## Files to Modify

| File                                     | Changes                                                 |
| ---------------------------------------- | ------------------------------------------------------- |
| `components/chat/WorkoutSidebar.tsx`     | **NEW** - Main sidebar component                        |
| `components/chat/WorkoutSummaryCard.tsx` | **NEW** - Exercise card component                       |
| `app/api/chat/route.ts`                  | Add `workoutLogged: true` to SSE response (line 230)    |
| `app/chat/page.tsx`                      | Add sidebar state, layout changes, refresh trigger      |
| `types/api.ts`                           | Add `workoutLogged?: boolean` to `ChatStreamEvent` type |

---

## Data Flow

```
User logs workout → POST /api/chat → AI processes → Database save
                                                          ↓
SSE: { type: "complete", workoutLogged: true } ← ────────┘
                    ↓
Client increments refreshTrigger
                    ↓
WorkoutSidebar useEffect triggers
                    ↓
GET /api/workouts/by-date → Filter to today → Update display
```

---

## Empty State

```
┌───────────────────────────┐
│     (dumbbell icon)       │
│                           │
│  No workouts logged today │
│                           │
│  Tell me what you did to  │
│  get started!             │
└───────────────────────────┘
```

---

## Implementation Order

1. Create `components/chat/WorkoutSummaryCard.tsx`
2. Create `components/chat/WorkoutSidebar.tsx`
3. Update `types/api.ts` with new field
4. Modify `app/api/chat/route.ts` to add `workoutLogged` flag
5. Modify `app/chat/page.tsx` to integrate sidebar
6. Test real-time updates
