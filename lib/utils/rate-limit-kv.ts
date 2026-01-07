/**
 * Distributed rate limiter using Vercel KV (Redis)
 *
 * Provides consistent rate limiting across serverless function instances.
 * Falls back to in-memory rate limiting if KV is not configured.
 */

import { kv } from "@vercel/kv";
import { checkRateLimit as checkInMemoryRateLimit, getRateLimitHeaders } from "./rate-limit";

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute per user

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

/**
 * Check if KV is available (configured)
 */
function isKVConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/**
 * Check rate limit using Vercel KV (distributed)
 *
 * Uses a sliding window algorithm with sorted sets.
 * Falls back to in-memory if KV is not configured.
 */
export async function checkRateLimitKV(identifier: string): Promise<RateLimitResult> {
  // Fall back to in-memory if KV is not configured
  if (!isKVConfigured()) {
    return checkInMemoryRateLimit(identifier);
  }

  try {
    const key = `rate-limit:${identifier}`;
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;

    // Use pipeline for atomic operations
    const pipeline = kv.pipeline();

    // Remove entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart);

    // Add current request
    pipeline.zadd(key, { score: now, member: `${now}:${Math.random()}` });

    // Count requests in window
    pipeline.zcard(key);

    // Set expiry (cleanup)
    pipeline.expire(key, Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) + 10);

    const results = await pipeline.exec();
    const count = (results[2] as number) || 0;

    const allowed = count <= MAX_REQUESTS_PER_WINDOW;
    const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - count);

    return {
      allowed,
      remaining,
      resetIn: RATE_LIMIT_WINDOW_MS,
    };
  } catch (error) {
    // If KV fails, fall back to in-memory (degraded but functional)
    console.error("KV rate limit error, falling back to in-memory:", error);
    return checkInMemoryRateLimit(identifier);
  }
}

/**
 * Get standard rate limit headers
 */
export { getRateLimitHeaders };

/**
 * Middleware helper to apply rate limiting to a request
 */
export async function withRateLimit(
  identifier: string,
  onLimited: () => Response
): Promise<{ allowed: boolean; headers: Record<string, string>; response?: Response }> {
  const result = await checkRateLimitKV(identifier);
  const headers = getRateLimitHeaders(result.remaining, result.resetIn);

  if (!result.allowed) {
    return {
      allowed: false,
      headers,
      response: onLimited(),
    };
  }

  return {
    allowed: true,
    headers,
  };
}
