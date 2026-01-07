"use client";

/**
 * Chat Error Boundary
 *
 * Specialized error boundary for the chat page.
 * Provides chat-specific recovery options.
 */

import { useEffect } from "react";
import { logger } from "@/lib/utils/logger";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ChatError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    logger.error(
      "Chat error boundary triggered",
      {
        source: "app/chat/error.tsx",
        digest: error.digest,
      },
      error
    );
  }, [error]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-slate-800/80 rounded-xl p-8 max-w-md w-full border border-orange-900/30 backdrop-blur-sm text-center">
        <div className="mb-6">
          <svg
            className="w-16 h-16 text-orange-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Chat Error</h2>
          <p className="text-gray-400 text-sm">
            There was a problem with the chat. Your conversation history is safe.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 text-left">
            <p className="text-orange-400 text-xs font-mono break-all">{error.message}</p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            Retry Chat
          </button>
          <a
            href="/metrics"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-medium"
          >
            View Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
