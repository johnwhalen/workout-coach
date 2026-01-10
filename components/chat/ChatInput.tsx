"use client";

import { Button } from "@mantine/core";

interface ChatInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: () => void;
  loading: boolean;
}

/**
 * Chat input field with send button
 * Supports Enter to send (Shift+Enter for newline)
 */
export function ChatInput({ inputText, setInputText, onSendMessage, loading }: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <form
      className="w-full flex items-end gap-3 mt-auto pt-2 pb-1 px-0 sticky bottom-0 z-10 bg-transparent"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-row items-center w-full bg-navy-700/80 border border-slate-700/30 rounded-xl px-4 py-2 focus-within:ring-2 focus-within:ring-gold/50 transition-all duration-200 min-h-[48px]">
        <div className="flex-grow flex items-center">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            rows={1}
            className="w-full bg-transparent text-white border-none outline-none resize-none shadow-none font-normal text-base placeholder:text-slate-400 focus:outline-none focus:ring-0 leading-[1.5rem] h-7 flex items-center"
            style={{
              minHeight: "28px",
              maxHeight: "120px",
              overflowY: "auto",
              fontFamily: "inherit",
              background: "transparent",
              padding: 0,
              margin: 0,
              display: "flex",
              alignItems: "center",
            }}
            autoFocus
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button
          color="yellow"
          radius="xl"
          type="submit"
          loading={loading}
          className="ml-2 w-10 h-10 min-w-0 min-h-0 p-0 flex items-center justify-center rounded-lg bg-gold hover:bg-gold/90 text-navy-900 transition-all duration-150 active:scale-95 send-btn"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </form>
  );
}
