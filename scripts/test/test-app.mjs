#!/usr/bin/env node
/**
 * Comprehensive Test Script for Golden Harbor Workout Coach
 *
 * This script tests:
 * 1. Chat functionality - various prompt types
 * 2. Workout logging - with and without routine names
 * 3. Routine management - creating, viewing
 * 4. Chat history - persistence across sessions
 * 5. Error handling - edge cases
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Test user ID - use your actual user ID
const TEST_USER_ID = process.argv[2] || "user_37nKhyQh1e31YilWlgJ0TGVfabP";
const BASE_URL = process.argv[3] || "http://localhost:3000";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log("\n" + "=".repeat(60));
  log(title, "cyan");
  console.log("=".repeat(60));
}

function logTest(name, passed, details = "") {
  const status = passed
    ? `${colors.green}✓ PASS${colors.reset}`
    : `${colors.red}✗ FAIL${colors.reset}`;
  console.log(`  ${status} - ${name}`);
  if (details && !passed) {
    console.log(`    ${colors.yellow}Details: ${details}${colors.reset}`);
  }
}

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function recordTest(name, passed, details = "") {
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
  } else {
    results.failed++;
  }
  logTest(name, passed, details);
}

/**
 * Test 1: Database Connection
 */
async function testDatabaseConnection() {
  logSection("TEST 1: Database Connection");

  try {
    const user = await prisma.user.findUnique({
      where: { user_id: TEST_USER_ID },
    });
    recordTest("Database connection", true);
    recordTest("User exists", !!user, user ? "" : "User not found");
    return !!user;
  } catch (error) {
    recordTest("Database connection", false, error.message);
    return false;
  }
}

/**
 * Test 2: Chat History Operations
 */
async function testChatHistory() {
  logSection("TEST 2: Chat History Operations");

  try {
    // Get current history
    const history = await prisma.userChatHistory.findUnique({
      where: { userId: TEST_USER_ID },
    });
    recordTest("Fetch chat history", true);
    recordTest("History exists", !!history, "No chat history found");

    if (history) {
      const messageCount = history.messages?.length || 0;
      recordTest(`Message count (${messageCount} messages)`, messageCount >= 0);
    }

    // Test updating history
    const testMessage = JSON.stringify({
      text: "__TEST_MESSAGE__",
      isUser: true,
      timestamp: new Date().toISOString(),
    });
    const updatedHistory = await prisma.userChatHistory.upsert({
      where: { userId: TEST_USER_ID },
      update: { messages: { push: testMessage } },
      create: { userId: TEST_USER_ID, messages: [testMessage] },
    });
    recordTest("Update chat history", true);

    // Clean up test message
    const cleanedMessages = updatedHistory.messages.filter((m) => !m.includes("__TEST_MESSAGE__"));
    await prisma.userChatHistory.update({
      where: { userId: TEST_USER_ID },
      data: { messages: cleanedMessages },
    });
    recordTest("Cleanup test message", true);

    return true;
  } catch (error) {
    recordTest("Chat history operations", false, error.message);
    return false;
  }
}

/**
 * Test 3: Routine Operations
 */
async function testRoutineOperations() {
  logSection("TEST 3: Routine Operations");

  try {
    // List existing routines
    const routines = await prisma.routine.findMany({
      where: { user_id: TEST_USER_ID },
    });
    recordTest("Fetch routines", true);
    recordTest(`Found ${routines.length} routines`, routines.length > 0, "No routines found");

    // Log routine names
    if (routines.length > 0) {
      log(`  Routines: ${routines.map((r) => r.routine_name).join(", ")}`, "blue");
    }

    // Test creating a routine
    const testRoutineName = "__TEST_ROUTINE__";
    const testRoutine = await prisma.routine.create({
      data: {
        routine_name: testRoutineName,
        user_id: TEST_USER_ID,
      },
    });
    recordTest("Create test routine", !!testRoutine.routine_id);

    // Clean up
    await prisma.routine.delete({
      where: { routine_id: testRoutine.routine_id },
    });
    recordTest("Delete test routine", true);

    return true;
  } catch (error) {
    recordTest("Routine operations", false, error.message);
    return false;
  }
}

/**
 * Test 4: Workout Operations
 */
async function testWorkoutOperations() {
  logSection("TEST 4: Workout Operations");

  try {
    // Get workouts for user
    const routines = await prisma.routine.findMany({
      where: { user_id: TEST_USER_ID },
      include: { workouts: true },
    });

    let totalWorkouts = 0;
    for (const routine of routines) {
      totalWorkouts += routine.workouts.length;
    }
    recordTest("Fetch workouts", true);
    recordTest(
      `Found ${totalWorkouts} workouts across ${routines.length} routines`,
      totalWorkouts >= 0
    );

    // Test creating a workout with sets
    if (routines.length > 0) {
      const testWorkout = await prisma.workout.create({
        data: {
          workout_name: "__TEST_WORKOUT__",
          routine_id: routines[0].routine_id,
          date: new Date(),
        },
      });
      recordTest("Create test workout", !!testWorkout.workout_id);

      // Create a test set
      const testSet = await prisma.set.create({
        data: {
          workout_id: testWorkout.workout_id,
          set_reps: 10,
          set_weight: 25,
          date: new Date(),
        },
      });
      recordTest("Create test set", !!testSet.set_id);

      // Verify set was created
      const verifySet = await prisma.set.findUnique({
        where: { set_id: testSet.set_id },
      });
      recordTest("Verify set persistence", !!verifySet);

      // Clean up
      await prisma.set.delete({ where: { set_id: testSet.set_id } });
      await prisma.workout.delete({ where: { workout_id: testWorkout.workout_id } });
      recordTest("Cleanup test workout and set", true);
    } else {
      recordTest("Create test workout", false, "No routines to attach workout to");
    }

    return true;
  } catch (error) {
    recordTest("Workout operations", false, error.message);
    return false;
  }
}

