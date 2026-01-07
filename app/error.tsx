"use client";

/**
 * Global Error Boundary
 *
 * Next.js 14 error boundary for the root layout.
 * Catches errors in client components and provides recovery options.
 */

import { useEffect } from "react";
import { logger } from "@/lib/utils/logger";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to structured logger
    logger.error(
      "Global error boundary triggered",
      {
        source: "app/error.tsx",
        digest: error.digest,
      },
      error
    );
  }, [error]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-slate-800/80 rounded-xl p-8 max-w-md w-full border border-red-900/30 backdrop-blur-sm text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 text-sm">
            An unexpected error occurred. Our team has been notified.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 text-left">
            <p className="text-red-400 text-xs font-mono break-all">{error.message}</p>
            {error.digest && <p className="text-gray-500 text-xs mt-2">Error ID: {error.digest}</p>}
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
