import { processWithAI } from "@/lib/ai";
import prisma from "@/prisma/prisma";
import Fuse from "fuse.js";
import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ChatRequestSchema = z.object({
    prompt: z.string().min(1, "Prompt is required").max(10000, "Prompt too long"),
});

const getRoutineIdByName = async (userId: any, routineName: any) => {
    try {
        // Default to "General Workout" if no routine name provided
        const searchName = routineName || "General Workout";

        const routines = await prisma.routine.findMany({
            where: { user_id: userId },
        });

        // If no routines exist or searchName is provided, try to find a match
        if (routines.length > 0 && searchName) {
            const fuse = new Fuse(routines, {
                keys: ["routine_name"],
                threshold: 0.4,
            });

            const result = fuse.search(searchName);
            if (result.length > 0) {
                return result[0].item.routine_id;
            }
        }

        // Create new routine if no match found
        const newRoutine = await prisma.routine.create({
            data: {
                routine_name: searchName,
                user_id: userId,
            },
        });
        return newRoutine.routine_id;
    } catch (error) {
        console.error("Error fetching routine ID:", error);
        throw new Error("Failed to retrieve or create routine ID");
    }
};

const getWorkoutIdByName = async (userId: any, workoutName: any, routineId: any, date?: any) => {
    try {
        // Default workout name if not provided
        const searchName = workoutName || "Workout";

        const workouts = await prisma.workout.findMany({
            where: { routine_id: routineId },
        });

        // Try to find matching workout if we have workouts
        if (workouts.length > 0 && searchName) {
            const fuse = new Fuse(workouts, {
                keys: ["workout_name"],
                threshold: 0.4,
            });

            const result = fuse.search(searchName);
            if (result.length > 0) {
                return result[0].item.workout_id;
            }
        }

        // Create new workout if no match found
        const newWorkout = await prisma.workout.create({
            data: {
                workout_name: searchName,
                routine_id: routineId,
                date: date ? new Date(date) : new Date(),
                total_calories_burned: null,
            },
        });
        return newWorkout.workout_id;
    } catch (error) {
        console.error("Error fetching workout ID:", error);
        throw new Error("Failed to retrieve or create workout ID");
    }
};

export async function POST(req: NextRequest) {
    const encoder = new TextEncoder();

    // Auth check outside the stream
    const authUser = await currentUser();
    if (!authUser) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Rate limiting check
    const rateLimit = checkRateLimit(authUser.id);
    if (!rateLimit.allowed) {
        return new Response(
            JSON.stringify({ error: "Too many requests. Please wait before trying again." }),
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
        return new Response(JSON.stringify({ error: "Invalid JSON" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const parseResult = ChatRequestSchema.safeParse(reqBody);
    if (!parseResult.success) {
        return new Response(
            JSON.stringify({ error: "Invalid request", details: parseResult.error.issues }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    const { prompt } = parseResult.data;
    const userId = authUser.id;

    const stream = new ReadableStream({
        async start(controller) {
            try {
                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify({ type: "start", message: "Analyzing your request..." })}\n\n`
                    )
                );

                // Use the AI processor (Vercel AI SDK)
                const result = await processWithAI(prompt, userId);

                // Get the response message from either 'message' or 'response' field
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
                    // Handle check-in responses
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
                    // Handle workout recommendations
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({
                                type: "complete",
                                message: result.recommendation.aiMessage || responseMessage,
                                isComplete: true,
                            })}\n\n`
                        )
                    );
                } else if (result.action === "log_workout" || result.action === "log_workouts" ||
                           result.action === "add_workout" || result.action === "add_workouts" ||
                           result.action === "record_workout" || result.action === "record_workouts" ||
                           result.action === "save_workout" || result.action === "save_workouts") {
                    const { workoutName, sets, routineName, date, totalCalories } = result;

                    const routineId = await getRoutineIdByName(userId, routineName);
                    const workoutId = await getWorkoutIdByName(userId, workoutName?.[0] || "Workout", routineId);

                    if (totalCalories) {
                        await prisma.workout.update({
                            where: { workout_id: workoutId },
                            data: { total_calories_burned: totalCalories },
                        });
                    }

                    if (sets && sets.length > 0) {
                        await Promise.all(
                            sets.map((set: any) =>
                                prisma.set.create({
                                    data: {
                                        workout_id: workoutId,
                                        set_reps: set.reps,
                                        set_weight: parseFloat(set.weight),
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
                console.error("Streaming error:", error);
                controller.enqueue(
                    encoder.encode(
                        `data: ${JSON.stringify({
                            type: "error",
                            message: "Sorry, I encountered an error processing your request.",
                        })}\n\n`
                    )
                );
            } finally {
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
