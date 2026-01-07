"use client";

/**
 * Metrics Error Boundary
 *
 * Specialized error boundary for the metrics/dashboard page.
 */

import { useEffect } from "react";
import { logger } from "@/lib/utils/logger";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MetricsError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    logger.error(
      "Metrics error boundary triggered",
      {
        source: "app/metrics/error.tsx",
        digest: error.digest,
      },
      error
    );
  }, [error]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-slate-800/80 rounded-xl p-8 max-w-md w-full border border-purple-900/30 backdrop-blur-sm text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-purple-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Dashboard Error</h2>
          <p className="text-gray-400 text-sm">
            There was a problem loading your dashboard. Your data is safe.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 text-left">
            <p className="text-purple-400 text-xs font-mono break-all">{error.message}</p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            Reload Dashboard
          </button>
          <a
            href="/chat"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
          >
            Go to Chat
          </a>
        </div>
      </div>
    </div>
  );
}
