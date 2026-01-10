/**
 * Chat Action Handler
 *
 * Responsible for executing side effects based on AI parsed actions.
 * Decouples API route from specific business logic implementations.
 */

import { WorkoutService } from "@/lib/services/workout.service";
import { isLogWorkoutAction, type ParsedAction } from "@/types/ai";
import type { createLogger } from "@/lib/utils/logger";

export class ChatActionHandler {
  constructor(
    private userId: string,
    private log: ReturnType<typeof createLogger>
  ) {}

  /**
   * Handle the parsed action and execute necessary side effects
   */
  async handle(result: ParsedAction): Promise<string> {
    const responseMessage = result.message || result.response || "I understood your request.";

    try {
      if (isLogWorkoutAction(result)) {
        await this.handleLogWorkout(result);
        return responseMessage;
      }

      switch (result.action) {
        case "check_in":
          // No side effects currently, just returns message
          return responseMessage;

        case "get_recommendation":
          // Returns AI message or fallback
          return result.recommendation?.aiMessage || responseMessage;

        case "fitness_response":
        case "fitness_question":
        default:
          return responseMessage;
      }
    } catch (error) {
      this.log.error("Error handling chat action", { action: result.action }, error as Error);
      throw error;
    }
  }

  /**
   * Handle workout logging action
   */
  private async handleLogWorkout(result: ParsedAction) {
    // We use type narrowing here despite the check in handle() for safety
    if (!isLogWorkoutAction(result)) return;

    this.log.info("Logging workout via service", {
      routine: result.routineName,
      workout: result.workoutName?.[0],
    });

    await WorkoutService.logWorkout({
      userId: this.userId,
      workoutName: result.workoutName,
      sets: result.sets,
      routineName: result.routineName,
      date: result.date,
      totalCalories: result.totalCalories,
    });
  }
}
