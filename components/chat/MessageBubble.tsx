"use client";

import { MarkdownRenderer } from "./MarkdownRenderer";

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
}

interface MessageBubbleProps {
  message: ChatMessage;
  isLatest: boolean;
}

/**
 * Individual chat message bubble
 * Handles both user and AI messages with appropriate styling
 */
export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isUser = message.isUser;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`chat-bubble transition-all duration-200 ${
          isUser
            ? "bg-gold text-navy-900 rounded-xl"
            : "bg-navy-700/80 text-white rounded-xl border border-slate-700/30"
        } max-w-xl p-4 ${isLatest ? "animate-fadein" : ""}`}
      >
        {message.text ? (
          <MarkdownRenderer content={message.text} />
        ) : (
          <div className="flex items-center space-x-1">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
      </div>
    </div>
  );
}
