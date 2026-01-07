/**
 * AI Abstraction Layer using Vercel AI SDK
 *
 * This module provides a provider-agnostic interface for AI operations.
 * Currently configured for Claude (Anthropic), but can easily switch to
 * OpenAI, Google, or other providers by changing the model configuration.
 *
 * Benefits over direct SDK usage:
 * - Swap providers without code changes
 * - Consistent streaming API across providers
 * - Better TypeScript support
 * - Built-in error handling
 */

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import prisma from "@/prisma/prisma";

// ============================================================================
// CONFIGURATION - Change provider here to switch AI models
// ============================================================================

// Default model - can be overridden per-request
const DEFAULT_MODEL = anthropic("claude-sonnet-4-20250514");

// Alternative models (uncomment to use):
// import { openai } from "@ai-sdk/openai";
// const DEFAULT_MODEL = openai("gpt-4-turbo");
//
// import { google } from "@ai-sdk/google";
// const DEFAULT_MODEL = google("gemini-1.5-pro");

// ============================================================================
// TYPES
// ============================================================================

export interface WorkoutSet {
  reps: number;
  weight: number;
  calories?: number;
}

export interface CheckInData {
  energyLevel: number; // 1-5
  sleepQuality: number; // 1-5
  sorenessLevel: number; // 1-5
  timeAvailable?: number; // minutes
  notes?: string;
}

export interface WorkoutRecommendation {
  intensityAdjustment: number;
  exercises: {
    name: string;
    targetWeight: number;
    targetReps: number;
    sets: number;
    videoUrl?: string;
    notes?: string;
  }[];
  aiMessage: string;
}

export interface ParsedAction {
  action:
    | "log_workout"
    | "log_workouts"
    | "record_workout"
    | "record_workouts"
    | "save_workout"
    | "save_workouts"
    | "add_workout"
    | "add_workouts"
    | "add_multiple_workouts"
    | "create_routine"
    | "delete_routine"
    | "delete_workout"
    | "delete_set"
    | "fitness_question"
    | "fitness_response"
    | "check_in"
    | "get_recommendation"
    | string;
  workoutName?: string[];
  sets?: WorkoutSet[];
  routineName?: string;
  date?: string;
  totalCalories?: number;
  response?: string;
  message?: string;
  checkIn?: CheckInData;
  recommendation?: WorkoutRecommendation;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user's conversation history from database
 */
async function getUserHistory(userId: string): Promise<string[]> {
  try {
    const user = await prisma.userChatHistory.findUnique({
      where: { userId },
    });
    return user?.messages || [];
  } catch (error) {
    console.error("Error fetching user history:", error);
    return [];
  }
}

/**
 * Update user's conversation history in database
 */
async function updateUserHistory(
  userId: string,
  messages: string[]
): Promise<void> {
  try {
    await prisma.userChatHistory.upsert({
      where: { userId },
      update: { messages },
      create: { userId, messages },
    });
  } catch (error) {
    console.error("Error updating user history:", error);
  }
}

/**
 * Calculate workout intensity adjustment based on check-in data
 */
export function calculateIntensityAdjustment(checkIn: CheckInData): number {
  const { energyLevel, sleepQuality, sorenessLevel } = checkIn;

  let adjustment = 1.0;

  // Energy level adjustments
  if (energyLevel <= 2) adjustment -= 0.15;
  else if (energyLevel >= 4) adjustment += 0.05;

  // Sleep quality adjustments
  if (sleepQuality <= 2) adjustment -= 0.1;
  else if (sleepQuality >= 4) adjustment += 0.02;

  // Soreness adjustments
  if (sorenessLevel >= 4) adjustment -= 0.1;
  else if (sorenessLevel <= 2) adjustment += 0.02;

  return Math.max(0.7, Math.min(1.1, adjustment));
}

/**
 * Build system prompt with user context
 */
function buildSystemPrompt(
  userProfile: {
    current_weight: number | null;
    height: number | null;
    goal_weight: number | null;
    fitness_goal: string | null;
    profile_complete: boolean;
  } | null,
  recentHistory: string
): string {
  let personalizedContext = "";
  if (userProfile && userProfile.profile_complete) {
    personalizedContext = `
User's Fitness Profile:
- Current Weight: ${userProfile.current_weight}kg
- Height: ${userProfile.height}cm
- Goal Weight: ${userProfile.goal_weight}kg
- Fitness Goal: ${userProfile.fitness_goal?.replace("_", " ")}

The user is returning to training after a 3-6 month break.
Starting weights should be ~50% of previous maximums.
Progressive overload: increase by 2.5-5 lbs or 1-2 reps per week, max 10% increase.
`;
  }

  const equipmentContext = `
User's Equipment:
- Hydrow rowing machine (for 5-10 min warm-up)
- Adjustable bench (incline, flat, decline)
- Dumbbells up to 55 lbs
`;

  return `You are a supportive personal workout coach. Your job is to help with workout tracking and provide personalized fitness guidance.

${personalizedContext}
${equipmentContext}

First, determine if the user's input is:
1. A pre-workout check-in (asking how they feel, energy, sleep, soreness)
2. A workout/routine management command (logging sets, creating routines)
3. A general fitness question
4. A request for workout recommendations

For CHECK-IN responses, return JSON:
{
  "action": "check_in",
  "checkIn": {
    "energyLevel": <1-5 inferred from their response>,
    "sleepQuality": <1-5 inferred>,
    "sorenessLevel": <1-5 inferred>
  },
  "response": "<Encouraging response with intensity recommendation>"
}

For WORKOUT MANAGEMENT, return JSON:
{
  "action": "log_workout" | "add_workout" | "create_routine" | "delete_routine" | "delete_workout" | "delete_set",
  "workoutName": ["exercise names"],
  "sets": [{"reps": N, "weight": N, "calories": N}],
  "routineName": "routine name",
  "date": "${new Date().toISOString().split("T")[0]}"
}

For FITNESS QUESTIONS, return JSON:
{
  "action": "fitness_question",
  "response": "<helpful answer>"
}

For WORKOUT RECOMMENDATIONS, return JSON:
{
  "action": "get_recommendation",
  "recommendation": {
    "intensityAdjustment": <0.7-1.1>,
    "exercises": [
      {
        "name": "Exercise Name",
        "targetWeight": N,
        "targetReps": N,
        "sets": 3,
        "notes": "optional form cues"
      }
    ],
    "aiMessage": "<explanation of today's workout adjustments>"
  }
}

Keep responses encouraging but realistic. For someone returning from a break:
- Start conservative (50% of previous weights)
- Focus on form over weight
- Build consistency before intensity

Recent conversation:
${recentHistory}

Respond with ONLY valid JSON, no additional text.`;
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Process user input with AI and return structured action
 *
 * This is the main entry point for AI processing. It:
 * 1. Retrieves user history and profile
 * 2. Builds a contextual prompt
 * 3. Calls the AI model
 * 4. Parses and validates the response
 */
export async function processWithAI(
  textInput: string,
  userId: string
): Promise<ParsedAction> {
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
        response:
          "I had trouble processing that. Could you rephrase your question?",
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
