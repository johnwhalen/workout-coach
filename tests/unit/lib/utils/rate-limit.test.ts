import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit";

describe("Rate Limiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("checkRateLimit", () => {
    it("allows first request from a user", () => {
      const result = checkRateLimit("test-user-1");
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(19); // 20 - 1
    });

    it("tracks requests per user independently", () => {
      const result1 = checkRateLimit("user-a");
      const result2 = checkRateLimit("user-b");

      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(19);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(19);
    });

    it("decrements remaining count with each request", () => {
      const userId = "decrement-test-user";

      const first = checkRateLimit(userId);
      expect(first.remaining).toBe(19);

      const second = checkRateLimit(userId);
      expect(second.remaining).toBe(18);

      const third = checkRateLimit(userId);
      expect(third.remaining).toBe(17);
    });

    it("blocks requests after limit is exceeded", () => {
      const userId = "blocked-user";

      // Make 20 requests (the limit)
      for (let i = 0; i < 20; i++) {
        const result = checkRateLimit(userId);
        expect(result.allowed).toBe(true);
      }

      // 21st request should be blocked
      const blocked = checkRateLimit(userId);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);
    });

    it("resets after the time window expires", () => {
      const userId = "reset-user";

      // Use all requests
      for (let i = 0; i < 20; i++) {
        checkRateLimit(userId);
      }

      // Verify blocked
      expect(checkRateLimit(userId).allowed).toBe(false);

      // Advance time past the window (60 seconds)
      vi.advanceTimersByTime(61 * 1000);

      // Should be allowed again
      const afterReset = checkRateLimit(userId);
      expect(afterReset.allowed).toBe(true);
      expect(afterReset.remaining).toBe(19);
    });

    it("provides accurate resetIn time", () => {
      const userId = "reset-time-user";
      const result = checkRateLimit(userId);

      // Should be approximately 60 seconds (60000ms)
      expect(result.resetIn).toBe(60000);
    });

    it("provides decreasing resetIn time", () => {
      const userId = "decreasing-reset-user";
      checkRateLimit(userId);

      // Advance 30 seconds
      vi.advanceTimersByTime(30 * 1000);

      const result = checkRateLimit(userId);
      // Should be approximately 30 seconds remaining
      expect(result.resetIn).toBeCloseTo(30000, -2);
    });
  });

  describe("getRateLimitHeaders", () => {
    it("returns correct header format", () => {
      const headers = getRateLimitHeaders(15, 45000);

      expect(headers["X-RateLimit-Limit"]).toBe("20");
      expect(headers["X-RateLimit-Remaining"]).toBe("15");
      expect(headers["X-RateLimit-Reset"]).toBe("45"); // Converted to seconds
    });

    it("handles zero remaining", () => {
      const headers = getRateLimitHeaders(0, 30000);

      expect(headers["X-RateLimit-Remaining"]).toBe("0");
    });

    it("rounds up reset time to seconds", () => {
      const headers = getRateLimitHeaders(10, 1500);

      expect(headers["X-RateLimit-Reset"]).toBe("2"); // 1.5 seconds rounds up to 2
    });
  });
});
