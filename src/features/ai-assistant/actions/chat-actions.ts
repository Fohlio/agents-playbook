'use server';

/**
 * Server Actions for AI Chat Management
 *
 * Provides server-side functions for loading chat history and managing sessions.
 */

import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';
import { MessagePersistenceService } from '@/lib/ai-chat/message-persistence-service';
import type { CoreMessage } from 'ai';

/**
 * Get chat history for a session
 *
 * @param chatId - Chat session ID
 * @returns Success with messages array or error
 */
export async function getChatHistory(
  chatId: string
): Promise<{ success: boolean; messages?: CoreMessage[]; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const chatSession = await prisma.aIChatSession.findFirst({
      where: { id: chatId, userId: session.user.id },
    });

    if (!chatSession) {
      return { success: false, error: 'Chat session not found' };
    }

    const messages = await MessagePersistenceService.getMessageHistory(chatId);

    return { success: true, messages };
  } catch (error) {
    console.error('Error loading chat history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * List all active chat sessions for the current user
 *
 * @returns Success with sessions array or error
 */
export async function listChatSessions(): Promise<{
  success: boolean;
  sessions?: Array<{
    id: string;
    mode: string;
    workflowName?: string;
    miniPromptName?: string;
    messageCount: number;
    totalTokens: number;
    lastMessageAt: Date;
  }>;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const sessions = await prisma.aIChatSession.findMany({
      where: {
        userId: session.user.id,
        archivedAt: null, // Only active sessions
      },
      include: {
        workflow: { select: { name: true } },
        miniPrompt: { select: { name: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return {
      success: true,
      sessions: sessions.map((s) => ({
        id: s.id,
        mode: s.mode,
        workflowName: s.workflow?.name,
        miniPromptName: s.miniPrompt?.name,
        messageCount: s._count.messages,
        totalTokens: s.totalTokens,
        lastMessageAt: s.lastMessageAt,
      })),
    };
  } catch (error) {
    console.error('Error listing chat sessions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
