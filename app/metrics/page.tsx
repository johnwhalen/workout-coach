"use client";

/**
 * Metrics Dashboard Page
 *
 * Refactored to use React Query for data fetching and split components
 * for better maintainability and performance.
 */

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useMemo } from "react";
import "react-calendar/dist/Calendar.css";

// Hooks
import {
  useRoutines,
  useWorkouts,
  useSets,
  useWorkoutsByDate,
  useEnsureUser,
  useUserProfile,
  useUpdateProfile,
  useCalorieData,
} from "@/hooks";
import { useAnalytics } from "@/hooks/useAnalytics";

// Components
import {
  CalendarView,
  CalorieStats,
  UserProfileStats,
  WorkoutBrowser,
  AnalyticsView,
} from "@/components/metrics";

import type { Routine, Workout } from "@/types/database";

// Styles (Swiss minimalist)
const containerStyle = "fixed inset-0 flex justify-center items-center bg-navy-900 p-4";
const boxStyle =
  "glassmorphism rounded-xl p-6 w-full max-w-6xl h-[90vh] flex flex-col border border-slate-700/30";
const contentStyle = "flex-grow overflow-y-auto custom-scrollbar";
const titleStyle = "font-bold text-2xl text-gold";

// Consolidated tabs: Calendar (with analytics), Workouts, Profile (with calories)
type TabType = "calendar" | "workouts" | "profile";

export default function Dashboard() {
  // Local state
  const [activeTab, setActiveTab] = useState<TabType>("calendar");
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Data fetching hooks
  const { data: userId } = useEnsureUser();
  const { data: routines = [] } = useRoutines();
  const { data: workouts = [] } = useWorkouts(selectedRoutine?.routine_id ?? null);
  const { data: sets = [] } = useSets(selectedWorkout?.workout_id ?? null);
  const { data: workoutsByDate = {}, isLoading: workoutsByDateLoading } = useWorkoutsByDate();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const { data: calorieData, isLoading: caloriesLoading } = useCalorieData(userId ?? null);
  const updateProfile = useUpdateProfile();

  // Analytics computed from workoutsByDate
  const { summary: analyticsData, streakData, strengthData } = useAnalytics(workoutsByDate);

  // Get workouts for selected date
  const selectedDateWorkouts = useMemo(() => {
    const dateKey = selectedDate.toISOString().split("T")[0];
    return workoutsByDate[dateKey] || [];
  }, [workoutsByDate, selectedDate]);

  // Handlers
  const handleSelectRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
    setSelectedWorkout(null);
  };

  const handleSelectWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
  };

  const handleBackToRoutines = () => {
    setSelectedRoutine(null);
    setSelectedWorkout(null);
  };

  const handleBackToWorkouts = () => {
    setSelectedWorkout(null);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSaveProfile = async (data: Parameters<typeof updateProfile.mutateAsync>[0]) => {
    await updateProfile.mutateAsync(data);
  };

  // Render content based on active tab (consolidated)
  const renderContent = () => {
    switch (activeTab) {
      case "calendar":
        // Calendar now includes analytics summary
        return (
          <div className="space-y-6">
            <CalendarView
              workoutsByDate={workoutsByDate}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              selectedDateWorkouts={selectedDateWorkouts}
            />
            <AnalyticsView
              summary={analyticsData}
              streakData={streakData}
              strengthData={strengthData}
              isLoading={workoutsByDateLoading}
            />
          </div>
        );
      case "workouts":
        return (
          <WorkoutBrowser
            routines={routines}
            workouts={workouts}
            sets={sets}
            selectedRoutine={selectedRoutine}
            selectedWorkout={selectedWorkout}
            onSelectRoutine={handleSelectRoutine}
            onSelectWorkout={handleSelectWorkout}
            onBackToRoutines={handleBackToRoutines}
            onBackToWorkouts={handleBackToWorkouts}
          />
        );
      case "profile":
        // Profile now includes calorie stats
        return (
          <div className="space-y-6">
            <UserProfileStats
              profile={userProfile ?? null}
              isLoading={profileLoading}
              onSave={handleSaveProfile}
            />
            <CalorieStats data={calorieData ?? null} isLoading={caloriesLoading} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={containerStyle}>
      <div className={boxStyle}>
        {/* Header */}
        <div className="flex flex-row items-center justify-between mb-4">
          <h1 className={titleStyle}>Dashboard</h1>
          <div className="flex flex-row items-center gap-3">
            <Link
              className="px-4 py-2 bg-gold hover:bg-gold/90 text-navy-900 rounded-lg transition font-medium"
              href="/chat"
            >
              Chat
            </Link>
            <UserButton />
          </div>
        </div>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <div className={contentStyle}>{renderContent()}</div>
      </div>

      {/* Styles moved to app/globals.css for consolidation */}
    </div>
  );
}

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  // Consolidated to 3 tabs
  const tabs: { id: TabType; label: string }[] = [
    { id: "calendar", label: "Calendar" },
    { id: "workouts", label: "Workouts" },
    { id: "profile", label: "Profile" },
  ];

  return (
    <div className="mb-4 flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            activeTab === tab.id
              ? "bg-gold text-navy-900 font-medium"
              : "bg-navy-700/60 text-slate-400 hover:text-white"
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
