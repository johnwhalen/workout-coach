/**
 * Parser for structured workout blocks in chat messages
 */

export interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: string;
  duration?: string;
  notes?: string;
}

export interface WorkoutTableData {
  title?: string;
  exercises: WorkoutExercise[];
}

export interface ParsedMessage {
  text: string;
  workouts: WorkoutTableData[];
}

/**
 * Parses a message string for ```workout JSON blocks
 * Returns the cleaned text and any parsed workout data
 */
export function parseWorkoutBlocks(content: string): ParsedMessage {
  const workoutRegex = /```workout\n([\s\S]*?)```/g;
  const workouts: WorkoutTableData[] = [];

  const text = content.replace(workoutRegex, (_, json) => {
    try {
      const parsed = JSON.parse(json.trim());
      if (parsed.exercises && Array.isArray(parsed.exercises)) {
        workouts.push(parsed);
        return ""; // Remove the block from the text
      }
      return _; // If invalid format, keep as is
    } catch (e) {
      console.error("Failed to parse workout JSON block", e);
      return _; // Keep invalid blocks as text
    }
  });

  return {
    text: text.trim(),
    workouts,
  };
}
