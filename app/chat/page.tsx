"use client";
import FitnessProfileModal from "@/components/modals/FitnessProfileModal";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@mantine/core";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
}

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState("");
  const [showFitnessModal, setShowFitnessModal] = useState(false);

  // Welcome message - concise (Swiss minimalism)
  const welcomeMessage: ChatMessage = {
    id: -1,
    text: `# Welcome to Golden Harbor

I'm your AI training coach. Log workouts naturally, get progressive overload recommendations, and track your strength gains.

**Try:** "I did 3 sets of bench at 25 lbs" or "What should I lift today?"`,
    isUser: false,
  };

  const adduser = async () => {
    try {
      const response = await fetch("/api/users", { method: "POST" });
      const data = await response.json();
      console.log(data);
      setUser(data.data.user_id);

      // Check if fitness profile is complete
      if (!data.data.profile_complete) {
        setShowFitnessModal(true);
      }
    } catch {
      toast.error("Failed to create user");
    }
  };

  const fetchUserHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const response = await fetch("/api/users/history");
      const responseData = await response.json();
      console.log(responseData);
      const history = responseData.chatHistory;

      // If no history, just show the welcome message
      if (!history || history.length === 0) {
        setMessages([welcomeMessage]);
        return;
      }

      // Parse structured messages with improved logic
      // Note: We keep all history in database for AI context, but only show today's in UI
      const formattedHistory: ChatMessage[] = [];
      const seenMessages = new Set<string>();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < history.length; i++) {
        const msg = history[i];

        try {
          // Try to parse as JSON (new structured format)
          const parsedMsg = JSON.parse(msg);

          // Skip empty messages or system messages
          if (!parsedMsg.text || parsedMsg.text.trim().length === 0) {
            continue;
          }

          // Check if message has a timestamp and filter to today only
          // Note: Old messages without timestamps will be included for backwards compatibility
          if (parsedMsg.timestamp) {
            const msgDate = new Date(parsedMsg.timestamp);
            msgDate.setHours(0, 0, 0, 0);
            if (msgDate.getTime() < today.getTime()) {
              continue; // Skip messages from previous days
            }
          }

          // Create normalized message for duplicate detection
          const normalizedText = parsedMsg.text.replace(/\s+/g, " ").trim().toLowerCase();

          // Skip duplicates
          if (seenMessages.has(normalizedText)) {
            continue;
          }

          seenMessages.add(normalizedText);

          formattedHistory.push({
            id: formattedHistory.length,
            text: parsedMsg.text,
            isUser: parsedMsg.isUser,
          });
        } catch {
          // Fallback to legacy format - skip these as they don't have timestamps
          // Legacy messages won't be shown, but are still in database for AI context
          continue;
        }
      }

      // Always show welcome message first, then today's history
      setMessages([welcomeMessage, ...formattedHistory]);

      if (formattedHistory.length > 0) {
        console.log(`Showing ${formattedHistory.length} messages from today.`);
      }
    } catch (error) {
      console.error("Error fetching user history:", error);
      toast.error("Failed to fetch chat history");
      // Still show welcome message even on error
      setMessages([welcomeMessage]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    adduser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Always show welcome message when messages array is empty (initial load)
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { id: messages.length, text: inputText, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentInput = inputText;
    setInputText("");

    setLoading(true);

    // Create placeholder AI message for streaming
    const aiMessageId = messages.length + 1;
    const initialAiMessage = {
      id: aiMessageId,
      text: "",
      isUser: false,
    };
    setMessages((prevMessages) => [...prevMessages, initialAiMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: currentInput, user: user }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseText = "";
      let caloriesInfo = null;
      let buffer = ""; // Buffer for incomplete SSE messages

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Append new chunk to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages (separated by double newlines)
        const messages = buffer.split("\n\n");
        // Keep the last incomplete message in the buffer
        buffer = messages.pop() || "";

        for (const message of messages) {
          const lines = message.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                console.log("Streaming data:", data); // Debug log

                if (data.type === "start") {
                  // Keep text empty to show loading dots
                  // The "Analyzing your request..." is just for logging
                  console.log("Stream started:", data.message);
                } else if (data.type === "chunk") {
                  // Update AI message with streaming content
                  if (data.content) {
                    aiResponseText += data.content;
                  } else if (data.fullResponse) {
                    aiResponseText = data.fullResponse;
                  } else if (data.message) {
                    aiResponseText = data.message;
                  }

                  setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                      msg.id === aiMessageId ? { ...msg, text: aiResponseText } : msg
                    )
                  );
                } else if (data.type === "complete") {
                  // Final message update
                  aiResponseText = data.message;
                  caloriesInfo = data.caloriesInfo;

                  // Add calorie information if available
                  let finalMessage = aiResponseText;
                  if (caloriesInfo && caloriesInfo.totalCalories > 0) {
                    finalMessage += `\n\nCalories burned: ${caloriesInfo.totalCalories} kcal`;
                    if (caloriesInfo.setsWithCalories > 0) {
                      finalMessage += `\n${caloriesInfo.setsWithCalories} sets tracked with individual calorie data`;
                    }
                  }

                  setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                      msg.id === aiMessageId ? { ...msg, text: finalMessage } : msg
                    )
                  );
                } else if (data.type === "error") {
                  setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                      msg.id === aiMessageId ? { ...msg, text: "Error: " + data.message } : msg
                    )
                  );
                }
              } catch (parseError) {
                console.error("Error parsing streaming data:", parseError, "Line:", line);
              }
            }
          }
        }
      }

      // Process any remaining data in the buffer after stream ends
      if (buffer.trim()) {
        const lines = buffer.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log("Final buffer data:", data);

              if (data.type === "complete") {
                aiResponseText = data.message;
                caloriesInfo = data.caloriesInfo;

                let finalMessage = aiResponseText;
                if (caloriesInfo && caloriesInfo.totalCalories > 0) {
                  finalMessage += `\n\nCalories burned: ${caloriesInfo.totalCalories} kcal`;
                  if (caloriesInfo.setsWithCalories > 0) {
                    finalMessage += `\n${caloriesInfo.setsWithCalories} sets tracked with individual calorie data`;
                  }
                }

                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === aiMessageId ? { ...msg, text: finalMessage } : msg
                  )
                );
              } else if (data.type === "error") {
                setMessages((prevMessages) =>
                  prevMessages.map((msg) =>
                    msg.id === aiMessageId ? { ...msg, text: "Error: " + data.message } : msg
                  )
                );
              }
            } catch (parseError) {
              console.error("Error parsing final buffer:", parseError);
            }
          }
        }
      }

      // Update chat history after completion
      if (aiResponseText) {
        try {
          const historyResponse = await fetch("/api/users/history");
          const historyData = await historyResponse.json();
          const userHistory = historyData.chatHistory || [];

          // Check if this conversation is already in history to prevent duplicates
          const userMessageText = currentInput.trim();
          const aiMessageText = aiResponseText.trim();

          // Look for recent duplicates (last 50 messages)
          const recentHistory = userHistory.slice(-50);
          let isDuplicate = false;

          for (const historyMsg of recentHistory) {
            try {
              const parsed = JSON.parse(historyMsg);
              if (parsed.text === userMessageText || parsed.text === aiMessageText) {
                isDuplicate = true;
                break;
              }
            } catch {
              // If parsing fails, check as plain text
              if (historyMsg === userMessageText || historyMsg === aiMessageText) {
                isDuplicate = true;
                break;
              }
            }
          }

          if (!isDuplicate) {
            // Add user message and AI response to history with structured format and timestamp
            const timestamp = new Date().toISOString();
            const userMessageObj = JSON.stringify({ text: currentInput, isUser: true, timestamp });
            userHistory.push(userMessageObj);

            let historyMessage = aiResponseText;
            if (caloriesInfo && caloriesInfo.totalCalories > 0) {
              historyMessage += `\n\nCalories burned: ${caloriesInfo.totalCalories} kcal`;
              if (caloriesInfo.setsWithCalories > 0) {
                historyMessage += `\n${caloriesInfo.setsWithCalories} sets tracked with individual calorie data`;
              }
            }
            const aiMessageObj = JSON.stringify({ text: historyMessage, isUser: false, timestamp });
            userHistory.push(aiMessageObj);

            await fetch("/api/users/history", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ messages: userHistory }),
            });
          }
        } catch (historyError) {
          console.error("Error updating history:", historyError);
        }
      }
    } catch (error) {
      console.error("Error with streaming response:", error);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === aiMessageId ? { ...msg, text: "Error: Failed to get response" } : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const [lastMsgId, setLastMsgId] = useState<number | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMsgId(messages[messages.length - 1].id);
    }
  }, [messages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-navy-900 p-4">
      <FitnessProfileModal
        isOpen={showFitnessModal}
        onClose={() => setShowFitnessModal(false)}
        onComplete={() => {
          setShowFitnessModal(false);
          toast.success("Welcome to Golden Harbor!");
        }}
      />

      <div className="w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex-grow flex flex-col glassmorphism rounded-xl p-6 border border-slate-700/30 relative">
          <div className="flex items-center mb-6">
            <h1 className="text-2xl font-bold text-gold">Golden Harbor</h1>
            <div className="ml-auto flex items-center gap-3">
              <Link
                className="px-4 py-2 bg-gold hover:bg-gold/90 text-navy-900 rounded-lg transition font-medium"
                href="/metrics"
              >
                Dashboard
              </Link>
              <UserButton />
            </div>
          </div>
          <div
            ref={chatContainerRef}
            className="flex-grow overflow-y-auto h-0 mb-2 custom-scrollbar transition-all"
          >
            {loadingHistory ? (
              <div className="flex justify-center items-center h-32">
                <div className="flex items-center space-x-2 text-blue-400">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <span className="ml-2 text-sm font-medium">Loading chat history...</span>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"} mb-3`}
                >
                  <div
                    className={`chat-bubble transition-all duration-200 ${
                      message.isUser
                        ? "bg-gold text-navy-900 rounded-xl"
                        : "bg-navy-700/80 text-white rounded-xl border border-slate-700/30"
                    } max-w-xl p-4 ${lastMsgId === message.id ? "animate-fadein" : ""}`}
                  >
                    {message.text ? (
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold mb-2">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-semibold mb-2">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-semibold mb-1">{children}</h3>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-2 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => <li className="text-sm">{children}</li>,
                            code: ({ children, className }) => {
                              const isInline = !className;
                              return isInline ? (
                                <code className="bg-slate-700 px-1 py-0.5 rounded text-xs font-mono">
                                  {children}
                                </code>
                              ) : (
                                <pre className="bg-slate-900 p-2 rounded text-xs overflow-x-auto">
                                  <code>{children}</code>
                                </pre>
                              );
                            },
                            strong: ({ children }) => (
                              <strong className="font-semibold">{children}</strong>
                            ),
                            em: ({ children }) => <em className="italic">{children}</em>,
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-blue-400 pl-2 italic text-sm">
                                {children}
                              </blockquote>
                            ),
                            a: ({ children, href }) => (
                              <a
                                href={href}
                                className="text-blue-300 hover:text-blue-200 underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {/* ChatGPT-like input box fixed at the bottom of chat container */}
          <form
            className="w-full flex items-end gap-3 mt-auto pt-2 pb-1 px-0 sticky bottom-0 z-10 bg-transparent"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
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
        </div>
      </div>
      {/* Styles moved to app/globals.css for consolidation */}
    </div>
  );
}
