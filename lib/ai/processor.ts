/**
 * Main AI processing functions
 */

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import prisma from "@/prisma/prisma";
import type { ParsedAction } from "@/types/ai";
import { getUserHistory, updateUserHistory } from "./history";
import { buildSystemPrompt } from "./prompts";
import { calculateIntensityAdjustment } from "./intensity";

// Default model - can be overridden per-request
const DEFAULT_MODEL = anthropic("claude-sonnet-4-20250514");

/**
 * Process user input with AI and return structured action
 *
 * This is the main entry point for AI processing. It:
 * 1. Retrieves user history and profile
 * 2. Builds a contextual prompt
 * 3. Calls the AI model
 * 4. Parses and validates the response
 */
export async function processWithAI(textInput: string, userId: string): Promise<ParsedAction> {
  // Retrieve user's conversation history
  let userHistory = await getUserHistory(userId);

  // Get user's fitness profile
  const userProfile = await prisma.user.findUnique({
    where: { user_id: userId },
    select: {
      current_weight: true,
      height: true,
      goal_weight: true,
      fitness_goal: true,
      profile_complete: true,
    },
  });

  // Add current input to history
  userHistory.push(textInput);
  userHistory = userHistory.slice(-5); // Keep last 5 interactions
  await updateUserHistory(userId, userHistory);

  const recentHistory = userHistory.join("\n");
  const systemPrompt = buildSystemPrompt(userProfile, recentHistory);

  try {
    // Use Vercel AI SDK's generateText
    const { text } = await generateText({
      model: DEFAULT_MODEL,
      system: systemPrompt,
      prompt: textInput,
    });

    // Parse JSON response
    let parsedData: ParsedAction;
    try {
      parsedData = JSON.parse(text);
    } catch {
      console.error("Error parsing AI response:", text);
      parsedData = {
        action: "fitness_question",
        response: "I had trouble processing that. Could you rephrase your question?",
      };
    }

    // Ensure date is set to today if not provided
    const currentDate = new Date().toISOString().split("T")[0];
    if (!parsedData.date) {
      parsedData.date = currentDate;
    }

    // Calculate intensity adjustment for check-ins
    if (parsedData.action === "check_in" && parsedData.checkIn) {
      const adjustment = calculateIntensityAdjustment(parsedData.checkIn);
      if (adjustment < 1) {
        parsedData.response += ` I'll dial back today's weights to ${Math.round(
          adjustment * 100
        )}% intensity.`;
      } else if (adjustment > 1) {
        parsedData.response += ` You're feeling great! Let's push a bit harder today.`;
      }
    }

    return parsedData;
  } catch (error) {
    console.error("Error during AI processing:", error);
    return {
      action: "fitness_question",
      response: "Sorry, I encountered an error. Please try again.",
    };
  }
}

/**
 * Backward-compatible alias for processWithAI
 * @deprecated Use processWithAI instead
 */
export const processWithClaude = processWithAI;
