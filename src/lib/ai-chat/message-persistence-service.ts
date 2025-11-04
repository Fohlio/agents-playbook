/**
 * Message Persistence Service
 *
 * Handles saving messages with OpenAI response chaining, token tracking,
 * and auto-reset threshold checking for AI assistant conversations.
 */

import { prisma } from '@/lib/db/client';
import { withRetry } from '@/lib/db/retry';
import type { CoreMessage } from 'ai';
import type { MessageRole } from '@prisma/client';

export interface SaveMessagesParams {
  chatId: string;
  userId: string;
  messages: CoreMessage[]; // User + Assistant messages
  responseId: string | undefined; // From OpenAI providerMetadata
  tokenCount: number; // From OpenAI usage
}

export class MessagePersistenceService {
  /**
   * Auto-reset token threshold (100k tokens)
   */
  private static readonly AUTO_RESET_TOKEN_THRESHOLD = 100_000;

  /**
   * Save messages with response chaining and token tracking
   *
   * @param params - Save messages parameters
   * @throws Error if save operation fails
   */
  static async saveMessages(params: SaveMessagesParams): Promise<void> {
    await withRetry(async () => {
      await prisma.$transaction(async (tx) => {
        // Save each message individually
        for (const message of params.messages) {
          const role = message.role.toUpperCase() as MessageRole;

          // Extract content
          const content = typeof message.content === 'string'
            ? message.content
            : JSON.stringify(message.content);

          // Extract tool invocations if present
          const toolInvocations = (message as { toolInvocations?: unknown }).toolInvocations || null;

          await tx.chatMessage.create({
            data: {
              chatId: params.chatId,
              userId: params.userId,
              role,
              content,
              previousResponseId: params.responseId || null,
              tokenCount: params.tokenCount,
              toolInvocations: toolInvocations ? JSON.parse(JSON.stringify(toolInvocations)) : null,
            },
          });
        }

        // Update session stats
        await tx.aIChatSession.update({
          where: { id: params.chatId },
          data: {
            lastMessageAt: new Date(),
            totalTokens: {
              increment: params.tokenCount,
            },
          },
        });
      });
    });
  }

  /**
   * Check if auto-reset should be triggered based on token count
   *
   * @param chatId - Chat session ID
   * @returns true if totalTokens >= threshold, false otherwise
   */
  static async shouldTriggerAutoReset(chatId: string): Promise<boolean> {
    const session = await prisma.aIChatSession.findUnique({
      where: { id: chatId },
      select: { totalTokens: true },
    });

    if (!session) return false;

    return session.totalTokens >= this.AUTO_RESET_TOKEN_THRESHOLD;
  }

  /**
   * Get last assistant message's previousResponseId for chain continuity
   *
   * @param chatId - Chat session ID
   * @returns previousResponseId or undefined if no messages exist or if last message had tool calls
   */
  static async getLastResponseId(chatId: string): Promise<string | undefined> {
    const lastMessage = await prisma.chatMessage.findFirst({
      where: { chatId, role: 'ASSISTANT' },
      orderBy: { createdAt: 'desc' },
      select: { previousResponseId: true, toolInvocations: true },
    });

    if (!lastMessage) {
      return undefined;
    }

    // If the last message had tool calls, we cannot chain responses
    // because OpenAI Responses API requires tool outputs to be provided
    if (lastMessage.toolInvocations) {
      const toolInvocations = lastMessage.toolInvocations as unknown;
      if (Array.isArray(toolInvocations) && toolInvocations.length > 0) {
        console.log('[MessagePersistence] Last message had tool calls, breaking chain to avoid API error');
        return undefined;
      }
    }

    return lastMessage.previousResponseId || undefined;
  }

  /**
   * Get conversation history for AI context
   *
   * @param chatId - Chat session ID
   * @param limit - Maximum number of messages to retrieve (default: 50)
   * @returns Array of messages formatted as CoreMessage[] for AI SDK
   */
  static async getMessageHistory(
    chatId: string,
    limit: number = 50
  ): Promise<CoreMessage[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        role: true,
        content: true,
        toolInvocations: true,
      },
    });

    // Reverse to get chronological order (oldest first)
    return messages.reverse().map((msg) => {
      const coreMessage: CoreMessage = {
        role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
        content: msg.content,
      };

      // Add tool invocations if present
      if (msg.toolInvocations) {
        (coreMessage as { toolInvocations?: unknown }).toolInvocations = msg.toolInvocations;
      }

      return coreMessage;
    });
  }
}
