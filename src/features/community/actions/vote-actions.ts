"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/client";
import type { ActionResponse } from "../types";

// Toggle message vote (upvote/remove vote)
export async function toggleMessageVote(
  messageId: string
): Promise<ActionResponse<{ voteCount: number; hasVoted: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // Get message to check if it's the user's own message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { authorId: true },
    });

    if (!message) {
      return { success: false, error: "Message not found" };
    }

    // Prevent self-voting
    if (message.authorId === userId) {
      return {
        success: false,
        error: "Cannot vote on your own message",
      };
    }

    // Use transaction to avoid race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Check if user already voted
      const existingVote = await tx.messageVote.findUnique({
        where: {
          messageId_userId: {
            messageId,
            userId,
          },
        },
      });

      let hasVoted: boolean;

      if (existingVote) {
        // Remove vote
        await tx.messageVote.delete({
          where: { id: existingVote.id },
        });
        hasVoted = false;
      } else {
        // Create vote
        await tx.messageVote.create({
          data: {
            messageId,
            userId,
          },
        });
        hasVoted = true;
      }

      // Count total votes for message
      const voteCount = await tx.messageVote.count({
        where: { messageId },
      });

      return { hasVoted, voteCount };
    });

    return {
      success: true,
      data: {
        voteCount: result.voteCount,
        hasVoted: result.hasVoted,
      },
    };
  } catch (error) {
    console.error("Error toggling vote:", error);
    return {
      success: false,
      error: "Failed to toggle vote",
    };
  }
}
