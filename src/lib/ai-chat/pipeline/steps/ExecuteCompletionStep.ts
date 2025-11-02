/**
 * Execute Completion Step
 *
 * Executes the OpenAI completion API (non-streaming)
 */

import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import type { PipelineContext, PipelineStep } from '../types';

export class ExecuteCompletionStep implements PipelineStep {
  name = 'ExecuteCompletion';

  async execute(context: PipelineContext): Promise<PipelineContext> {
    if (!context.systemPrompt || !context.userContent) {
      throw new Error('System prompt and user content are required');
    }

    if (!context.chatId) {
      throw new Error('Chat ID is required');
    }

    // Create OpenAI client with responses API
    const openai = createOpenAI({ apiKey: context.apiKey });

    // Generate completion with response chaining using Responses API
    // IMPORTANT: Must use providerOptions (not experimental_providerMetadata) and store: true
    const result = await generateText({
      model: openai.responses('gpt-4o'),
      system: context.systemPrompt,
      messages: [{ role: 'user', content: context.userContent }],
      tools: context.tools,
      providerOptions: {
        openai: {
          previousResponseId: context.previousResponseId as string,
          store: true, // Required for response chaining to work
          metadata: {
            chatId: context.chatId,
            userId: context.userId,
          },
        },
      },
    });

    // Extract responseId from provider metadata
    const responseId = result.providerMetadata?.openai?.responseId as string | undefined;

    // Extract toolResults (AI SDK v5 format)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolResults = (result as any).toolResults;

    return {
      ...context,
      completionResult: {
        text: result.text,
        toolCalls: result.toolCalls,
        toolResults: toolResults || [],
        usage: {
          inputTokens: result.usage.inputTokens || 0,
          outputTokens: result.usage.outputTokens || 0,
        },
      },
      responseId, // Store the new responseId for persistence
    };
  }
}
