"use client";

/**
 * CalendarView Component
 *
 * Displays a calendar with workout indicators and selected date details.
 * Swiss minimalist design with mobile-first responsiveness.
 */

import { memo, useCallback } from "react";
import { format } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import type { WorkoutsByDate, WorkoutWithDetails } from "@/hooks/useWorkoutData";
import { useMonthSummary } from "@/hooks/useAnalytics";

interface CalendarViewProps {
  workoutsByDate: WorkoutsByDate;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  selectedDateWorkouts: WorkoutWithDetails[];
}

export const CalendarView = memo(function CalendarView({
  workoutsByDate,
  selectedDate,
  onDateSelect,
  selectedDateWorkouts,
}: CalendarViewProps) {
  const monthSummary = useMonthSummary(workoutsByDate);

  const hasWorkoutOnDate = useCallback(
    (date: Date): boolean => {
      const dateKey = date.toISOString().split("T")[0];
      return workoutsByDate[dateKey] && workoutsByDate[dateKey].length > 0;
    },
    [workoutsByDate]
  );

  const handleDateChange = useCallback(
    (value: unknown) => {
      if (value instanceof Date) {
        onDateSelect(value);
      }
    },
    [onDateSelect]
  );

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-lg text-white">Workout Calendar</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* React Calendar */}
        <div className="bg-navy-700/60 rounded-xl p-4 md:p-6 border border-slate-700/30">
          <div className="calendar-container">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              tileClassName={({ date }: { date: Date }) => {
                if (hasWorkoutOnDate(date)) {
                  return "has-workout";
                }
                return "";
              }}
              className="react-calendar-dark"
              tileContent={({ date }: { date: Date }) => {
                const workoutCount = workoutsByDate[date.toISOString().split("T")[0]]?.length || 0;
                if (workoutCount > 0) {
                  return (
                    <div className="workout-indicator">
                      <span className="workout-count">{workoutCount}</span>
                    </div>
                  );
                }
                return null;
              }}
            />
          </div>
        </div>

        {/* Selected Date Workouts */}
        <div className="bg-navy-700/60 rounded-xl p-4 md:p-6 border border-slate-700/30">
          <h3 className="text-sm font-medium text-slate-400 mb-3">
            {format(selectedDate, "MMMM d, yyyy")}
          </h3>
          {selectedDateWorkouts.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
              {selectedDateWorkouts.map((workout) => (
                <WorkoutCard key={workout.workout_id} workout={workout} />
              ))}
            </div>
          ) : (
            <EmptyDateState />
          )}
        </div>
      </div>

      {/* Monthly Summary */}
      <MonthlySummary summary={monthSummary} />
    </div>
  );
});

const WorkoutCard = memo(function WorkoutCard({ workout }: { workout: WorkoutWithDetails }) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-white text-sm">{workout.workout_name}</h4>
        <span className="text-xs text-slate-400">{workout.routine_name}</span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
        <span>
          <span className="text-gold tabular-nums">{workout.sets_count}</span> sets
        </span>
        <span>
          <span className="text-white tabular-nums">{workout.total_reps}</span> reps
        </span>
        <span>
          <span className="text-white tabular-nums">{Math.round(workout.total_weight)}</span> kg
        </span>
        {workout.total_calories_burned && (
          <span>
            <span className="text-white tabular-nums">
              {Math.round(workout.total_calories_burned)}
            </span>{" "}
            cal
          </span>
        )}
      </div>
      {workout.notes && <p className="text-xs text-slate-400 mt-2 truncate">{workout.notes}</p>}
    </div>
  );
});

const EmptyDateState = memo(function EmptyDateState() {
  return (
    <div className="text-center py-8">
      <p className="text-slate-400">No workouts</p>
      <p className="text-slate-400 text-sm mt-1">Rest day</p>
    </div>
  );
});

interface MonthlySummaryProps {
  summary: {
    workoutDays: number;
    totalWorkouts: number;
    totalSets: number;
    totalCalories: number;
  };
}

const MonthlySummary = memo(function MonthlySummary({ summary }: MonthlySummaryProps) {
  return (
    <div>
      <h3 className="text-white font-semibold mb-3">This Month</h3>
      <div className="bg-navy-700/60 rounded-xl p-4 border border-slate-700/30">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3">
            <p className="text-gold text-2xl md:text-3xl font-bold tabular-nums">
              {summary.workoutDays}
            </p>
            <p className="text-slate-400 text-xs md:text-sm">Days Active</p>
          </div>
          <div className="text-center p-3 border-l border-slate-700/30">
            <p className="text-white text-2xl md:text-3xl font-bold tabular-nums">
              {summary.totalWorkouts}
            </p>
            <p className="text-slate-400 text-xs md:text-sm">Workouts</p>
          </div>
          <div className="text-center p-3 border-l border-slate-700/30">
            <p className="text-white text-2xl md:text-3xl font-bold tabular-nums">
              {summary.totalSets}
            </p>
            <p className="text-slate-400 text-xs md:text-sm">Sets</p>
          </div>
          <div className="text-center p-3 border-l border-slate-700/30">
            <p className="text-white text-2xl md:text-3xl font-bold tabular-nums">
              {summary.totalCalories}
            </p>
            <p className="text-slate-400 text-xs md:text-sm">Calories</p>
          </div>
        </div>
      </div>
    </div>
  );
});
