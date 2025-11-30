"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/client";
import type { ActionResponse, TopicWithDetails } from "../types";

// Validation schemas
const createTopicSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  content: z.string().min(1).max(10000),
});

// Create topic with first message
export async function createTopic(data: {
  title: string;
  content: string;
}): Promise<ActionResponse<{ topicId: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate input
    const validation = createTopicSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || "Invalid input",
      };
    }

    const { title, content } = validation.data;

    // Create topic and first message in a transaction
    const topic = await prisma.$transaction(async (tx) => {
      const newTopic = await tx.topic.create({
        data: {
          title,
          authorId: session.user.id,
        },
      });

      await tx.message.create({
        data: {
          topicId: newTopic.id,
          authorId: session.user.id,
          content,
          isFirstMessage: true,
        },
      });

      return newTopic;
    });

    revalidatePath("/dashboard/community");

    return {
      success: true,
      data: { topicId: topic.id },
    };
  } catch (error) {
    console.error("Error creating topic:", error);
    return {
      success: false,
      error: "Failed to create topic",
    };
  }
}

// Get paginated topics
export async function getTopics(page: number = 1): Promise<{
  topics: TopicWithDetails[];
  totalPages: number;
}> {
  const pageSize = 20;
  const skip = (page - 1) * pageSize;

  try {
    const [topics, totalCount] = await Promise.all([
      prisma.topic.findMany({
        skip,
        take: pageSize,
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        include: {
          author: {
            select: { username: true },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.topic.count(),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      topics,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching topics:", error);
    return {
      topics: [],
      totalPages: 0,
    };
  }
}

// Delete topic (owner or admin)
export async function deleteTopic(
  topicId: string
): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Get topic to check ownership
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { authorId: true },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    // Check authorization
    const isOwner = topic.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete topic (cascades to messages and votes)
    await prisma.topic.delete({
      where: { id: topicId },
    });

    revalidatePath("/dashboard/community");

    return { success: true };
  } catch (error) {
    console.error("Error deleting topic:", error);
    return {
      success: false,
      error: "Failed to delete topic",
    };
  }
}

// Toggle pin status (admin only)
export async function togglePinTopic(
  topicId: string
): Promise<ActionResponse<{ isPinned: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check admin role
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      };
    }

    // Get current pin status
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { isPinned: true },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    // Toggle pin status
    const updated = await prisma.topic.update({
      where: { id: topicId },
      data: { isPinned: !topic.isPinned },
      select: { isPinned: true },
    });

    revalidatePath("/dashboard/community");

    return {
      success: true,
      data: { isPinned: updated.isPinned },
    };
  } catch (error) {
    console.error("Error toggling pin:", error);
    return {
      success: false,
      error: "Failed to toggle pin status",
    };
  }
}

// Toggle close status (admin only)
export async function toggleCloseTopic(
  topicId: string
): Promise<ActionResponse<{ isClosed: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check admin role
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Unauthorized: Admin access required",
      };
    }

    // Get current close status
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { isClosed: true },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    // Toggle close status
    const updated = await prisma.topic.update({
      where: { id: topicId },
      data: { isClosed: !topic.isClosed },
      select: { isClosed: true },
    });

    revalidatePath("/dashboard/community");
    revalidatePath(`/dashboard/community/${topicId}`);

    return {
      success: true,
      data: { isClosed: updated.isClosed },
    };
  } catch (error) {
    console.error("Error toggling close:", error);
    return {
      success: false,
      error: "Failed to toggle close status",
    };
  }
}
