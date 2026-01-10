"use client";

import { forwardRef } from "react";
import { MessageBubble } from "./MessageBubble";

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  loadingHistory: boolean;
  lastMessageId: number | null;
}

/**
 * Chat messages container with virtual scrolling support
 * Displays message history and loading states
 */
export const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(function ChatMessages(
  { messages, loadingHistory, lastMessageId },
  ref
) {
  if (loadingHistory) {
    return (
      <div ref={ref} className="flex-grow overflow-y-auto h-0 mb-2 custom-scrollbar transition-all">
        <div className="flex justify-center items-center h-32">
          <div className="flex items-center space-x-2 text-blue-400">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <span className="ml-2 text-sm font-medium">Loading chat history...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="flex-grow overflow-y-auto h-0 mb-2 custom-scrollbar transition-all">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} isLatest={lastMessageId === message.id} />
      ))}
    </div>
  );
});
