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
        <div className="bg-navy-700/60 p-8 rounded-xl border border-slate-700/30 text-center">
          <div className="animate-pulse">
            <h3 className="text-white font-semibold mb-3">Loading Analytics...</h3>
            <p className="text-slate-400">Analyzing your workout data</p>
          </div>
        </div>
      </div>
    );
  }

  if (!summary || summary.totalWorkouts === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-navy-700/60 p-8 rounded-xl border border-slate-700/30 text-center">
          <h3 className="text-white font-semibold mb-3">No Workout Data Yet</h3>
          <p className="text-slate-400 mb-4">
            Start logging your workouts to see detailed analytics and insights!
          </p>
          <p className="text-slate-400 text-sm">
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
      <h3 className="text-white font-semibold mb-3">Fitness Analytics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatBox value={data.currentStreak} label="Current Streak" unit="days" />
        <StatBox value={data.longestStreak} label="Longest Streak" unit="days" />
        <StatBox value={data.totalWorkouts} label="Total Workouts" />
        <StatBox value={data.averageWorkoutsPerWeek} label="Avg/Week" />
      </div>
    </div>
  );
});

interface StatBoxProps {
  value: number | string;
  label: string;
  unit?: string;
}

const StatBox = memo(function StatBox({ value, label, unit }: StatBoxProps) {
  return (
    <div className="bg-navy-700/60 p-4 rounded-xl border border-slate-700/30 text-center min-h-[80px] flex flex-col justify-center">
      <p className="text-gold text-2xl md:text-3xl font-bold tabular-nums">
        {value}
        {unit && <span className="text-sm font-normal text-slate-400 ml-1">{unit}</span>}
      </p>
      <p className="text-slate-400 text-xs md:text-sm mt-1">{label}</p>
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
      <h3 className="text-white font-semibold mb-3">This Week</h3>
      <div className="bg-navy-700/60 p-4 rounded-xl border border-slate-700/30">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="min-h-[60px] flex flex-col justify-center">
            <p className="text-white text-xl md:text-2xl font-bold tabular-nums">
              {summary.workoutsThisWeek}
            </p>
            <p className="text-slate-400 text-xs md:text-sm">Workouts</p>
          </div>
          <div className="min-h-[60px] flex flex-col justify-center border-x border-slate-700/30">
            <p className="text-white text-xl md:text-2xl font-bold tabular-nums">
              {summary.avgIntensity}
            </p>
            <p className="text-slate-400 text-xs md:text-sm">Avg Intensity</p>
          </div>
          <div className="min-h-[60px] flex flex-col justify-center">
            <p className="text-gold text-xl md:text-2xl font-bold tabular-nums">
              {summary.completion}%
            </p>
            <p className="text-slate-400 text-xs md:text-sm">Goal</p>
          </div>
        </div>
      </div>
    </div>
  );
});
