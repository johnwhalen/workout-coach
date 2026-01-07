/**
 * Chat API endpoint - Main AI-powered workout coaching interface
 *
 * POST /api/chat - Process user messages and return AI responses via SSE stream
 */

import { processWithAI } from "@/lib/ai";
import prisma from "@/prisma/prisma";
import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit";
import { createLogger, generateRequestId } from "@/lib/utils/logger";
import { findOrCreateRoutine, findOrCreateWorkout } from "@/lib/db/lookups";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ChatRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(10000, "Prompt too long"),
});

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const requestId = generateRequestId();
  const startTime = Date.now();

  const authUser = await currentUser();
  if (!authUser) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const log = createLogger({ source: "api/chat", requestId, userId: authUser.id });
  log.info("Chat request started");

  const rateLimit = checkRateLimit(authUser.id);
  if (!rateLimit.allowed) {
    log.warn("Rate limit exceeded", { remaining: rateLimit.remaining });
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please wait before trying again.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...getRateLimitHeaders(rateLimit.remaining, rateLimit.resetIn),
        },
      }
    );
  }

  let reqBody;
  try {
    reqBody = await req.json();
  } catch {
    log.warn("Invalid JSON in request body");
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parseResult = ChatRequestSchema.safeParse(reqBody);
  if (!parseResult.success) {
    log.warn("Request validation failed", { issues: parseResult.error.issues });
    return new Response(
      JSON.stringify({
        error: "Invalid request",
        details: parseResult.error.issues,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { prompt } = parseResult.data;
  const userId = authUser.id;
  log.info("Processing prompt", { promptLength: prompt.length });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "start", message: "Analyzing your request..." })}\n\n`
          )
        );

        const result = await processWithAI(prompt, userId);
        const responseMessage = result.message || result.response || "I understood your request.";

        if (result.action === "fitness_response" || result.action === "fitness_question") {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                message: responseMessage,
                isComplete: true,
              })}\n\n`
            )
          );
        } else if (result.action === "check_in") {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                message: responseMessage,
                isComplete: true,
              })}\n\n`
            )
          );
        } else if (result.action === "get_recommendation" && result.recommendation) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                message: result.recommendation.aiMessage || responseMessage,
                isComplete: true,
              })}\n\n`
            )
          );
        } else if (
          result.action === "log_workout" ||
          result.action === "log_workouts" ||
          result.action === "add_workout" ||
          result.action === "add_workouts" ||
          result.action === "record_workout" ||
          result.action === "record_workouts" ||
          result.action === "save_workout" ||
          result.action === "save_workouts"
        ) {
          const { workoutName, sets, routineName, date, totalCalories } = result;

          const routineId = await findOrCreateRoutine(userId, routineName || "General Workout");
          const workoutId = await findOrCreateWorkout(
            userId,
            routineId,
            workoutName?.[0] || "Workout"
          );

          if (totalCalories) {
            await prisma.workout.update({
              where: { workout_id: workoutId },
              data: { total_calories_burned: totalCalories },
            });
          }

          if (sets && sets.length > 0) {
            await Promise.all(
              sets.map((set) =>
                prisma.set.create({
                  data: {
                    workout_id: workoutId,
                    set_reps: set.reps,
                    set_weight: parseFloat(String(set.weight)),
                    calories_burned: set.calories || null,
                    date: new Date(date || new Date()),
                  },
                })
              )
            );
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                message: responseMessage,
                isComplete: true,
              })}\n\n`
            )
          );
        } else {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                message: responseMessage,
                isComplete: true,
              })}\n\n`
            )
          );
        }
      } catch (error) {
        log.error("Streaming error", { durationMs: Date.now() - startTime }, error as Error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message: "Sorry, I encountered an error processing your request.",
            })}\n\n`
          )
        );
      } finally {
        log.info("Request completed", { durationMs: Date.now() - startTime });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
