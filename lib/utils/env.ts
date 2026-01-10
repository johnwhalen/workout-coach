/**
 * Environment variable validation
 *
 * Uses Zod to validate required environment variables at build/runtime.
 * Import this at the top of your application to fail fast on missing config.
 */

import { z } from "zod";

/**
 * Schema for server-side environment variables
 */
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  DIRECT_URL: z.string().url("DIRECT_URL must be a valid URL").optional(),

  // Authentication (Clerk)
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),

  // AI (Anthropic)
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY is required"),

  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

/**
 * Schema for client-side environment variables (NEXT_PUBLIC_*)
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/login"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/signup"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default("/"),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default("/"),
});

/**
 * Combined environment schema
 */
const envSchema = serverEnvSchema.merge(clientEnvSchema);

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Call this during app initialization to fail fast on missing config
 *
 * @throws {Error} If required environment variables are missing or invalid
 */
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.format();
    const errorMessages = Object.entries(errors)
      .filter(([key]) => key !== "_errors")
      .map(([key, value]) => {
        const messages = (value as { _errors?: string[] })?._errors || [];
        return `  ${key}: ${messages.join(", ")}`;
      })
      .join("\n");

    throw new Error(`❌ Environment validation failed:\n${errorMessages}`);
  }

  return result.data;
}

/**
 * Get a validated environment variable
 * Use this for type-safe access to env vars
 */
export function getEnv(): Env {
  // In development, validate on every access for better DX
  if (process.env.NODE_ENV === "development") {
    return validateEnv();
  }

  // In production, assume already validated at startup
  return process.env as unknown as Env;
}

// Export individual env getters for convenience
export const env = {
  get databaseUrl() {
    return process.env.DATABASE_URL!;
  },
  get clerkSecretKey() {
    return process.env.CLERK_SECRET_KEY!;
  },
  get anthropicApiKey() {
    return process.env.ANTHROPIC_API_KEY!;
  },
  get nodeEnv() {
    return (process.env.NODE_ENV || "development") as "development" | "production" | "test";
  },
  get isDev() {
    return this.nodeEnv === "development";
  },
  get isProd() {
    return this.nodeEnv === "production";
  },
};
