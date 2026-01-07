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

// Styles
const containerStyle = "fixed inset-0 flex justify-center items-center bg-slate-900 p-4";
const boxStyle =
  "glassmorphism rounded-2xl shadow-2xl p-6 w-full max-w-6xl h-[90vh] flex flex-col border border-slate-800 backdrop-blur-lg";
const contentStyle = "flex-grow overflow-y-auto custom-scrollbar";
const titleStyle =
  "font-extrabold text-3xl mb-6 text-blue-400 tracking-tight drop-shadow-lg font-bricolage-grotesque";

type TabType = "calendar" | "workouts" | "calories" | "profile" | "analytics";

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

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "calendar":
        return (
          <CalendarView
            workoutsByDate={workoutsByDate}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            selectedDateWorkouts={selectedDateWorkouts}
          />
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
      case "calories":
        return <CalorieStats data={calorieData ?? null} isLoading={caloriesLoading} />;
      case "profile":
        return (
          <UserProfileStats
            profile={userProfile ?? null}
            isLoading={profileLoading}
            onSave={handleSaveProfile}
          />
        );
      case "analytics":
        return (
          <AnalyticsView
            summary={analyticsData}
            streakData={streakData}
            strengthData={strengthData}
            isLoading={workoutsByDateLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={containerStyle}>
      <div className={boxStyle}>
        {/* Header */}
        <div className="flex flex-row items-center justify-between gap-x-4">
          <h1 className={titleStyle + " m-0 mb-0"}>Dashboard</h1>
          <div className="flex flex-row items-center gap-x-3">
            <Link
              className="px-3 py-1 bg-blue-500/80 text-white rounded-lg hover:bg-blue-600/90 transition shadow text-center font-medium"
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

      {/* Global Styles */}
      <style jsx global>{`
        .glassmorphism {
          background: rgba(17, 24, 39, 0.7);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(30, 58, 138, 0.25);
          border-radius: 8px;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #334155 #0f172a;
        }

        /* Calendar Styles */
        .react-calendar {
          background: transparent !important;
          border: none !important;
          font-family: inherit;
          width: 100%;
          color: white;
        }

        .react-calendar-dark {
          background: transparent !important;
          border: none !important;
          font-family: inherit;
          width: 100%;
          color: white;
        }

        .react-calendar__navigation {
          background: rgba(30, 41, 59, 0.8) !important;
          border-radius: 12px !important;
          margin-bottom: 1rem !important;
          padding: 0.5rem !important;
          border: 1px solid rgba(51, 65, 85, 0.5) !important;
        }

        .react-calendar__navigation button {
          color: #f1f5f9 !important;
          background: none !important;
          border: none !important;
          font-weight: 600 !important;
          font-size: 1rem !important;
          padding: 0.5rem 1rem !important;
          border-radius: 8px !important;
          transition: all 0.2s ease !important;
        }

        .react-calendar__navigation button:hover {
          background: rgba(59, 130, 246, 0.3) !important;
          transform: scale(1.05);
        }

        .react-calendar__navigation button:disabled {
          background: rgba(100, 116, 139, 0.2) !important;
          color: #64748b !important;
        }

        .react-calendar__navigation__label {
          font-size: 1.1rem !important;
          font-weight: 700 !important;
          color: #60a5fa !important;
        }

        .react-calendar__month-view__weekdays {
          background: rgba(51, 65, 85, 0.6) !important;
          border-radius: 8px !important;
          padding: 0.75rem 0 !important;
          margin-bottom: 0.5rem !important;
        }

        .react-calendar__month-view__weekdays__weekday {
          color: #94a3b8 !important;
          font-weight: 600 !important;
          font-size: 0.875rem !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }

        .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none !important;
        }

        .react-calendar__tile {
          background: rgba(30, 41, 59, 0.6) !important;
          border: 1px solid rgba(51, 65, 85, 0.4) !important;
          color: #e2e8f0 !important;
          padding: 1rem 0.5rem !important;
          position: relative !important;
          transition: all 0.2s ease !important;
          border-radius: 8px !important;
          margin: 2px !important;
          font-weight: 500 !important;
          min-height: 3rem !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .react-calendar__tile:hover {
          background: rgba(59, 130, 246, 0.3) !important;
          border-color: rgba(59, 130, 246, 0.6) !important;
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2) !important;
        }

        .react-calendar__tile--active {
          background: rgba(59, 130, 246, 0.7) !important;
          border-color: #3b82f6 !important;
          color: white !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4) !important;
        }

        .react-calendar__tile--now {
          background: rgba(168, 85, 247, 0.3) !important;
          border-color: rgba(168, 85, 247, 0.6) !important;
          color: #f3e8ff !important;
          font-weight: 600 !important;
        }

        .react-calendar__tile--now:hover {
          background: rgba(168, 85, 247, 0.5) !important;
        }

        .react-calendar__tile.has-workout {
          background: rgba(16, 185, 129, 0.2) !important;
          border-color: rgba(16, 185, 129, 0.5) !important;
          color: #d1fae5 !important;
        }

        .react-calendar__tile.has-workout:hover {
          background: rgba(16, 185, 129, 0.4) !important;
          border-color: rgba(16, 185, 129, 0.7) !important;
        }

        .react-calendar__tile--neighboringMonth {
          color: #64748b !important;
          background: rgba(30, 41, 59, 0.2) !important;
        }

        .react-calendar__tile--weekend {
          color: #fbbf24 !important;
        }

        .workout-indicator {
          position: absolute !important;
          bottom: 4px !important;
          right: 4px !important;
          background: #10b981 !important;
          color: white !important;
          border-radius: 50% !important;
          width: 20px !important;
          height: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
        }

        .workout-count {
          color: white !important;
          font-size: 0.7rem !important;
          font-weight: 700 !important;
        }

        .calendar-container {
          padding: 0.5rem;
          background: rgba(15, 23, 42, 0.3);
          border-radius: 12px;
          border: 1px solid rgba(51, 65, 85, 0.3);
        }
      `}</style>
    </div>
  );
}

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs: { id: TabType; label: string }[] = [
    { id: "calendar", label: "Calendar" },
    { id: "workouts", label: "Workouts" },
    { id: "calories", label: "Calories" },
    { id: "profile", label: "Profile" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === tab.id ? "bg-blue-600 text-white" : "bg-slate-700 text-gray-300"
          }`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
