"use client";

import { Card, Text, Group, Stack, Badge, Box } from "@mantine/core";

interface WorkoutSummaryCardProps {
  workoutName: string;
  routineName: string;
  setsCount: number;
  totalReps: number;
  totalWeight: number;
}

export function WorkoutSummaryCard({
  workoutName,
  routineName,
  setsCount,
  totalReps,
  totalWeight,
}: WorkoutSummaryCardProps) {
  return (
    <Card
      withBorder
      padding="sm"
      radius="md"
      bg="rgba(30, 41, 59, 0.4)"
      style={{
        borderColor: "rgba(51, 65, 85, 0.5)",
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Text fw={600} size="sm" c="white" truncate>
            {workoutName}
          </Text>
          <Badge color="blue" variant="light" size="xs">
            {routineName}
          </Badge>
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Box
            style={{
              flex: 1,
              textAlign: "center",
              padding: "4px",
              borderRadius: "4px",
              background: "rgba(15, 23, 42, 0.3)",
            }}
          >
            <Text size="xs" c="dimmed">
              Sets
            </Text>
            <Text fw={700} size="sm" c="amber.4">
              {setsCount}
            </Text>
          </Box>

          <Box
            style={{
              flex: 1,
              textAlign: "center",
              padding: "4px",
              borderRadius: "4px",
              background: "rgba(15, 23, 42, 0.3)",
            }}
          >
            <Text size="xs" c="dimmed">
              Reps
            </Text>
            <Text fw={700} size="sm" c="amber.4">
              {totalReps}
            </Text>
          </Box>

          <Box
            style={{
              flex: 1.2,
              textAlign: "center",
              padding: "4px",
              borderRadius: "4px",
              background: "rgba(15, 23, 42, 0.3)",
            }}
          >
            <Text size="xs" c="dimmed">
              Volume (lbs)
            </Text>
            <Text fw={700} size="sm" c="amber.4">
              {totalWeight.toLocaleString()}
            </Text>
          </Box>
        </Group>
      </Stack>
    </Card>
  );
}
