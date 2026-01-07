"use client";

/**
 * UserProfile Component
 *
 * Displays and allows editing of user fitness profile.
 */

import { useState } from "react";
import toast from "react-hot-toast";
import type { UserProfile as UserProfileType, ProfileUpdateData } from "@/hooks/useUserProfile";

const subtitleStyle = "font-bold text-lg mb-4 text-white font-bricolage-grotesque";

interface UserProfileProps {
  profile: UserProfileType | null;
  isLoading?: boolean;
  onSave: (data: ProfileUpdateData) => Promise<void>;
}

export function UserProfileStats({ profile, isLoading, onSave }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableProfile, setEditableProfile] = useState({
    current_weight: "",
    height: "",
    goal_weight: "",
    fitness_goal: "",
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <h2 className={subtitleStyle}>Fitness Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-blue-900/20 h-32" />
          <div className="bg-slate-800/80 p-4 rounded-xl border border-green-900/20 h-32" />
        </div>
      </div>
    );
  }

  if (!profile || !profile.profile_complete) {
    return (
      <div>
        <h2 className={subtitleStyle}>Fitness Profile</h2>
        <div className="bg-slate-800/80 p-4 rounded-xl border border-orange-500/20">
          <p className="text-orange-400 font-medium mb-2">Profile Incomplete</p>
          <p className="text-gray-300 text-sm">
            Complete your fitness profile to get personalized calorie estimates and recommendations!
          </p>
        </div>
      </div>
    );
  }

  const startEditing = () => {
    setEditableProfile({
      current_weight: profile.current_weight?.toString() || "",
      height: profile.height?.toString() || "",
      goal_weight: profile.goal_weight?.toString() || "",
      fitness_goal: profile.fitness_goal || "",
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditableProfile({
      current_weight: "",
      height: "",
      goal_weight: "",
      fitness_goal: "",
    });
  };

  const saveChanges = async () => {
    const data: ProfileUpdateData = {
      currentWeight: parseFloat(editableProfile.current_weight),
      height: parseFloat(editableProfile.height),
      goalWeight: parseFloat(editableProfile.goal_weight),
      fitnessGoal: editableProfile.fitness_goal,
    };

    if (!data.currentWeight || !data.height || !data.goalWeight || !data.fitnessGoal) {
      toast.error("Please fill in all fields");
      return;
    }

    if (data.currentWeight <= 0 || data.height <= 0 || data.goalWeight <= 0) {
      toast.error("Weight and height must be positive numbers");
      return;
    }

    if (data.height < 100 || data.height > 250) {
      toast.error("Please enter height in centimeters (100-250 cm)");
      return;
    }

    try {
      await onSave(data);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile changes");
    }
  };

  if (isEditing) {
    return (
      <EditProfileForm
        editableProfile={editableProfile}
        setEditableProfile={setEditableProfile}
        onSave={saveChanges}
        onCancel={cancelEditing}
      />
    );
  }

  return <ProfileDisplay profile={profile} onEdit={startEditing} />;
}

interface EditProfileFormProps {
  editableProfile: {
    current_weight: string;
    height: string;
    goal_weight: string;
    fitness_goal: string;
  };
  setEditableProfile: (profile: {
    current_weight: string;
    height: string;
    goal_weight: string;
    fitness_goal: string;
  }) => void;
  onSave: () => void;
  onCancel: () => void;
}

function EditProfileForm({
  editableProfile,
  setEditableProfile,
  onSave,
  onCancel,
}: EditProfileFormProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className={subtitleStyle}>Edit Fitness Profile</h2>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/80 p-4 rounded-xl border border-blue-900/20">
          <h3 className="text-blue-300 font-semibold mb-3">Current Stats</h3>
          <div className="space-y-3">
            <div>
              <label className="text-white text-sm mb-1 block">Weight (kg)</label>
              <input
                type="number"
                value={editableProfile.current_weight}
                onChange={(e) =>
                  setEditableProfile({ ...editableProfile, current_weight: e.target.value })
                }
                className="w-full p-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                placeholder="70"
                step="0.1"
                min="1"
                max="300"
              />
            </div>
            <div>
              <label className="text-white text-sm mb-1 block">Height (cm)</label>
              <input
                type="number"
                value={editableProfile.height}
                onChange={(e) => setEditableProfile({ ...editableProfile, height: e.target.value })}
                className="w-full p-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                placeholder="175"
                min="100"
                max="250"
              />
            </div>
          </div>
        </div>
        <div className="bg-slate-800/80 p-4 rounded-xl border border-green-900/20">
          <h3 className="text-green-300 font-semibold mb-3">Goals</h3>
          <div className="space-y-3">
            <div>
              <label className="text-white text-sm mb-1 block">Goal Weight (kg)</label>
              <input
                type="number"
                value={editableProfile.goal_weight}
                onChange={(e) =>
                  setEditableProfile({ ...editableProfile, goal_weight: e.target.value })
                }
                className="w-full p-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                placeholder="65"
                step="0.1"
                min="1"
                max="300"
              />
            </div>
            <div>
              <label className="text-white text-sm mb-1 block">Fitness Goal</label>
              <select
                value={editableProfile.fitness_goal}
                onChange={(e) =>
                  setEditableProfile({ ...editableProfile, fitness_goal: e.target.value })
                }
                className="w-full p-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select goal</option>
                <option value="lose_weight">Lose Weight</option>
                <option value="gain_weight">Gain Weight</option>
                <option value="maintain_weight">Maintain Weight</option>
                <option value="add_muscle">Add Muscle</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileDisplayProps {
  profile: UserProfileType;
  onEdit: () => void;
}

function ProfileDisplay({ profile, onEdit }: ProfileDisplayProps) {
  const bmi =
    profile.current_weight && profile.height
      ? profile.current_weight / (profile.height / 100) ** 2
      : 0;
  const weightDifference =
    profile.goal_weight && profile.current_weight
      ? profile.goal_weight - profile.current_weight
      : 0;
  const goalText = profile.fitness_goal
    ?.replace("_", " ")
    .replace(/\b\w/g, (l: string) => l.toUpperCase());

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className={subtitleStyle}>Fitness Profile</h2>
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Edit
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-800/80 p-4 rounded-xl border border-blue-900/20">
          <h3 className="text-blue-300 font-semibold mb-2">Current Stats</h3>
          <p className="text-white">
            Weight: <span className="font-bold">{profile.current_weight} kg</span>
          </p>
          <p className="text-white">
            Height: <span className="font-bold">{profile.height} cm</span>
          </p>
          <p className="text-white">
            BMI: <span className="font-bold">{bmi.toFixed(1)}</span>
          </p>
        </div>
        <div className="bg-slate-800/80 p-4 rounded-xl border border-green-900/20">
          <h3 className="text-green-300 font-semibold mb-2">Goals</h3>
          <p className="text-white">
            Target: <span className="font-bold">{profile.goal_weight} kg</span>
          </p>
          <p className="text-white">
            Goal: <span className="font-bold">{goalText}</span>
          </p>
          <p
            className={`font-bold ${
              weightDifference > 0
                ? "text-green-400"
                : weightDifference < 0
                  ? "text-orange-400"
                  : "text-blue-400"
            }`}
          >
            {weightDifference > 0
              ? `+${weightDifference.toFixed(1)} kg to gain`
              : weightDifference < 0
                ? `${Math.abs(weightDifference).toFixed(1)} kg to lose`
                : "At goal weight!"}
          </p>
        </div>
      </div>
    </div>
  );
}
