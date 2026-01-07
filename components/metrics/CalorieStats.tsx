"use client";

/**
 * CalorieStats Component
 *
 * Displays calorie tracking data and recent workout summaries.
 */

import type { CalorieData } from "@/hooks/useUserProfile";

const subtitleStyle = "font-bold text-lg mb-4 text-white font-bricolage-grotesque";
const emptyStateStyle = "text-gray-500 italic";

interface CalorieStatsProps {
  data: CalorieData | null;
  isLoading?: boolean;
}

export function CalorieStats({ data, isLoading }: CalorieStatsProps) {
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <h2 className={subtitleStyle}>Calorie Tracking (Last 7 Days)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-blue-900/20 h-24" />
          <div className="bg-slate-800/80 p-4 rounded-xl border border-blue-900/20 h-24" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h2 className={subtitleStyle}>Calorie Tracking (Last 7 Days)</h2>
        <p className={emptyStateStyle}>No calorie data available</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className={subtitleStyle}>Calorie Tracking (Last 7 Days)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded-xl border border-blue-900/20">
          <h3 className="text-blue-300 font-semibold mb-2">Total Calories Burned</h3>
          <p className="text-2xl font-bold text-white">
            {Math.round(data.totalCaloriesBurned)} kcal
          </p>
        </div>
        <div className="bg-slate-800/80 p-4 rounded-xl border border-blue-900/20">
          <h3 className="text-blue-300 font-semibold mb-2">Daily Average</h3>
          <p className="text-2xl font-bold text-white">{Math.round(data.averagePerDay)} kcal</p>
        </div>
      </div>

      <h3 className="text-white font-semibold mb-3">Recent Workouts</h3>
      {data.workouts.length ? (
        data.workouts.slice(0, 5).map((workout, index) => (
          <div
            key={index}
            className="bg-slate-800/80 p-3 rounded-lg mb-2 border border-blue-900/20"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white font-medium">{workout.workoutName}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(workout.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-orange-400 font-semibold">
                  {Math.round(workout.totalCalories)} kcal
                </p>
                <p className="text-gray-400 text-sm">{workout.setsCount} sets</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className={emptyStateStyle}>No calorie data available</p>
      )}
    </div>
  );
}
