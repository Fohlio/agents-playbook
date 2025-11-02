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

    let result;
    try {
      // Generate completion with response chaining using Responses API
      // IMPORTANT: Must use providerOptions (not experimental_providerMetadata) and store: true
      result = await generateText({
        model: openai.responses('gpt-4o'),
        system: context.systemPrompt,
        messages: [{ role: 'user', content: context.userContent }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tools: context.tools as any,
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
    } catch (error) {
      console.error('[ExecuteCompletionStep] Error during generateText:', error);

      // Handle Zod validation errors from tool input validation
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as Error).message;

        // Check if it's a Zod validation error
        if (errorMessage.includes('Invalid value') || errorMessage.includes('validation')) {
          return {
            ...context,
            completionResult: {
              text: `I encountered a validation error with the tool parameters. Please rephrase your request with more specific details. Error: ${errorMessage}`,
              toolCalls: [],
              toolResults: [],
              usage: { inputTokens: 0, outputTokens: 0 },
            },
          };
        }
      }

      // Re-throw other errors
      throw error;
    }

    // Extract responseId from provider metadata
    const responseId = result.providerMetadata?.openai?.responseId as string | undefined;

    // Extract tool results from response.messages
    // The AI SDK with Responses API returns tool results in a nested structure
    interface ToolInvocation {
      type: string;
      toolCallId: string;
      toolName: string;
      args: unknown;
      output: unknown;
      state: string;
    }
    const toolInvocations: ToolInvocation[] = [];

    if (result.response?.messages) {
      interface AIMessage {
        role: string;
        content?: Array<{
          type?: string;
          toolCallId?: string;
          toolName?: string;
          input?: unknown;
          output?: { value?: unknown };
        }>;
      }
      const messages = result.response.messages as AIMessage[];

      // Find tool result messages (role: 'tool')
      const toolMessages = messages.filter(msg => msg.role === 'tool');

      toolMessages.forEach(toolMsg => {
        if (toolMsg.content && Array.isArray(toolMsg.content)) {
          toolMsg.content.forEach((contentItem) => {
            if (contentItem.type === 'tool-result' && contentItem.output?.value) {
              toolInvocations.push({
                type: 'tool-result',
                toolCallId: contentItem.toolCallId || '',
                toolName: contentItem.toolName || '',
                args: contentItem.input,
                output: contentItem.output.value,
                state: 'result',
              });
            }
          });
        }
      });
    }

    // Build a friendly message from tool results
    let friendlyMessage = result.text;
    if (!friendlyMessage && toolInvocations.length > 0) {
      const messages = toolInvocations
        .map(inv => {
          // Handle error output
          if (inv.output && typeof inv.output === 'object' && 'error' in inv.output) {
            const errorValue = (inv.output as { error: unknown }).error;
            return `Error: ${typeof errorValue === 'string' ? errorValue : JSON.stringify(errorValue, null, 2)}`;
          }
          // Handle normal message output
          if (inv.output && typeof inv.output === 'object' && 'message' in inv.output) {
            return (inv.output as { message: string }).message;
          }
          return undefined;
        })
        .filter(Boolean);

      if (messages.length > 0) {
        friendlyMessage = messages.join('\n\n');
      } else {
        friendlyMessage = 'Action completed successfully!';
      }
    }

    // Check if result.text is an error-like object being serialized incorrectly
    if (typeof result.text === 'object' && result.text !== null) {
      console.error('[ExecuteCompletionStep] Result text is an object, converting to string:', result.text);
      friendlyMessage = JSON.stringify(result.text, null, 2);
    }

    return {
      ...context,
      completionResult: {
        text: friendlyMessage || 'Tool executed successfully',
        toolCalls: result.toolCalls?.map(tc => ({
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          args: 'args' in tc ? tc.args : {},
        })),
        toolResults: toolInvocations.map(ti => ({
          toolCallId: ti.toolCallId,
          toolName: ti.toolName,
          result: ti.output,
        })),
        usage: {
          inputTokens: result.usage.inputTokens || 0,
          outputTokens: result.usage.outputTokens || 0,
        },
      },
      responseId, // Store the new responseId for persistence
    };
  }
}
