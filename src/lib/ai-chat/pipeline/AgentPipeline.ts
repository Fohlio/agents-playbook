/**
 * Agent Pipeline Orchestrator
 *
 * Orchestrates the execution of pipeline steps for AI chat processing.
 * Follows the Chain of Responsibility pattern where each step processes
 * the context and passes it to the next step.
 */

import type { PipelineContext, PipelineStep, PipelineResult, ToolInvocation } from './types';
import { PrepareDataStep } from './steps/PrepareDataStep';
import { DetermineSessionStep } from './steps/DetermineSessionStep';
import { CheckAutoResetStep } from './steps/CheckAutoResetStep';
import { BuildContextStep } from './steps/BuildContextStep';
import { PrepareRequestStep } from './steps/PrepareRequestStep';
import { ExecuteCompletionStep } from './steps/ExecuteCompletionStep';
import { PersistMessagesStep } from './steps/PersistMessagesStep';

export class AgentPipeline {
  private steps: PipelineStep[] = [];

  /**
   * Create a completion-optimized pipeline
   */
  static forCompletion(): AgentPipeline {
    const pipeline = new AgentPipeline();

    // Register all pipeline steps in order
    pipeline
      .addStep(new PrepareDataStep())       // 1. Validate input data
      .addStep(new DetermineSessionStep())  // 2. Get or create session
      .addStep(new CheckAutoResetStep())    // 3. Check token limits & get previousResponseId
      .addStep(new BuildContextStep())      // 4. Build context prompts
      .addStep(new PrepareRequestStep())    // 5. Load tools if needed
      .addStep(new ExecuteCompletionStep()) // 6. Call OpenAI API with response chaining
      .addStep(new PersistMessagesStep());  // 7. Save messages with responseId

    return pipeline;
  }

  /**
   * Register a pipeline step
   */
  addStep(step: PipelineStep): this {
    this.steps.push(step);
    return this;
  }

  /**
   * Execute the pipeline
   */
  async execute(initialContext: PipelineContext): Promise<PipelineResult> {
    let context = { ...initialContext };

    // Execute each step sequentially
    for (const step of this.steps) {
      try {
        context = await step.execute(context);
      } catch (error) {
        console.error(`[Pipeline] Error in step ${step.name}:`, error);
        throw error;
      }
    }

    // Build final result
    if (!context.completionResult || !context.chatId) {
      throw new Error('Pipeline execution incomplete - missing required results');
    }

    // Convert toolResults or toolCalls to ToolInvocation format
    const toolInvocations: ToolInvocation[] = [];

    if (context.completionResult.toolResults) {
      context.completionResult.toolResults.forEach(tr => {
        toolInvocations.push({
          type: 'tool-result',
          toolCallId: tr.toolCallId,
          toolName: tr.toolName,
          args: {},
          output: tr.result,
          state: 'result',
        });
      });
    } else if (context.completionResult.toolCalls) {
      context.completionResult.toolCalls.forEach(tc => {
        toolInvocations.push({
          type: 'tool-call',
          toolCallId: tc.toolCallId,
          toolName: tc.toolName,
          args: tc.args,
          output: null,
          state: 'pending',
        });
      });
    }

    return {
      sessionId: context.chatId,
      message: {
        role: 'assistant',
        content: context.completionResult.text,
        toolInvocations,
      },
      tokenUsage: {
        input: context.completionResult.usage.inputTokens,
        output: context.completionResult.usage.outputTokens,
        total: context.tokenCount || 0,
      },
    };
  }
}
