/**
 * Chat history management functions
 */

import prisma from "@/prisma/prisma";

/**
 * Get user's conversation history from database
 */
export async function getUserHistory(userId: string): Promise<string[]> {
  try {
    const user = await prisma.userChatHistory.findUnique({
      where: { userId },
    });
    return user?.messages || [];
  } catch (error) {
    console.error("Error fetching user history:", error);
    return [];
  }
}

/**
 * Update user's conversation history in database
 */
export async function updateUserHistory(userId: string, messages: string[]): Promise<void> {
  try {
    await prisma.userChatHistory.upsert({
      where: { userId },
      update: { messages },
      create: { userId, messages },
    });
  } catch (error) {
    console.error("Error updating user history:", error);
  }
}
