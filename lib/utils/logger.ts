/**
 * Structured logging utility for consistent, parseable logs across the application.
 * Outputs JSON in production for log aggregation tools, pretty-prints in development.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  /** Request ID for tracing */
  requestId?: string;
  /** User ID if authenticated */
  userId?: string;
  /** API route or component name */
  source?: string;
  /** Duration in milliseconds */
  durationMs?: number;
  /** HTTP status code */
  statusCode?: number;
  /** Additional metadata */
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const isDev = process.env.NODE_ENV === "development";

function formatEntry(entry: LogEntry): string {
  if (isDev) {
    // Pretty print for development
    const levelColors: Record<LogLevel, string> = {
      debug: "\x1b[36m", // cyan
      info: "\x1b[32m", // green
      warn: "\x1b[33m", // yellow
      error: "\x1b[31m", // red
    };
    const reset = "\x1b[0m";
    const color = levelColors[entry.level];

    let output = `${color}[${entry.level.toUpperCase()}]${reset} ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      const contextStr = Object.entries(entry.context)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(" ");
      output += ` | ${contextStr}`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack) {
        output += `\n${entry.error.stack}`;
      }
    }

    return output;
  }

  // JSON for production (log aggregation)
  return JSON.stringify(entry);
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context && Object.keys(context).length > 0) {
    entry.context = context;
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: isDev ? error.stack : undefined,
    };
  }

  return entry;
}

function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  const entry = createLogEntry(level, message, context, error);
  const formatted = formatEntry(entry);

  switch (level) {
    case "debug":
      if (isDev) console.debug(formatted);
      break;
    case "info":
      console.info(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "error":
      console.error(formatted);
      break;
  }
}

/**
 * Logger instance with methods for each log level.
 *
 * @example
 * ```ts
 * import { logger } from "@/lib/utils/logger";
 *
 * // Basic logging
 * logger.info("User logged in", { userId: "123" });
 *
 * // With error
 * logger.error("Failed to fetch data", { source: "api/chat" }, error);
 *
 * // API route logging
 * const requestId = crypto.randomUUID();
 * logger.info("Request started", { requestId, source: "api/chat" });
 * // ... process request
 * logger.info("Request completed", { requestId, durationMs: 150, statusCode: 200 });
 * ```
 */
export const logger = {
  debug: (message: string, context?: LogContext) => log("debug", message, context),
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext, error?: Error) =>
    log("warn", message, context, error),
  error: (message: string, context?: LogContext, error?: Error) =>
    log("error", message, context, error),
};

/**
 * Creates a child logger with preset context fields.
 * Useful for adding requestId or source to all logs in a request handler.
 *
 * @example
 * ```ts
 * const log = createLogger({ source: "api/chat", requestId: "abc-123" });
 * log.info("Processing request"); // Automatically includes source and requestId
 * ```
 */
export function createLogger(baseContext: LogContext) {
  return {
    debug: (message: string, context?: LogContext) =>
      log("debug", message, { ...baseContext, ...context }),
    info: (message: string, context?: LogContext) =>
      log("info", message, { ...baseContext, ...context }),
    warn: (message: string, context?: LogContext, error?: Error) =>
      log("warn", message, { ...baseContext, ...context }, error),
    error: (message: string, context?: LogContext, error?: Error) =>
      log("error", message, { ...baseContext, ...context }, error),
  };
}

/**
 * Generates a unique request ID for tracing requests through the system.
 */
export function generateRequestId(): string {
  return crypto.randomUUID().slice(0, 8);
}
