/**
 * Persist Messages Step
 *
 * Saves messages to the database with response chaining
 */

import { MessagePersistenceService } from '../../message-persistence-service';
import type { PipelineContext, PipelineStep } from '../types';

export class PersistMessagesStep implements PipelineStep {
  name = 'PersistMessages';

  async execute(context: PipelineContext): Promise<PipelineContext> {
    if (!context.completionResult || !context.chatId) {
      throw new Error('Completion result and chat ID are required');
    }

    // Get responseId from the execution step
    const responseId = context.responseId;

    if (responseId) {
      console.log(`[PersistMessages] Saving messages with responseId: ${responseId}`);
    } else {
      console.log('[PersistMessages] Saving messages without responseId (chain broken)');
    }

    // Calculate tokens
    const tokenCount =
      (context.completionResult.usage.inputTokens || 0) +
      (context.completionResult.usage.outputTokens || 0);

    // Prepare messages to save
    const messagesToSave = [
      { role: 'user' as const, content: context.message },
      {
        role: 'assistant' as const,
        content: context.completionResult.text,
        toolInvocations: context.completionResult.toolCalls || [],
      },
    ];

    console.log(`[PersistMessages] Saving ${messagesToSave.length} messages`);

    // Save messages with response chaining
    await MessagePersistenceService.saveMessages({
      chatId: context.chatId,
      userId: context.userId,
      messages: messagesToSave,
      responseId,
      tokenCount,
    });

    console.log('[PersistMessages] Messages saved successfully');

    return {
      ...context,
      responseId,
      tokenCount,
      messagesSaved: true,
    };
  }
}
