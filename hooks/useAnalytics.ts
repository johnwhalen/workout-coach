/**
 * Analytics Hook
 *
 * React Query hook for computing and caching workout analytics.
 */

import { useMemo } from "react";
import { eachDayOfInterval, format, getDay, isSameDay, subDays } from "date-fns";
import type { WorkoutsByDate } from "./useWorkoutData";

// Types
export interface AnalyticsSummary {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  averageWorkoutsPerWeek: string;
}

export interface StreakDay {
  date: string;
  value: number;
  day: number;
}

export interface WeeklyStrength {
  week: string;
  [exercise: string]: string | number;
}

/**
 * Calculate analytics from workouts by date
 */
export function useAnalytics(workoutsByDate: WorkoutsByDate | undefined) {
  return useMemo(() => {
    if (!workoutsByDate || Object.keys(workoutsByDate).length === 0) {
      return {
        summary: {
          currentStreak: 0,
          longestStreak: 0,
          totalWorkouts: 0,
          averageWorkoutsPerWeek: "0.0",
        },
        streakData: [],
        strengthData: [],
      };
    }

    // Extract all workout dates
    const workoutDates: Date[] = [];
    Object.entries(workoutsByDate).forEach(([dateKey, workouts]) => {
      workouts.forEach(() => {
        workoutDates.push(new Date(dateKey));
      });
    });

    // Calculate streak data for the last 90 days
    const last90Days = eachDayOfInterval({
      start: subDays(new Date(), 89),
      end: new Date(),
    });

    const streakData: StreakDay[] = last90Days.map((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const workoutsOnDate = workoutsByDate[dateKey]?.length || 0;
      return {
        date: dateKey,
        value: workoutsOnDate,
        day: getDay(date),
      };
    });

    // Calculate strength data
    const strengthData = generateStrengthData(workoutsByDate);

    // Calculate summary
    const summary: AnalyticsSummary = {
      currentStreak: calculateCurrentStreak(workoutDates),
      longestStreak: calculateLongestStreak(workoutDates),
      totalWorkouts: workoutDates.length,
      averageWorkoutsPerWeek: calculateWeeklyAverage(workoutDates),
    };

    return { summary, streakData, strengthData };
  }, [workoutsByDate]);
}

/**
 * Calculate current workout streak
 */
function calculateCurrentStreak(workoutDates: Date[]): number {
  if (workoutDates.length === 0) return 0;

  const today = new Date();
  const sortedDates = workoutDates
    .map((date) => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime());

  const uniqueDates = sortedDates.filter(
    (date, index, arr) => index === 0 || !isSameDay(date, arr[index - 1])
  );

  if (uniqueDates.length === 0) return 0;

  // Check if there was a workout today or within the last 2 days
  const recentWorkout = uniqueDates.find((date) => {
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 2;
  });

  if (!recentWorkout) return 0;

  let currentStreak = 1;
  let checkDate = recentWorkout;

  for (let i = 1; i < uniqueDates.length; i++) {
    const currentWorkout = uniqueDates[i];
    const daysDiff = Math.floor(
      (checkDate.getTime() - currentWorkout.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= 4) {
      currentStreak++;
      checkDate = currentWorkout;
    } else {
      break;
    }
  }

  return currentStreak;
}

/**
 * Calculate longest workout streak
 */
function calculateLongestStreak(workoutDates: Date[]): number {
  if (workoutDates.length === 0) return 0;
  if (workoutDates.length === 1) return 1;

  const sortedDates = workoutDates
    .map((date) => new Date(date))
    .sort((a, b) => a.getTime() - b.getTime());

  const uniqueDates = sortedDates.filter(
    (date, index, arr) => index === 0 || !isSameDay(date, arr[index - 1])
  );

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const daysDiff = Math.floor(
      (uniqueDates[i].getTime() - uniqueDates[i - 1].getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= 4) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }

  return Math.max(longestStreak, currentStreak);
}

/**
 * Calculate average workouts per week
 */
function calculateWeeklyAverage(workoutDates: Date[]): string {
  if (workoutDates.length === 0) return "0.0";

  const today = new Date();
  const earliestDate = workoutDates.reduce((earliest, date) => {
    const workoutDate = new Date(date);
    return workoutDate < earliest ? workoutDate : earliest;
  }, today);

  const totalDays = Math.floor((today.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.max(totalDays / 7, 1);

  const uniqueWorkoutDays = workoutDates
    .map((date) => format(new Date(date), "yyyy-MM-dd"))
    .filter((date, index, arr) => arr.indexOf(date) === index).length;

  return (uniqueWorkoutDays / totalWeeks).toFixed(1);
}

/**
 * Generate strength progression data from workouts
 */
function generateStrengthData(workoutsByDate: WorkoutsByDate): WeeklyStrength[] {
  const strengthExercises = ["squat", "bench", "deadlift", "press", "curl", "pullup"];
  const exerciseData: Record<string, { date: Date; weight: number }[]> = {};

  // Collect exercise data
  Object.entries(workoutsByDate).forEach(([dateKey, workouts]) => {
    workouts.forEach((workout) => {
      const workoutName = workout.workout_name.toLowerCase();
      const matchedExercise = strengthExercises.find((exercise) => workoutName.includes(exercise));

      if (matchedExercise && workout.total_weight > 0) {
        if (!exerciseData[matchedExercise]) {
          exerciseData[matchedExercise] = [];
        }
        // Use average weight per rep as the metric
        const avgWeight =
          workout.total_reps > 0 ? workout.total_weight / workout.total_reps : workout.total_weight;
        exerciseData[matchedExercise].push({
          date: new Date(dateKey),
          weight: avgWeight,
        });
      }
    });
  });

  // Generate weekly progression data
  const last12Weeks: WeeklyStrength[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = subDays(new Date(), i * 7);
    const weekEnd = subDays(new Date(), (i - 1) * 7);
    const weekLabel = format(weekStart, "MMM dd");

    const weekData: WeeklyStrength = { week: weekLabel };

    Object.entries(exerciseData).forEach(([exercise, data]) => {
      const weekSets = data.filter((d) => d.date >= weekStart && d.date < weekEnd);

      if (weekSets.length > 0) {
        const avgWeight = weekSets.reduce((sum, set) => sum + set.weight, 0) / weekSets.length;
        weekData[exercise.charAt(0).toUpperCase() + exercise.slice(1)] =
          Math.round(avgWeight * 10) / 10;
      }
    });

    last12Weeks.push(weekData);
  }

  return last12Weeks;
}

/**
 * Get this month's summary from workouts by date
 */
export function useMonthSummary(workoutsByDate: WorkoutsByDate | undefined) {
  return useMemo(() => {
    if (!workoutsByDate) {
      return {
        workoutDays: 0,
        totalWorkouts: 0,
        totalSets: 0,
        totalCalories: 0,
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let workoutDays = 0;
    let totalWorkouts = 0;
    let totalSets = 0;
    let totalCalories = 0;

    Object.entries(workoutsByDate).forEach(([dateKey, workouts]) => {
      const date = new Date(dateKey);
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        if (workouts.length > 0) workoutDays++;
        totalWorkouts += workouts.length;
        workouts.forEach((workout) => {
          totalSets += workout.sets_count;
          totalCalories += workout.total_calories_burned || 0;
        });
      }
    });

    return {
      workoutDays,
      totalWorkouts,
      totalSets,
      totalCalories: Math.round(totalCalories),
    };
  }, [workoutsByDate]);
}
