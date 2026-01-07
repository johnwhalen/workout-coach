"use client";
import { Button, Card, Select, Text, TextInput, Title } from "@mantine/core";
import { useState } from "react";
import toast from "react-hot-toast";
import { darkInputStyles } from "@/lib/styles/forms";

interface FitnessProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function FitnessProfileModal({
  isOpen,
  onClose,
  onComplete,
}: FitnessProfileModalProps) {
  const [formData, setFormData] = useState({
    currentWeight: "",
    height: "",
    goalWeight: "",
    fitnessGoal: "",
  });
  const [loading, setLoading] = useState(false);

  const fitnessGoalOptions = [
    { value: "lose_weight", label: "Lose Weight" },
    { value: "gain_weight", label: "Gain Weight" },
    { value: "maintain_weight", label: "Maintain Weight" },
    { value: "add_muscle", label: "Add Muscle" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.currentWeight ||
      !formData.height ||
      !formData.goalWeight ||
      !formData.fitnessGoal
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Fitness profile created successfully!");
        onComplete();
        onClose();
      }
    } catch (error) {
      console.error("Error creating fitness profile:", error);
      toast.error("Failed to create fitness profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md glassmorphism border border-slate-800">
        <div className="space-y-6">
          <div className="text-center">
            <Title order={2} className="text-blue-400 mb-2">
              Complete Your Fitness Profile
            </Title>
            <Text className="text-gray-300">Help us personalize your fitness experience</Text>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput
              label="Current Weight (kg)"
              placeholder="e.g., 70"
              type="number"
              step="0.1"
              value={formData.currentWeight}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, currentWeight: e.target.value })
              }
              required
              className="text-white"
              styles={darkInputStyles}
            />

            <TextInput
              label="Height (cm)"
              placeholder="e.g., 175"
              type="number"
              step="0.1"
              value={formData.height}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, height: e.target.value })
              }
              required
              className="text-white"
              styles={darkInputStyles}
            />

            <TextInput
              label="Goal Weight (kg)"
              placeholder="e.g., 65"
              type="number"
              step="0.1"
              value={formData.goalWeight}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, goalWeight: e.target.value })
              }
              required
              className="text-white"
              styles={darkInputStyles}
            />

            <Select
              label="Fitness Goal"
              placeholder="Select your primary fitness goal"
              data={fitnessGoalOptions}
              value={formData.fitnessGoal}
              onChange={(value: string | null) =>
                setFormData({ ...formData, fitnessGoal: value || "" })
              }
              required
              className="text-white"
              styles={darkInputStyles}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Skip for now
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Complete Profile
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <style jsx global>{`
        .glassmorphism {
          background: rgba(17, 24, 39, 0.9);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  );
}
