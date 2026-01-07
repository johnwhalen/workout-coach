import { http, HttpResponse } from "msw";

/**
 * MSW request handlers for testing API interactions
 *
 * These handlers intercept network requests during tests and
 * return mock responses.
 */

const BASE_URL = "http://localhost:3000";

export const handlers = [
  // Chat endpoint
  http.post(`${BASE_URL}/api/chat`, () => {
    return HttpResponse.json({
      type: "complete",
      message: "Workout logged successfully!",
      data: {
        sets: [{ weight: 135, reps: 10 }],
      },
    });
  }),

  // Routines endpoint
  http.get(`${BASE_URL}/api/routines`, () => {
    return HttpResponse.json({
      routines: [
        {
          routine_id: "routine-1",
          routine_name: "Full Super A",
          user_id: "test-user-id",
          date_created: new Date().toISOString(),
        },
      ],
    });
  }),

  // Workouts endpoint
  http.get(`${BASE_URL}/api/workouts`, () => {
    return HttpResponse.json({
      workouts: [
        {
          workout_id: "workout-1",
          workout_name: "Bench Press",
          routine_id: "routine-1",
          date: new Date().toISOString(),
        },
      ],
    });
  }),

  // Workouts by date endpoint
  http.get(`${BASE_URL}/api/workouts/by-date`, () => {
    return HttpResponse.json({
      workouts: [],
    });
  }),

  // Sets endpoint
  http.get(`${BASE_URL}/api/sets`, () => {
    return HttpResponse.json({
      sets: [
        {
          set_id: "set-1",
          set_weight: 135,
          set_reps: 10,
          workout_id: "workout-1",
          date: new Date().toISOString(),
        },
      ],
    });
  }),

  // User profile endpoint
  http.get(`${BASE_URL}/api/users/profile`, () => {
    return HttpResponse.json({
      user: {
        user_id: "test-user-id",
        email: "test@example.com",
        name: "Test User",
        current_weight: null,
        height: null,
        goal_weight: null,
        fitness_goal: null,
        profile_complete: false,
      },
    });
  }),

  http.put(`${BASE_URL}/api/users/profile`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      user: {
        user_id: "test-user-id",
        ...body,
      },
    });
  }),

  // User history endpoint
  http.get(`${BASE_URL}/api/users/history`, () => {
    return HttpResponse.json({
      messages: [],
    });
  }),

  // Calories endpoint
  http.get(`${BASE_URL}/api/calories`, () => {
    return HttpResponse.json({
      data: [],
      totalCalories: 0,
    });
  }),
];

/**
 * Error handlers for testing error scenarios
 */
export const errorHandlers = {
  unauthorized: http.post(`${BASE_URL}/api/chat`, () => {
    return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
  }),

  rateLimited: http.post(`${BASE_URL}/api/chat`, () => {
    return HttpResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": "60",
        },
      }
    );
  }),

  serverError: http.post(`${BASE_URL}/api/chat`, () => {
    return HttpResponse.json({ error: "Internal server error" }, { status: 500 });
  }),
};
