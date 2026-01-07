"use client";

/**
 * CalendarView Component
 *
 * Displays a calendar with workout indicators and selected date details.
 * Optimized with React.memo for performance.
 */

import { memo, useCallback } from "react";
import { format } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import type { WorkoutsByDate, WorkoutWithDetails } from "@/hooks/useWorkoutData";
import { useMonthSummary } from "@/hooks/useAnalytics";

// Static color constants - moved outside components to prevent recreation
const STAT_COLORS = {
  blue: {
    bg: "from-blue-900/50 to-blue-800/30",
    border: "border-blue-700/30",
    text: "text-blue-400",
    subtext: "text-blue-300",
    hover: "hover:from-blue-800/60 hover:to-blue-700/40",
  },
  green: {
    bg: "from-green-900/50 to-green-800/30",
    border: "border-green-700/30",
    text: "text-green-400",
    subtext: "text-green-300",
    hover: "hover:from-green-800/60 hover:to-green-700/40",
  },
  purple: {
    bg: "from-purple-900/50 to-purple-800/30",
    border: "border-purple-700/30",
    text: "text-purple-400",
    subtext: "text-purple-300",
    hover: "hover:from-purple-800/60 hover:to-purple-700/40",
  },
  orange: {
    bg: "from-orange-900/50 to-orange-800/30",
    border: "border-orange-700/30",
    text: "text-orange-400",
    subtext: "text-orange-300",
    hover: "hover:from-orange-800/60 hover:to-orange-700/40",
  },
} as const;

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
      <h2 className="font-bold text-lg mb-4 text-white font-bricolage-grotesque">
        Workout Calendar
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* React Calendar */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Workout Calendar
          </h3>
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
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Workouts on {format(selectedDate, "MMMM dd, yyyy")}
          </h3>
          {selectedDateWorkouts.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
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
    <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/30 rounded-xl p-4 border border-slate-600/50 hover:border-blue-400/50 transition-all duration-200">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-blue-300 text-lg">{workout.workout_name}</h4>
        <span className="text-xs text-gray-400 bg-slate-700/50 px-2 py-1 rounded-full">
          {workout.routine_name}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <span className="text-gray-300">
            Sets: <span className="text-purple-400 font-semibold">{workout.sets_count}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-gray-300">
            Reps: <span className="text-blue-400 font-semibold">{workout.total_reps}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-gray-300">
            Weight:{" "}
            <span className="text-green-400 font-semibold">
              {Math.round(workout.total_weight)} kg
            </span>
          </span>
        </div>
        {workout.total_calories_burned && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span className="text-gray-300">
              Calories:{" "}
              <span className="text-orange-400 font-semibold">
                {Math.round(workout.total_calories_burned)}
              </span>
            </span>
          </div>
        )}
      </div>
      {workout.duration_minutes && (
        <div className="text-xs text-gray-400 mt-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Duration: {workout.duration_minutes} minutes
        </div>
      )}
      {workout.notes && (
        <div className="text-xs text-gray-400 mt-2 p-2 bg-slate-800/50 rounded-lg border border-slate-600/30">
          <strong>Notes:</strong> {workout.notes}
        </div>
      )}
    </div>
  );
});

const EmptyDateState = memo(function EmptyDateState() {
  return (
    <div className="text-center py-8">
      <svg
        className="w-12 h-12 text-gray-500 mx-auto mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p className="text-gray-400 italic">No workouts on this date</p>
      <p className="text-gray-500 text-sm mt-1">Select a date with workouts to see details</p>
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
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 backdrop-blur-sm">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-purple-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        This Month&apos;s Summary
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          value={summary.workoutDays}
          label="Workout Days"
          sublabel="Active days"
          colorClass="blue"
        />
        <StatCard
          value={summary.totalWorkouts}
          label="Total Workouts"
          sublabel="Sessions completed"
          colorClass="green"
        />
        <StatCard
          value={summary.totalSets}
          label="Total Sets"
          sublabel="Sets performed"
          colorClass="purple"
        />
        <StatCard
          value={summary.totalCalories}
          label="Calories Burned"
          sublabel="Energy expended"
          colorClass="orange"
        />
      </div>
    </div>
  );
});

interface StatCardProps {
  value: number;
  label: string;
  sublabel: string;
  colorClass: "blue" | "green" | "purple" | "orange";
}

const StatCard = memo(function StatCard({ value, label, sublabel, colorClass }: StatCardProps) {
  const c = STAT_COLORS[colorClass];

  return (
    <div
      className={`bg-gradient-to-br ${c.bg} p-4 rounded-xl border ${c.border} text-center backdrop-blur-sm ${c.hover} transition-all duration-200`}
    >
      <div className={`text-3xl font-bold ${c.text} mb-1`}>{value}</div>
      <div className="text-sm text-gray-300 font-medium">{label}</div>
      <div className={`text-xs ${c.subtext} mt-1`}>{sublabel}</div>
    </div>
  );
});
