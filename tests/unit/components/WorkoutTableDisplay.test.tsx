import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { WorkoutTableDisplay } from "@/components/chat/WorkoutTableDisplay";
import { FunctionComponent, ReactNode } from "react";
import { MantineProvider } from "@mantine/core";

// Mock MantineProvider to avoid theme issues in tests
const ThemeWrapper: FunctionComponent<{ children: ReactNode }> = ({ children }) => (
  <MantineProvider>{children}</MantineProvider>
);

// Mock toast to prevent errors
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Sample data with supersets
const mockWorkoutData = {
  title: "Superset Chest Blast",
  exercises: [
    {
      name: "Bench Press",
      sets: 3,
      reps: 10,
      weight: "135 lbs",
      supersetGroup: "A",
    },
    {
      name: "Push Ups",
      sets: 3,
      reps: 15,
      supersetGroup: "A",
    },
    {
      name: "Cable Flys",
      sets: 3,
      reps: 12,
      weight: "25 lbs",
    },
  ],
};

describe("WorkoutTableDisplay", () => {
  it("renders the workout title", () => {
    render(<WorkoutTableDisplay data={mockWorkoutData} />, { wrapper: ThemeWrapper });
    expect(screen.getByText("Superset Chest Blast")).toBeDefined();
  });

  it("renders all exercises", () => {
    render(<WorkoutTableDisplay data={mockWorkoutData} />, { wrapper: ThemeWrapper });
    expect(screen.getByText("Bench Press")).toBeDefined();
    expect(screen.getByText("Push Ups")).toBeDefined();
    expect(screen.getByText("Cable Flys")).toBeDefined();
  });

  it("displays superset badges", () => {
    render(<WorkoutTableDisplay data={mockWorkoutData} />, { wrapper: ThemeWrapper });
    // Should find at least one "A" badge
    const badges = screen.getAllByText("A");
    expect(badges.length).toBeGreaterThan(0);
  });

  it("handles logging an exercise", () => {
    render(<WorkoutTableDisplay data={mockWorkoutData} />, { wrapper: ThemeWrapper });

    // Find Log buttons
    const logButtons = screen.getAllByRole("button", { name: "Log" });
    expect(logButtons.length).toBe(3);

    // Click first one
    fireEvent.click(logButtons[0]);

    // Expect button to change to checkmark
    expect(screen.getByText("✓")).toBeDefined();

    // Expect toast to be called (implementation detail, but good verification)
    // We mocked it, so no error thrown
  });

  it("handles 'Log All' functionality", () => {
    render(<WorkoutTableDisplay data={mockWorkoutData} />, { wrapper: ThemeWrapper });

    const logAllBtn = screen.getByRole("button", { name: "Log All" });
    fireEvent.click(logAllBtn);

    // Should see 3 checkmarks now
    const checkmarks = screen.getAllByText("✓");
    expect(checkmarks.length).toBe(3);
  });
});
