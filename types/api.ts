/**
 * API request/response type definitions
 */

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ChatRequest {
  prompt: string;
}

export interface ChatStreamEvent {
  type: "start" | "chunk" | "complete" | "error";
  message?: string;
  content?: string;
  isComplete?: boolean;
  caloriesInfo?: CaloriesInfo;
}

export interface CaloriesInfo {
  totalCalories: number;
  setsWithCalories: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}
