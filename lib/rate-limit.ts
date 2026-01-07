/**
 * Simple in-memory rate limiter for AI endpoints
 *
 * Limits requests per user to prevent abuse and control AI API costs.
 * For production scale, consider using Redis-based rate limiting.
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute per user

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually user ID)
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(identifier: string): {
    allowed: boolean;
    remaining: number;
    resetIn: number;
} {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // Clean up expired entries periodically
    if (rateLimitStore.size > 10000) {
        cleanupExpiredEntries(now);
    }

    if (!entry || now > entry.resetTime) {
        // First request or window expired - create new entry
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW_MS,
        });
        return {
            allowed: true,
            remaining: MAX_REQUESTS_PER_WINDOW - 1,
            resetIn: RATE_LIMIT_WINDOW_MS,
        };
    }

    if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
        // Rate limit exceeded
        return {
            allowed: false,
            remaining: 0,
            resetIn: entry.resetTime - now,
        };
    }

    // Increment counter
    entry.count++;
    return {
        allowed: true,
        remaining: MAX_REQUESTS_PER_WINDOW - entry.count,
        resetIn: entry.resetTime - now,
    };
}

/**
 * Clean up expired entries to prevent memory leaks
 */
function cleanupExpiredEntries(now: number): void {
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Create rate limit response headers
 */
export function getRateLimitHeaders(remaining: number, resetIn: number): Record<string, string> {
    return {
        "X-RateLimit-Limit": String(MAX_REQUESTS_PER_WINDOW),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(Math.ceil(resetIn / 1000)),
    };
}
