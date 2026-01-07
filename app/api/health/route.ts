import prisma from "@/prisma/prisma";
import { NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

interface HealthStatus {
  status: "pass" | "fail" | "warn";
  latencyMs?: number;
  message?: string;
}

interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: {
    database: HealthStatus;
    memory: HealthStatus;
  };
}

// Track server start time for uptime calculation
const startTime = Date.now();

// Memory thresholds (in MB)
const MEMORY_WARN_THRESHOLD = 400;
const MEMORY_FAIL_THRESHOLD = 800;

/**
 * Health check endpoint for monitoring application status
 * GET /api/health
 *
 * Returns:
 * - 200: All systems operational or degraded (some non-critical issues)
 * - 503: Critical systems unavailable
 */
export async function GET() {
  const checkStart = Date.now();
  const checks: HealthCheckResponse["checks"] = {
    database: { status: "pass" },
    memory: { status: "pass" },
  };

  // Check database connectivity
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: "pass",
      latencyMs: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = {
      status: "fail",
      message: error instanceof Error ? error.message : "Database connection failed",
    };
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);

  if (heapUsedMB > MEMORY_FAIL_THRESHOLD) {
    checks.memory = {
      status: "fail",
      message: `Heap usage critical: ${heapUsedMB}MB / ${heapTotalMB}MB`,
    };
  } else if (heapUsedMB > MEMORY_WARN_THRESHOLD) {
    checks.memory = {
      status: "warn",
      message: `Heap usage elevated: ${heapUsedMB}MB / ${heapTotalMB}MB`,
    };
  } else {
    checks.memory = {
      status: "pass",
      message: `Heap usage normal: ${heapUsedMB}MB / ${heapTotalMB}MB`,
    };
  }

  // Determine overall status
  const hasFailure = Object.values(checks).some((c) => c.status === "fail");
  const hasWarning = Object.values(checks).some((c) => c.status === "warn");

  let overallStatus: HealthCheckResponse["status"];
  if (hasFailure) {
    overallStatus = "unhealthy";
  } else if (hasWarning) {
    overallStatus = "degraded";
  } else {
    overallStatus = "healthy";
  }

  const response: HealthCheckResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.round((Date.now() - startTime) / 1000),
    checks,
  };

  // Add total check duration to response headers
  const checkDuration = Date.now() - checkStart;

  return NextResponse.json(response, {
    status: overallStatus === "unhealthy" ? 503 : 200,
    headers: {
      "X-Health-Check-Duration-Ms": checkDuration.toString(),
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
