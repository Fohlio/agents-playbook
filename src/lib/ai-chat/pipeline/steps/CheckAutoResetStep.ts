/**
 * Check Auto-Reset Step
 *
 * Checks if the conversation needs to be reset due to token limit
 * and triggers auto-reset if needed
 */

import { MessagePersistenceService } from '../../message-persistence-service';
import { AutoResetManager } from '../../auto-reset-manager';
import type { PipelineContext, PipelineStep } from '../types';
import type { ModelMessage } from 'ai';

export class CheckAutoResetStep implements PipelineStep {
  name = 'CheckAutoReset';

  async execute(context: PipelineContext): Promise<PipelineContext> {
    if (!context.chatId) {
      throw new Error('Chat ID is required for auto-reset check');
    }

    // Check if auto-reset is needed
    const needsReset = await MessagePersistenceService.shouldTriggerAutoReset(
      context.chatId
    );

    let chatId = context.chatId;
    let autoResetTriggered = false;
    let chainBroken = false;
    let previousResponseId: string | undefined;
    let previousToolResults: ModelMessage[] = [];

    if (needsReset) {
      console.log('[CheckAutoReset] Token threshold exceeded, triggering auto-reset');

      // Trigger auto-reset
      chatId = await AutoResetManager.triggerAutoReset(
        context.chatId,
        context.userId,
        context.apiKey
      );

      autoResetTriggered = true;
      chainBroken = true;
      previousResponseId = undefined;
      previousToolResults = [];

      console.log(`[CheckAutoReset] Auto-reset complete, new session: ${chatId}`);
    } else {
      // Get previous response ID for chain continuity
      previousResponseId = await MessagePersistenceService.getLastResponseId(
        context.chatId
      );

      // Get tool results from previous message if it had tool calls
      if (previousResponseId) {
        previousToolResults = await MessagePersistenceService.getLastToolResults(
          context.chatId
        );
        if (previousToolResults.length > 0) {
          console.log(`[CheckAutoReset] Found ${previousToolResults.length} tool results from previous message`);
        }
      }

      console.log(`[CheckAutoReset] No reset needed, previousResponseId: ${previousResponseId || 'none'}`);
    }

    return {
      ...context,
      chatId,
      autoResetTriggered,
      chainBroken,
      previousResponseId,
      previousToolResults,
    };
  }
}
