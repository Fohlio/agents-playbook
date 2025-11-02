/**
 * Determine Session Step
 *
 * Gets or creates a chat session for the conversation
 */

import { prisma } from '@/lib/db/client';
import type { PipelineContext, PipelineStep } from '../types';

export class DetermineSessionStep implements PipelineStep {
  name = 'DetermineSession';

  async execute(context: PipelineContext): Promise<PipelineContext> {
    let chatId = context.sessionId;
    let isNewSession = false;

    // Create new session if none provided
    if (!chatId) {
      console.log('[DetermineSession] Creating new session');

      const newSession = await prisma.aIChatSession.create({
        data: {
          userId: context.userId,
          workflowId: context.workflowContext?.workflow?.id || null,
          miniPromptId: null,
          mode: context.mode,
          totalTokens: 0,
        },
      });

      chatId = newSession.id;
      isNewSession = true;

      console.log(`[DetermineSession] Created new session: ${chatId}`);
    } else {
      console.log(`[DetermineSession] Using existing session: ${chatId}`);
    }

    return {
      ...context,
      chatId,
      isNewSession,
    };
  }
}
