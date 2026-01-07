import { describe, it, expect } from "vitest";
import { calculateIntensityAdjustment } from "@/lib/ai/intensity";
import type { CheckInData } from "@/types/ai";

describe("calculateIntensityAdjustment", () => {
  it("returns 1.0 for moderate check-in values", () => {
    const checkIn: CheckInData = {
      energyLevel: 3,
      sleepQuality: 3,
      sorenessLevel: 3,
    };
    const result = calculateIntensityAdjustment(checkIn);
    expect(result).toBe(1.0);
  });

  it("reduces intensity for low energy levels", () => {
    const checkIn: CheckInData = {
      energyLevel: 1,
      sleepQuality: 3,
      sorenessLevel: 3,
    };
    const result = calculateIntensityAdjustment(checkIn);
    expect(result).toBeLessThan(1.0);
    expect(result).toBe(0.85); // -0.15 for low energy
  });

  it("reduces intensity for poor sleep quality", () => {
    const checkIn: CheckInData = {
      energyLevel: 3,
      sleepQuality: 1,
      sorenessLevel: 3,
    };
    const result = calculateIntensityAdjustment(checkIn);
    expect(result).toBeLessThan(1.0);
    expect(result).toBe(0.9); // -0.1 for poor sleep
  });

  it("reduces intensity for high soreness", () => {
    const checkIn: CheckInData = {
      energyLevel: 3,
      sleepQuality: 3,
      sorenessLevel: 5,
    };
    const result = calculateIntensityAdjustment(checkIn);
    expect(result).toBeLessThan(1.0);
    expect(result).toBe(0.9); // -0.1 for high soreness
  });

  it("increases intensity when feeling great", () => {
    const checkIn: CheckInData = {
      energyLevel: 5,
      sleepQuality: 5,
      sorenessLevel: 1,
    };
    const result = calculateIntensityAdjustment(checkIn);
    expect(result).toBeGreaterThan(1.0);
    // +0.05 (energy) + 0.02 (sleep) + 0.02 (soreness) = 1.09
    expect(result).toBeCloseTo(1.09);
  });

  it("compounds multiple negative factors", () => {
    const checkIn: CheckInData = {
      energyLevel: 1,
      sleepQuality: 1,
      sorenessLevel: 5,
    };
    const result = calculateIntensityAdjustment(checkIn);
    // -0.15 (energy) - 0.1 (sleep) - 0.1 (soreness) = 0.65, but clamped to 0.7
    expect(result).toBe(0.7);
  });

  it("clamps maximum intensity to 1.1", () => {
    const checkIn: CheckInData = {
      energyLevel: 5,
      sleepQuality: 5,
      sorenessLevel: 1,
    };
    const result = calculateIntensityAdjustment(checkIn);
    expect(result).toBeLessThanOrEqual(1.1);
  });

  it("clamps minimum intensity to 0.7", () => {
    const checkIn: CheckInData = {
      energyLevel: 1,
      sleepQuality: 1,
      sorenessLevel: 5,
    };
    const result = calculateIntensityAdjustment(checkIn);
    expect(result).toBeGreaterThanOrEqual(0.7);
  });

  it("handles boundary energy level 2", () => {
    const checkIn: CheckInData = {
      energyLevel: 2,
      sleepQuality: 3,
      sorenessLevel: 3,
    };
    const result = calculateIntensityAdjustment(checkIn);
    expect(result).toBe(0.85); // -0.15 for energy <= 2
  });

  it("handles boundary energy level 4", () => {
    const checkIn: CheckInData = {
      energyLevel: 4,
      sleepQuality: 3,
      sorenessLevel: 3,
    };
    const result = calculateIntensityAdjustment(checkIn);
    expect(result).toBe(1.05); // +0.05 for energy >= 4
  });
});
