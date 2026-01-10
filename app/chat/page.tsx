"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import FitnessProfileModal from "@/components/modals/FitnessProfileModal";
import { ChatHeader, ChatInput, ChatMessages } from "@/components/chat";

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
}

// Welcome message - concise (Swiss minimalism)
const welcomeMessage: ChatMessage = {
  id: -1,
  text: `# Welcome to Golden Harbor

I'm your AI training coach. Log workouts naturally, get progressive overload recommendations, and track your strength gains.

**Try:** "I did 3 sets of bench at 25 lbs" or "What should I lift today?"`,
  isUser: false,
};

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState("");
  const [showFitnessModal, setShowFitnessModal] = useState(false);
  const [lastMsgId, setLastMsgId] = useState<number | null>(null);

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
        const sseMessages = buffer.split("\n\n");
        // Keep the last incomplete message in the buffer
        buffer = sseMessages.pop() || "";

        for (const message of sseMessages) {
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

  // Initialize user on mount
  useEffect(() => {
    adduser();
  }, []);

  // Fetch history when user is set
  useEffect(() => {
    if (user) {
      fetchUserHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Set welcome message on initial load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([welcomeMessage]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track last message ID for animation
  useEffect(() => {
    if (messages.length > 0) {
      setLastMsgId(messages[messages.length - 1].id);
    }
  }, [messages]);

  // Auto-scroll to bottom on new messages
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
          <ChatHeader />
          <ChatMessages
            ref={chatContainerRef}
            messages={messages}
            loadingHistory={loadingHistory}
            lastMessageId={lastMsgId}
          />
          <ChatInput
            inputText={inputText}
            setInputText={setInputText}
            onSendMessage={sendMessage}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
