/**
 * Chat API endpoint - Main AI-powered workout coaching interface
 *
 * POST /api/chat - Process user messages and return AI responses via SSE stream
 */

import { processWithAI } from "@/lib/ai";
import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit";
import { createLogger, generateRequestId } from "@/lib/utils/logger";
import { ChatActionHandler } from "@/lib/api/handlers/chat-handler";

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

  // Authentication and Rate Limiting
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

  // Request Validation
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

  // Initialize Action Handler
  const actionHandler = new ChatActionHandler(userId, log);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 1. Notify client processing started
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "start", message: "Analyzing your request..." })}\n\n`
          )
        );

        // 2. Process with AI
        const result = await processWithAI(prompt, userId);

        // 3. Handle Actions (side effects, db updates)
        const responseMessage = await actionHandler.handle(result);

        // 4. Send final response
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "complete",
              message: responseMessage,
              isComplete: true,
            })}\n\n`
          )
        );
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
