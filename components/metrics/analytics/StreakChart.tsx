"use client";

/**
 * StreakChart Component
 *
 * GitHub-style activity chart showing workout frequency.
 * Optimized with React.memo for performance.
 */

import { memo, useMemo } from "react";
import type { StreakDay } from "@/hooks/useAnalytics";

// Static constants - moved outside component to prevent recreation
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Move getIntensityColor outside component to prevent recreation on each render
const getIntensityColor = (value: number): string => {
  if (value === 0) return "bg-slate-800 hover:bg-slate-700";
  if (value === 1) return "bg-green-900 hover:bg-green-800";
  if (value === 2) return "bg-green-700 hover:bg-green-600";
  if (value === 3) return "bg-green-500 hover:bg-green-400";
  return "bg-green-400 hover:bg-green-300";
};

interface StreakChartProps {
  data: StreakDay[];
}

export const StreakChart = memo(function StreakChart({ data }: StreakChartProps) {
  // Memoize expensive calculations
  const { weeks, maxWorkouts } = useMemo(() => {
    if (!data || data.length === 0) {
      return { weeks: [], maxWorkouts: 0 };
    }

    const weeksArr: StreakDay[][] = [];
    for (let i = 0; i < data.length; i += 7) {
      weeksArr.push(data.slice(i, i + 7));
    }

    return {
      weeks: weeksArr,
      maxWorkouts: Math.max(...data.map((d) => d.value), 1),
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div>
        <h3 className="text-white font-semibold mb-3 font-bricolage-grotesque">Activity Streak</h3>
        <div className="bg-slate-800/80 p-6 rounded-xl border border-blue-900/20 backdrop-blur-sm">
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">No workout data available yet</p>
            <p className="text-gray-500 text-sm">
              Start logging workouts to see your activity patterns!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-white font-semibold mb-3 font-bricolage-grotesque">Activity Streak</h3>
      <div className="bg-slate-800/80 p-6 rounded-xl border border-blue-900/20 backdrop-blur-sm">
        <div className="flex gap-1 mb-4 overflow-x-auto">
          <div className="flex flex-col gap-1 mr-2">
            <div className="w-3 h-3"></div> {/* Spacer for alignment */}
            {DAY_LABELS.map((day, index) => (
              <div key={index} className="w-3 h-3 flex items-center justify-center">
                <span className="text-xs text-gray-400 -rotate-90 text-center leading-none">
                  {day[0]}
                </span>
              </div>
            ))}
          </div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm transition-colors duration-200 cursor-pointer ${getIntensityColor(
                    Math.min(day.value, 4)
                  )}`}
                  title={`${day.date}: ${day.value} workout${day.value !== 1 ? "s" : ""}`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Less</span>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 bg-slate-800 rounded-sm" />
            <div className="w-3 h-3 bg-green-900 rounded-sm" />
            <div className="w-3 h-3 bg-green-700 rounded-sm" />
            <div className="w-3 h-3 bg-green-500 rounded-sm" />
            <div className="w-3 h-3 bg-green-400 rounded-sm" />
          </div>
          <span>More</span>
        </div>
        {maxWorkouts > 0 && (
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-500">
              Peak: {maxWorkouts} workout{maxWorkouts !== 1 ? "s" : ""} in one day
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