/**
 * Test 5: API Endpoint Tests (if server is running)
 */
async function testAPIEndpoints() {
  logSection("TEST 5: API Endpoints (requires running server)");

  const endpoints = [
    { method: "POST", path: "/api/user/history", body: { user: TEST_USER_ID } },
    { method: "POST", path: "/api/routine/displayroutines", body: { user: TEST_USER_ID } },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(endpoint.body),
      });

      recordTest(`${endpoint.method} ${endpoint.path}`, response.ok, `Status: ${response.status}`);
    } catch (error) {
      recordTest(`${endpoint.method} ${endpoint.path}`, false, `Error: ${error.message}`);
    }
  }
}

/**
 * Test 6: Streaming Chat API
 */
async function testStreamingChat() {
  logSection("TEST 6: Streaming Chat API");

  const testPrompts = [
    { name: "Fitness question", prompt: "What are the benefits of compound exercises?" },
    {
      name: "Workout logging without routine",
      prompt: "Log 3 sets of 10 reps bench press at 135 lbs",
    },
    { name: "Check-in response", prompt: "I'm feeling great today, energy is high, no soreness" },
  ];

  for (const test of testPrompts) {
    try {
      const response = await fetch(`${BASE_URL}/api/handler-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: test.prompt, user: TEST_USER_ID }),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";
        let hasComplete = false;
        let hasError = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullResponse += chunk;

          if (chunk.includes('"type":"complete"')) hasComplete = true;
          if (chunk.includes('"type":"error"')) hasError = true;
        }

        recordTest(
          `${test.name} - Stream response`,
          !hasError && hasComplete,
          hasError ? "Error in stream" : ""
        );
      } else {
        recordTest(`${test.name} - Stream response`, false, `Status: ${response.status}`);
      }
    } catch (error) {
      recordTest(`${test.name} - Stream response`, false, error.message);
    }
  }
}

/**
 * Test 7: Edge Cases
 */
async function testEdgeCases() {
  logSection("TEST 7: Edge Cases");

  // Test with undefined/null routine name
  try {
    const response = await fetch(`${BASE_URL}/api/handler-stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Log 3 sets of bench press 10 reps 50 lbs",
        user: TEST_USER_ID,
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let hasError = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      if (chunk.includes('"type":"error"')) hasError = true;
    }

    recordTest("Workout log without routine name", !hasError, hasError ? "Error occurred" : "");
  } catch (error) {
    recordTest("Workout log without routine name", false, error.message);
  }

  // Test empty prompt
  try {
    const response = await fetch(`${BASE_URL}/api/handler-stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "", user: TEST_USER_ID }),
    });
    recordTest(
      "Empty prompt handling",
      response.ok || response.status === 400,
      `Status: ${response.status}`
    );
  } catch (error) {
    recordTest("Empty prompt handling", false, error.message);
  }
}

/**
 * Test 8: Data Integrity
 */
async function testDataIntegrity() {
  logSection("TEST 8: Data Integrity");

  try {
    // Check for orphaned sets (sets without workouts)
    const allSets = await prisma.set.findMany({
      include: { workout: true },
    });
    const orphanedSets = allSets.filter((s) => !s.workout);
    recordTest(`No orphaned sets (found ${orphanedSets.length})`, orphanedSets.length === 0);

    // Check for orphaned workouts (workouts without routines)
    const allWorkouts = await prisma.workout.findMany({
      include: { routine: true },
    });
    const orphanedWorkouts = allWorkouts.filter((w) => !w.routine);
    recordTest(
      `No orphaned workouts (found ${orphanedWorkouts.length})`,
      orphanedWorkouts.length === 0
    );

    // Verify user profile
    const user = await prisma.user.findUnique({
      where: { user_id: TEST_USER_ID },
    });
    recordTest("User has complete profile", user?.profile_complete === true);

    return true;
  } catch (error) {
    recordTest("Data integrity check", false, error.message);
    return false;
  }
}

/**
 * Print Summary
 */
function printSummary() {
  logSection("TEST SUMMARY");

  const total = results.passed + results.failed;
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;

  log(`Total Tests: ${total}`, "blue");
  log(`Passed: ${results.passed}`, "green");
  log(`Failed: ${results.failed}`, results.failed > 0 ? "red" : "green");
  log(`Pass Rate: ${passRate}%`, passRate >= 80 ? "green" : "yellow");

  if (results.failed > 0) {
    console.log("\nFailed Tests:");
    results.tests
      .filter((t) => !t.passed)
      .forEach((t) => log(`  - ${t.name}: ${t.details}`, "red"));
  }
}

/**
 * Main Test Runner
 */
async function runTests() {
  log("\n🏋️ Golden Harbor Workout Coach - Comprehensive Test Suite\n", "cyan");
  log(`Test User: ${TEST_USER_ID}`, "blue");
  log(`Base URL: ${BASE_URL}`, "blue");

  try {
    // Database tests (always run)
    await testDatabaseConnection();
    await testChatHistory();
    await testRoutineOperations();
    await testWorkoutOperations();
    await testDataIntegrity();

    // API tests (only if server appears to be running)
    try {
      const healthCheck = await fetch(`${BASE_URL}`, { method: "HEAD" });
      if (healthCheck.ok) {
        await testAPIEndpoints();
        await testStreamingChat();
        await testEdgeCases();
      } else {
        log("\n⚠️  Server not responding, skipping API tests", "yellow");
      }
    } catch {
      log("\n⚠️  Server not running, skipping API tests", "yellow");
      log(`   Start the server with: npm run dev`, "yellow");
    }

    printSummary();
  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, "red");
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
runTests();
