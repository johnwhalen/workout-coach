/**
 * Workout intensity calculation functions
 */

import type { CheckInData } from "@/types/ai";

/**
 * Calculate workout intensity adjustment based on check-in data
 *
 * Returns a multiplier (0.7 - 1.1) to adjust workout intensity:
 * - Below 1.0: Reduce intensity due to fatigue, poor sleep, or soreness
 * - Above 1.0: Increase intensity when feeling great
 */
export function calculateIntensityAdjustment(checkIn: CheckInData): number {
  const { energyLevel, sleepQuality, sorenessLevel } = checkIn;

  let adjustment = 1.0;

  // Energy level adjustments
  if (energyLevel <= 2) adjustment -= 0.15;
  else if (energyLevel >= 4) adjustment += 0.05;

  // Sleep quality adjustments
  if (sleepQuality <= 2) adjustment -= 0.1;
  else if (sleepQuality >= 4) adjustment += 0.02;

  // Soreness adjustments
  if (sorenessLevel >= 4) adjustment -= 0.1;
  else if (sorenessLevel <= 2) adjustment += 0.02;

  return Math.max(0.7, Math.min(1.1, adjustment));
}
