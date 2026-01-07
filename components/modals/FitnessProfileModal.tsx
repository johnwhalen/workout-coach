"use client";
import { Button, Card, Select, TextInput, Title } from "@mantine/core";
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
    <div className="fixed inset-0 bg-navy-900/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md glassmorphism border border-slate-700/30">
        <div className="space-y-4">
          <Title order={3} className="text-gold">
            Your Profile
          </Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 2x2 grid layout */}
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                label="Current Weight (kg)"
                placeholder="70"
                type="number"
                step="0.1"
                value={formData.currentWeight}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, currentWeight: e.target.value })
                }
                required
                styles={darkInputStyles}
              />

              <TextInput
                label="Goal Weight (kg)"
                placeholder="65"
                type="number"
                step="0.1"
                value={formData.goalWeight}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, goalWeight: e.target.value })
                }
                required
                styles={darkInputStyles}
              />

              <TextInput
                label="Height (cm)"
                placeholder="175"
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, height: e.target.value })
                }
                required
                styles={darkInputStyles}
              />

              <Select
                label="Goal"
                placeholder="Select"
                data={fitnessGoalOptions}
                value={formData.fitnessGoal}
                onChange={(value: string | null) =>
                  setFormData({ ...formData, fitnessGoal: value || "" })
                }
                required
                styles={darkInputStyles}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="subtle"
                onClick={onClose}
                className="flex-1 text-slate-400 hover:text-white"
                disabled={loading}
              >
                Later
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1 bg-gold hover:bg-gold/90 text-navy-900"
              >
                Save
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
