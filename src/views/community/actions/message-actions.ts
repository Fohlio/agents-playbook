"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/client";
import type { ActionResponse, MessageWithDetails } from "../types";

// Validation schema
const createMessageSchema = z.object({
  topicId: z.string().uuid(),
  content: z.string().min(1).max(10000),
});

// Create message in topic
export async function createMessage(data: {
  topicId: string;
  content: string;
}): Promise<ActionResponse<{ message: MessageWithDetails }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validation = createMessageSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || "Invalid input",
      };
    }

    const { topicId, content } = validation.data;

    // Check topic exists and is not closed
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { isClosed: true },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    if (topic.isClosed) {
      return {
        success: false,
        error: "Cannot add messages to closed topic",
      };
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        topicId,
        authorId: session.user.id,
        content,
        isFirstMessage: false,
      },
      include: {
        author: {
          select: { username: true },
        },
        _count: {
          select: { votes: true },
        },
        votes: {
          where: { userId: session.user.id },
          select: { id: true, userId: true, messageId: true, createdAt: true },
        },
      },
    });

    revalidatePath(`/dashboard/community/${topicId}`);

    return {
      success: true,
      data: { message },
    };
  } catch (error) {
    console.error("Error creating message:", error);
    return {
      success: false,
      error: "Failed to create message",
    };
  }
}

// Get messages for topic with pagination
export async function getMessages(
  topicId: string,
  page: number = 1
): Promise<{
  messages: MessageWithDetails[];
  totalPages: number;
}> {
  const pageSize = 50;
  const skip = (page - 1) * pageSize;

  try {
    const session = await auth();
    const userId = session?.user?.id;

    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where: { topicId },
        skip,
        take: pageSize,
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { username: true },
          },
          _count: {
            select: { votes: true },
          },
          votes: userId
            ? {
                where: { userId },
                select: { id: true, userId: true, messageId: true, createdAt: true },
              }
            : false,
        },
      }),
      prisma.message.count({
        where: { topicId },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      messages,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return {
      messages: [],
      totalPages: 0,
    };
  }
}

// Delete message (owner or admin)
export async function deleteMessage(
  messageId: string
): Promise<ActionResponse<{ deletedTopic?: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Get message with topic
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: {
        authorId: true,
        isFirstMessage: true,
        topicId: true,
      },
    });

    if (!message) {
      return { success: false, error: "Message not found" };
    }

    // Check authorization
    const isOwner = message.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    // If deleting first message, delete entire topic
    if (message.isFirstMessage) {
      await prisma.topic.delete({
        where: { id: message.topicId },
      });

      revalidatePath("/dashboard/community");

      return {
        success: true,
        data: { deletedTopic: true },
      };
    }

    // Otherwise, delete only the message
    await prisma.message.delete({
      where: { id: messageId },
    });

    revalidatePath(`/dashboard/community/${message.topicId}`);

    return {
      success: true,
      data: { deletedTopic: false },
    };
  } catch (error) {
    console.error("Error deleting message:", error);
    return {
      success: false,
      error: "Failed to delete message",
    };
  }
}
