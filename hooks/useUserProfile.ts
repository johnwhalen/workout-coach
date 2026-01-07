/**
 * User Profile Hook
 *
 * React Query hook for fetching and updating user profile data.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// Query keys
export const userKeys = {
  all: ["user"] as const,
  profile: () => [...userKeys.all, "profile"] as const,
  calories: () => [...userKeys.all, "calories"] as const,
};

// Types
export interface UserProfile {
  user_id: string;
  email: string;
  name: string | null;
  current_weight: number | null;
  height: number | null;
  goal_weight: number | null;
  fitness_goal: string | null;
  profile_complete: boolean;
}

export interface ProfileUpdateData {
  currentWeight: number;
  height: number;
  goalWeight: number;
  fitnessGoal: string;
}

export interface CalorieData {
  totalCaloriesBurned: number;
  averagePerDay: number;
  workouts: Array<{
    workoutName: string;
    date: string;
    totalCalories: number;
    setsCount: number;
  }>;
}

interface ProfileResponse {
  success: boolean;
  data: UserProfile;
}

interface CaloriesResponse {
  success: boolean;
  data: CalorieData;
}

interface UserResponse {
  success: boolean;
  data: {
    user_id: string;
  };
}

/**
 * Hook to ensure user exists in database
 */
export function useEnsureUser() {
  return useQuery({
    queryKey: [...userKeys.all, "ensure"],
    queryFn: async () => {
      const response = await api.post<UserResponse>("/api/users");
      return response.data.user_id;
    },
    staleTime: Infinity, // Only run once per session
    retry: 2,
  });
}

/**
 * Hook to fetch user profile
 */
export function useUserProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      const response = await api.get<ProfileResponse>("/api/users/profile");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const response = await api.post<ProfileResponse>("/api/users/profile", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.profile(), data);
    },
  });
}

/**
 * Hook to fetch calorie data
 */
export function useCalorieData(userId: string | null) {
  return useQuery({
    queryKey: [...userKeys.calories(), userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await api.post<CaloriesResponse>("/api/calories", { userId });
      return response.data;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // Fresh for 2 minutes
  });
}
