"use client";

/**
 * StreakChart Component
 *
 * GitHub-style activity chart showing workout frequency.
 * Swiss minimalist design with mobile-friendly touch targets.
 */

import { memo, useMemo } from "react";
import type { StreakDay } from "@/hooks/useAnalytics";

// Static constants
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

// Swiss minimalist intensity scale - gold accent for activity
const getIntensityColor = (value: number): string => {
  if (value === 0) return "bg-slate-800";
  if (value === 1) return "bg-gold/30";
  if (value === 2) return "bg-gold/50";
  if (value === 3) return "bg-gold/70";
  return "bg-gold";
};

interface StreakChartProps {
  data: StreakDay[];
}

export const StreakChart = memo(function StreakChart({ data }: StreakChartProps) {
  // Memoize expensive calculations
  const { weeks, totalWorkouts } = useMemo(() => {
    if (!data || data.length === 0) {
      return { weeks: [], totalWorkouts: 0 };
    }

    const weeksArr: StreakDay[][] = [];
    for (let i = 0; i < data.length; i += 7) {
      weeksArr.push(data.slice(i, i + 7));
    }

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return {
      weeks: weeksArr,
      totalWorkouts: total,
    };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div>
        <h3 className="text-white font-semibold mb-3">Activity</h3>
        <div className="bg-navy-700/60 p-6 rounded-xl border border-slate-700/30">
          <div className="text-center py-6">
            <p className="text-slate-400">No workout data available yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Start logging workouts to see your activity patterns
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-white font-semibold">Activity</h3>
        <span className="text-slate-400 text-sm tabular-nums">
          {totalWorkouts} workouts in {weeks.length} weeks
        </span>
      </div>
      <div className="bg-navy-700/60 p-4 md:p-6 rounded-xl border border-slate-700/30">
        {/* Mobile: Scrollable with larger cells */}
        <div className="flex gap-[3px] md:gap-1 overflow-x-auto pb-2 -mx-1 px-1">
          {/* Day labels column */}
          <div className="flex flex-col gap-[3px] md:gap-1 mr-1 md:mr-2 shrink-0">
            <div className="w-4 h-4 md:w-3 md:h-3" /> {/* Spacer */}
            {DAY_LABELS.map((day, index) => (
              <div key={index} className="w-4 h-4 md:w-3 md:h-3 flex items-center justify-center">
                <span className="text-[10px] md:text-xs text-slate-400">{day}</span>
              </div>
            ))}
          </div>
          {/* Weeks grid */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px] md:gap-1 shrink-0">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-4 h-4 md:w-3 md:h-3 rounded-sm ${getIntensityColor(
                    Math.min(day.value, 4)
                  )}`}
                  title={`${day.date}: ${day.value} workout${day.value !== 1 ? "s" : ""}`}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-700/30">
          <span>Less</span>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 bg-slate-800 rounded-sm" />
            <div className="w-3 h-3 bg-gold/30 rounded-sm" />
            <div className="w-3 h-3 bg-gold/50 rounded-sm" />
            <div className="w-3 h-3 bg-gold/70 rounded-sm" />
            <div className="w-3 h-3 bg-gold rounded-sm" />
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
});
