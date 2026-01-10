"use client";

import { Table, Text, Box, Paper, Stack, Badge } from "@mantine/core";
import { WorkoutTableData } from "@/lib/chat/workout-parser";

interface WorkoutTableDisplayProps {
  data: WorkoutTableData;
}

/**
 * Renders a structured workout as a clean, tabular display
 * Optimized for mobile and desktop chat bubbles
 */
export function WorkoutTableDisplay({ data }: WorkoutTableDisplayProps) {
  const { title, exercises } = data;

  return (
    <Paper
      withBorder
      p="sm"
      my="md"
      radius="md"
      bg="rgba(15, 23, 42, 0.4)" // Match navy-700/80 approximate
      style={{
        borderColor: "rgba(51, 65, 85, 0.5)",
        backdropFilter: "blur(8px)",
        overflow: "hidden",
      }}
    >
      <Stack gap="xs">
        {title && (
          <Text fw={700} c="amber.5" size="md">
            {title}
          </Text>
        )}

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
                  Weight
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {exercises.map((ex, index) => (
                <Table.Tr key={index} style={{ borderBottom: "1px solid rgba(51, 65, 85, 0.3)" }}>
                  <Table.Td>
                    <Stack gap={0}>
                      <Text size="sm" fw={500} c="white">
                        {ex.name}
                      </Text>
                      {ex.notes && (
                        <Text size="xs" c="dimmed" fs="italic">
                          {ex.notes}
                        </Text>
                      )}
                    </Stack>
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
                    {ex.weight || ex.duration ? (
                      <Badge color="amber" variant="light" size="sm">
                        {ex.weight || ex.duration}
                      </Badge>
                    ) : (
                      <Text size="sm" c="slate.3">
                        --
                      </Text>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      </Stack>
    </Paper>
  );
}
