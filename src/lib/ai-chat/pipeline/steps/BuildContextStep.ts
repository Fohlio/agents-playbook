/**
 * Build Context Step
 *
 * Enriches the prompt with contextual information using the context provider system
 */

import { ContextBuilderFactory } from '../../context/ContextBuilderFactory';
import type { PipelineContext, PipelineStep } from '../types';

// Import prompts as raw text files
import aiAssistantBasePrompt from '@/lib/prompts/ai-assistant-base.txt';
import aiAssistantWorkflowPrompt from '@/lib/prompts/ai-assistant-workflow.txt';
import aiAssistantMiniPromptPrompt from '@/lib/prompts/ai-assistant-mini-prompt.txt';

export class BuildContextStep implements PipelineStep {
  name = 'BuildContext';

  async execute(context: PipelineContext): Promise<PipelineContext> {
    // Determine if we need extended context
    // First message or after auto-reset = include extended context
    const includeExtendedContext = !context.previousResponseId || context.chainBroken;

    // Build context using provider system
    const contextBuilder = ContextBuilderFactory.createDefault();
    const contextResult = await contextBuilder.buildContext({
      userId: context.userId,
      mode: context.mode,
      workflowContext: context.workflowContext,
      includeExtendedContext,
    });

    // Build base system prompt
    const baseSystemPrompt = aiAssistantBasePrompt;

    // Get mode-specific prompt
    const modePrompt = context.mode === 'workflow'
      ? aiAssistantWorkflowPrompt
      : aiAssistantMiniPromptPrompt;

    // Combine base + mode + context
    let systemPrompt = `${baseSystemPrompt}\n\n${modePrompt}`;
    if (contextResult.systemMessage) {
      systemPrompt += `\n\n${contextResult.systemMessage}`;
    }

    // Combine user message with context
    const userContent = contextResult.userContent
      ? `${context.message}\n\n[Context]\n${contextResult.userContent}`
      : context.message;

    return {
      ...context,
      systemPrompt,
      userContent,
      includeExtendedContext: includeExtendedContext || false,
    };
  }
}
