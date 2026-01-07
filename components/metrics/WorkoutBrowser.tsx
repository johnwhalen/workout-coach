"use client";

/**
 * WorkoutBrowser Component
 *
 * Displays routines, workouts, and sets in a drill-down hierarchy.
 */

import type { Routine, Workout, Set } from "@/types/database";

// Styles
const subtitleStyle = "font-bold text-lg mb-4 text-white font-bricolage-grotesque";
const itemStyle =
  "bg-slate-800/80 hover:bg-blue-600/30 cursor-pointer p-4 rounded-xl mb-3 text-white border border-blue-900/20 shadow transition-all duration-150";
const emptyStateStyle = "text-gray-500 italic";

interface WorkoutBrowserProps {
  routines: Routine[];
  workouts: Workout[];
  sets: Set[];
  selectedRoutine: Routine | null;
  selectedWorkout: Workout | null;
  onSelectRoutine: (routine: Routine) => void;
  onSelectWorkout: (workout: Workout) => void;
  onBackToRoutines: () => void;
  onBackToWorkouts: () => void;
}

export function WorkoutBrowser({
  routines,
  workouts,
  sets,
  selectedRoutine,
  selectedWorkout,
  onSelectRoutine,
  onSelectWorkout,
  onBackToRoutines,
  onBackToWorkouts,
}: WorkoutBrowserProps) {
  if (!selectedRoutine) {
    return <RoutineList routines={routines} onSelect={onSelectRoutine} />;
  }

  if (!selectedWorkout) {
    return (
      <div>
        <WorkoutList workouts={workouts} onSelect={onSelectWorkout} />
        <BackButton onClick={onBackToRoutines} label="Back to Routines" />
      </div>
    );
  }

  return (
    <div>
      <SetList sets={sets} />
      <BackButton onClick={onBackToWorkouts} label="Back to Workouts" />
    </div>
  );
}

interface RoutineListProps {
  routines: Routine[];
  onSelect: (routine: Routine) => void;
}

function RoutineList({ routines, onSelect }: RoutineListProps) {
  return (
    <div>
      <h2 className={subtitleStyle}>Your Routines</h2>
      {routines.length ? (
        routines.map((routine) => (
          <div key={routine.routine_id} className={itemStyle} onClick={() => onSelect(routine)}>
            {routine.routine_name}
          </div>
        ))
      ) : (
        <p className={emptyStateStyle}>No routines available</p>
      )}
    </div>
  );
}

interface WorkoutListProps {
  workouts: Workout[];
  onSelect: (workout: Workout) => void;
}

function WorkoutList({ workouts, onSelect }: WorkoutListProps) {
  return (
    <div>
      <h2 className={subtitleStyle}>Workouts</h2>
      {workouts.length ? (
        workouts.map((workout) => (
          <div key={workout.workout_id} className={itemStyle} onClick={() => onSelect(workout)}>
            {workout.workout_name} - {new Date(workout.date).toLocaleDateString()}
          </div>
        ))
      ) : (
        <p className={emptyStateStyle}>No workouts available</p>
      )}
    </div>
  );
}

interface SetListProps {
  sets: Set[];
}

function SetList({ sets }: SetListProps) {
  return (
    <div>
      <h2 className={subtitleStyle}>Sets</h2>
      {sets.length ? (
        sets.map((set, index) => (
          <div key={index} className={itemStyle}>
            <div className="flex justify-between items-center">
              <span>
                Set {index + 1}: {set.set_reps} reps with {set.set_weight} kg
              </span>
              {set.calories_burned && (
                <span className="text-orange-400 font-semibold">
                  {Math.round(set.calories_burned)} kcal
                </span>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className={emptyStateStyle}>No sets available</p>
      )}
    </div>
  );
}

interface BackButtonProps {
  onClick: () => void;
  label: string;
}

function BackButton({ onClick, label }: BackButtonProps) {
  return (
    <button
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow font-medium"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
