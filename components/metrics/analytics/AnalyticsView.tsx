"use client";

/**
 * AnalyticsView Component
 *
 * Main analytics dashboard with summary stats, streak chart, and strength progression.
 * Swiss minimalist design with mobile-first responsiveness.
 */

import { memo, useMemo } from "react";
import type { AnalyticsSummary, StreakDay, WeeklyStrength } from "@/hooks/useAnalytics";
import { StreakChart } from "./StreakChart";
import { StrengthChart } from "./StrengthChart";

// Swiss minimalist stat colors - subtle, professional
const STAT_BOX_STYLES = {
  default: "bg-navy-700/60 border-slate-700/30",
  gold: "text-gold",
  white: "text-white",
  muted: "text-slate-400",
} as const;

interface AnalyticsViewProps {
  summary: AnalyticsSummary | null;
  streakData: StreakDay[];
  strengthData: WeeklyStrength[];
  isLoading?: boolean;
}

export const AnalyticsView = memo(function AnalyticsView({
  summary,
  streakData,
  strengthData,
  isLoading,
}: AnalyticsViewProps) {
  // Memoize weekly summary calculation
  const weeklySummary = useMemo(() => {
    if (!streakData.length) return null;

    const thisWeek = streakData.slice(-7);
    const workoutsThisWeek = thisWeek.filter((day) => day.value > 0).length;
    const totalIntensity = thisWeek.reduce((sum, day) => sum + day.value, 0);

    return {
      workoutsThisWeek,
      avgIntensity: (totalIntensity / 7).toFixed(1),
      completion: ((workoutsThisWeek / 5) * 100).toFixed(0),
    };
  }, [streakData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-800/80 p-8 rounded-xl border border-blue-900/20 text-center backdrop-blur-sm">
          <div className="animate-pulse">
            <h3 className="text-white font-semibold mb-3 font-bricolage-grotesque">
              Loading Analytics...
            </h3>
            <p className="text-gray-400">Analyzing your workout data</p>
          </div>
        </div>
      </div>
    );
  }

  if (!summary || summary.totalWorkouts === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-800/80 p-8 rounded-xl border border-blue-900/20 text-center backdrop-blur-sm">
          <h3 className="text-white font-semibold mb-3 font-bricolage-grotesque">
            No Workout Data Yet
          </h3>
          <p className="text-gray-400 mb-4">
            Start logging your workouts to see detailed analytics and insights!
          </p>
          <p className="text-gray-500 text-sm">
            Your analytics will show workout streaks, strength progression, and activity patterns.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnalyticsSummaryCard data={summary} />

      {weeklySummary && <WeeklyProgressCard summary={weeklySummary} />}

      <StreakChart data={streakData} />
      <StrengthChart data={strengthData} />
    </div>
  );
});

interface AnalyticsSummaryCardProps {
  data: AnalyticsSummary;
}

const AnalyticsSummaryCard = memo(function AnalyticsSummaryCard({
  data,
}: AnalyticsSummaryCardProps) {
  return (
    <div>
      <h3 className="text-white font-semibold mb-3 font-bricolage-grotesque">Fitness Analytics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatBox value={data.currentStreak} label="Current Streak" colorClass="blue" />
        <StatBox value={data.longestStreak} label="Longest Streak" colorClass="green" />
        <StatBox value={data.totalWorkouts} label="Total Workouts" colorClass="yellow" />
        <StatBox value={data.averageWorkoutsPerWeek} label="Avg/Week" colorClass="purple" />
      </div>
    </div>
  );
});

interface StatBoxProps {
  value: number | string;
  label: string;
  colorClass: "blue" | "green" | "yellow" | "purple";
}

const StatBox = memo(function StatBox({ value, label, colorClass }: StatBoxProps) {
  const c = STAT_BOX_COLORS[colorClass];

  return (
    <div
      className={`bg-gradient-to-br ${c.bg} p-4 rounded-xl border ${c.border} text-center backdrop-blur-sm`}
    >
      <p className={`${c.text} text-2xl font-bold font-bricolage-grotesque`}>{value}</p>
      <p className="text-gray-300 text-sm font-medium">{label}</p>
    </div>
  );
});

interface WeeklyProgressCardProps {
  summary: {
    workoutsThisWeek: number;
    avgIntensity: string;
    completion: string;
  };
}

const WeeklyProgressCard = memo(function WeeklyProgressCard({ summary }: WeeklyProgressCardProps) {
  return (
    <div>
      <h3 className="text-white font-semibold mb-3 font-bricolage-grotesque">
        This Week&apos;s Progress
      </h3>
      <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 p-4 rounded-xl border border-indigo-700/30 backdrop-blur-sm">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-indigo-300 text-xl font-bold font-bricolage-grotesque">
              {summary.workoutsThisWeek}
            </p>
            <p className="text-gray-300 text-sm">Workouts</p>
          </div>
          <div>
            <p className="text-purple-300 text-xl font-bold font-bricolage-grotesque">
              {summary.avgIntensity}
            </p>
            <p className="text-gray-300 text-sm">Avg Intensity</p>
          </div>
          <div>
            <p className="text-pink-300 text-xl font-bold font-bricolage-grotesque">
              {summary.completion}%
            </p>
            <p className="text-gray-300 text-sm">Goal Complete</p>
          </div>
        </div>
      </div>
    </div>
  );
});
