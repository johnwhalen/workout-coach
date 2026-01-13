"use client";

import { useEffect, useState } from "react";
import { Stack, Text, Group, ActionIcon, ScrollArea, Box, Skeleton, Center } from "@mantine/core";
import { ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";
import { WorkoutSummaryCard } from "./WorkoutSummaryCard";

interface WorkoutSummary {
  workout_id: string;
  workout_name: string;
  routine_name: string;
  sets_count: number;
  total_reps: number;
  total_weight: number;
}

interface WorkoutSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  refreshTrigger: number;
}

export function WorkoutSidebar({ isOpen, onToggle, refreshTrigger }: WorkoutSidebarProps) {
  const [loading, setLoading] = useState(true);
  const [todaysWorkouts, setTodaysWorkouts] = useState<WorkoutSummary[]>([]);

  useEffect(() => {
    async function fetchTodaysWorkout() {
      setLoading(true);
      try {
        const response = await fetch("/api/workouts/by-date");
        const data = await response.json();

        if (data.success && data.workoutsByDate) {
          const today = new Date().toISOString().split("T")[0];
          setTodaysWorkouts(data.workoutsByDate[today] || []);
        }
      } catch (error) {
        console.error("Failed to fetch today's workout:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTodaysWorkout();
  }, [refreshTrigger]);

  return (
    <Box
      style={{
        width: isOpen ? "320px" : "0px",
        height: "100%",
        transition: "width 0.3s ease-in-out",
        position: "relative",
        background: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(12px)",
        borderRight: isOpen ? "1px solid rgba(51, 65, 85, 0.5)" : "none",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <Box p="md" style={{ borderBottom: "1px solid rgba(51, 65, 85, 0.3)" }}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Text fw={700} size="lg" c="amber.5" style={{ whiteSpace: "nowrap" }}>
            Today&apos;s Workout
          </Text>
          <ActionIcon variant="subtle" color="slate" onClick={onToggle}>
            <ChevronLeft size={20} />
          </ActionIcon>
        </Group>
      </Box>

      <ScrollArea style={{ flex: 1 }} p="md">
        <Stack gap="md">
          {loading ? (
            Array(3)
              .fill(0)
              .map((_, i) => <Skeleton key={i} height={100} radius="md" />)
          ) : todaysWorkouts.length > 0 ? (
            todaysWorkouts.map((workout) => (
              <WorkoutSummaryCard
                key={workout.workout_id}
                workoutName={workout.workout_name}
                routineName={workout.routine_name}
                setsCount={workout.sets_count}
                totalReps={workout.total_reps}
                totalWeight={workout.total_weight}
              />
            ))
          ) : (
            <Center py="xl">
              <Stack align="center" gap="xs">
                <Box style={{ opacity: 0.3 }}>
                  <Dumbbell size={48} />
                </Box>
                <Text c="dimmed" size="sm" ta="center">
                  No workouts logged yet today.
                </Text>
              </Stack>
            </Center>
          )}
        </Stack>
      </ScrollArea>

      {!isOpen && (
        <ActionIcon
          variant="filled"
          color="amber"
          size="xl"
          onClick={onToggle}
          style={{
            position: "absolute",
            top: "16px",
            right: "-20px",
            zIndex: 10,
            borderRadius: "50% 0 0 50%",
            transform: "translateX(-20px)",
          }}
        >
          <ChevronRight size={20} />
        </ActionIcon>
      )}
    </Box>
  );
}
