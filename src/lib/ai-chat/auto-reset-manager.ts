/**
 * Auto-Reset Manager
 *
 * Handles automatic conversation reset when token threshold is reached.
 * Generates summaries, archives old sessions, and creates fresh sessions.
 */

import { prisma } from '@/lib/db/client';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import type { ModelMessage } from 'ai';

export class AutoResetManager {
  /**
   * Prompt for generating conversation summaries
   */
  private static readonly SUMMARY_PROMPT = `Summarize the following conversation in a concise format that preserves key decisions, context, and progress. Focus on:
- What has been accomplished
- Current state of the workflow/mini-prompt
- Important context for continuing the conversation

Keep the summary under 500 tokens.`;

  /**
   * Trigger auto-reset: generate summary, archive session, create new session
   *
   * @param chatId - Current chat session ID
   * @param userId - User ID
   * @param apiKey - OpenAI API key for summary generation
   * @returns New chat session ID
   * @throws Error if session not found or summary generation fails
   */
  static async triggerAutoReset(
    chatId: string,
    userId: string,
    apiKey: string
  ): Promise<string> {
    // Get current session with messages
    const session = await prisma.aIChatSession.findUnique({
      where: { id: chatId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!session) {
      throw new Error('Chat session not found');
    }

    // Format messages for AI summary generation
    const messages: ModelMessage[] = session.messages.map((msg) => ({
      role: msg.role.toLowerCase() as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    // Generate conversation summary using GPT-4o-mini (fast and cheap)
    const openai = createOpenAI({ apiKey });
    const { text: summary } = await generateText({
      model: openai('gpt-4o-mini'),
      system: this.SUMMARY_PROMPT,
      prompt: JSON.stringify(messages),
    });

    // Archive current session
    await prisma.aIChatSession.update({
      where: { id: chatId },
      data: { archivedAt: new Date() },
    });

    // Create new session linked to same workflow/mini-prompt
    const newSession = await prisma.aIChatSession.create({
      data: {
        userId,
        workflowId: session.workflowId,
        miniPromptId: session.miniPromptId,
        mode: session.mode,
        totalTokens: 0,
      },
    });

    // Add summary as first system message in new session
    await prisma.chatMessage.create({
      data: {
        chatId: newSession.id,
        userId,
        role: 'SYSTEM',
        content: `Previous conversation summary:\n\n${summary}`,
        tokenCount: 0,
      },
    });

    return newSession.id;
  }
}
