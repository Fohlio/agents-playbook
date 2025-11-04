/**
 * Prepare Data Step
 *
 * Validates input data and prepares the context for processing
 */

import type { PipelineContext, PipelineStep } from '../types';

export class PrepareDataStep implements PipelineStep {
  name = 'PrepareData';

  async execute(context: PipelineContext): Promise<PipelineContext> {
    // Validate required fields
    if (!context.userId) {
      throw new Error('User ID is required');
    }

    if (!context.message || context.message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    if (!context.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    if (!context.mode) {
      throw new Error('Chat mode is required');
    }

    console.log('[PrepareData] Data validation successful');

    return {
      ...context,
      dataReady: true,
    };
  }
}
