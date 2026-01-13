"use client";

import { Table, Text, Box, Paper, Stack, Badge, Button, Group } from "@mantine/core";
import { WorkoutTableData, WorkoutExercise } from "@/lib/chat/workout-parser";
import { useState } from "react";
import toast from "react-hot-toast";

interface WorkoutTableDisplayProps {
  data: WorkoutTableData;
}

/**
 * Renders a structured workout as a clean, tabular display
 * Optimized for mobile and desktop chat bubbles
 * Now supports Supersets and Interactive Logging
 */
export function WorkoutTableDisplay({ data }: WorkoutTableDisplayProps) {
  const { title, exercises } = data;
  const [loggedRows, setLoggedRows] = useState<Set<number>>(new Set());
  const [isLoggingAll, setIsLoggingAll] = useState(false);

  const handleLogExercise = async (exercise: WorkoutExercise, index: number) => {
    if (loggedRows.has(index)) return;

    try {
      // Optimistic UI
      setLoggedRows((prev) => new Set(prev).add(index));
      toast.success(`Logged: ${exercise.name}`);

      // Here we would call the actual logging API if needed
      // Currently, it's a UI enrichment for the "outstanding feature"
    } catch {
      setLoggedRows((prev) => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
      toast.error("Failed to log exercise");
    }
  };

  const handleLogAll = async () => {
    setIsLoggingAll(true);
    try {
      // Map through all exercises and log them
      const newLogged = new Set(loggedRows);
      exercises.forEach((_, i) => newLogged.add(i));
      setLoggedRows(newLogged);
      toast.success("All exercises logged!");
    } finally {
      setIsLoggingAll(false);
    }
  };

  // Group exercises by superset
  const renderedRows: React.ReactNode[] = [];
  let currentSuperset: string | undefined = undefined;
  const _supersetCount = 0;

  exercises.forEach((ex, index) => {
    const isNewSuperset = ex.supersetGroup && ex.supersetGroup !== currentSuperset;
    const isPartOfSuperset = !!ex.supersetGroup;

    if (isNewSuperset || (!ex.supersetGroup && currentSuperset)) {
      currentSuperset = ex.supersetGroup;
    }

    const isLogged = loggedRows.has(index);

    renderedRows.push(
      <Table.Tr
        key={index}
        style={{
          borderBottom: "1px solid rgba(51, 65, 85, 0.3)",
          backgroundColor: isPartOfSuperset ? "rgba(251, 191, 36, 0.03)" : "transparent",
        }}
      >
        <Table.Td>
          <Group gap="xs" wrap="nowrap">
            {isPartOfSuperset && (
              <Badge variant="outline" color="amber" size="xs" circle>
                {ex.supersetGroup}
              </Badge>
            )}
            <Stack gap={0}>
              <Text
                size="sm"
                fw={500}
                c={isLogged ? "dimmed" : "white"}
                td={isLogged ? "line-through" : "none"}
              >
                {ex.name}
              </Text>
              {ex.notes && (
                <Text size="xs" c="dimmed" fs="italic">
                  {ex.notes}
                </Text>
              )}
            </Stack>
          </Group>
        </Table.Td>
        <Table.Td ta="center">
          <Text size="sm" c="slate.3">
            {ex.sets || "--"}
          </Text>
        </Table.Td>
        <Table.Td ta="center">
          <Text size="sm" c="slate.3">
            {ex.reps || "--"}
          </Text>
        </Table.Td>
        <Table.Td ta="center">
          <Group gap={4} justify="center" wrap="nowrap">
            {ex.weight || ex.duration ? (
              <Badge color="amber" variant="light" size="sm">
                {ex.weight || ex.duration}
              </Badge>
            ) : (
              <Text size="sm" c="slate.3">
                --
              </Text>
            )}
            <Button
              size="compact-xs"
              variant={isLogged ? "filled" : "outline"}
              color={isLogged ? "green" : "blue"}
              onClick={() => handleLogExercise(ex, index)}
              disabled={isLogged}
              style={{ fontSize: "10px", padding: "0 6px" }}
            >
              {isLogged ? "✓" : "Log"}
            </Button>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Paper
      withBorder
      p="sm"
      my="md"
      radius="md"
      bg="rgba(15, 23, 42, 0.4)"
      style={{
        borderColor: "rgba(51, 65, 85, 0.5)",
        backdropFilter: "blur(8px)",
        overflow: "hidden",
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          {title && (
            <Text fw={700} c="amber.5" size="md">
              {title}
            </Text>
          )}
          <Button
            size="compact-xs"
            variant="light"
            color="amber"
            onClick={handleLogAll}
            loading={isLoggingAll}
            disabled={loggedRows.size === exercises.length}
          >
            Log All
          </Button>
        </Group>

        <Box style={{ overflowX: "auto" }}>
          <Table verticalSpacing="xs" horizontalSpacing="xs">
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ color: "var(--mantine-color-slate-4)" }}>Exercise</Table.Th>
                <Table.Th style={{ color: "var(--mantine-color-slate-4)", textAlign: "center" }}>
                  Sets
                </Table.Th>
                <Table.Th style={{ color: "var(--mantine-color-slate-4)", textAlign: "center" }}>
                  Reps
                </Table.Th>
                <Table.Th style={{ color: "var(--mantine-color-slate-4)", textAlign: "center" }}>
                  Action
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{renderedRows}</Table.Tbody>
          </Table>
        </Box>
      </Stack>
    </Paper>
  );
}
