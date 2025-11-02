/**
 * Pipeline Types
 *
 * Type definitions for the AI chat pipeline architecture
 */

import type { AIChatMode, WorkflowContext } from '@/types/ai-chat';

/**
 * Agent context passed through the pipeline
 */
export interface AgentContext {
  userId: string;
  mode: AIChatMode;
  message: string;
  workflowContext?: WorkflowContext;
  sessionId?: string | null;
  apiKey: string;
}

/**
 * Pipeline context that accumulates data through steps
 */
export interface PipelineContext extends AgentContext {
  // Step 1: Data preparation results
  dataReady?: boolean;

  // Step 2: Session determination results
  chatId?: string;
  isNewSession?: boolean;

  // Step 3: Auto-reset results
  autoResetTriggered?: boolean;
  chainBroken?: boolean;
  previousResponseId?: string;

  // Step 4: Context building results
  systemPrompt?: string;
  userContent?: string;
  includeExtendedContext?: boolean;

  // Step 5: Request preparation results
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools?: any;

  // Step 6: Execution results
  completionResult?: {
    text: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toolCalls?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toolResults?: any[];
    usage: {
      inputTokens: number;
      outputTokens: number;
    };
  };

  // Step 7: Persistence results
  responseId?: string;
  tokenCount?: number;
  messagesSaved?: boolean;
}

/**
 * Pipeline execution result
 */
export interface PipelineResult {
  sessionId: string;
  message: {
    role: 'assistant';
    content: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toolInvocations: any[];
  };
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
}

/**
 * Base pipeline step interface
 */
export interface PipelineStep {
  /**
   * Step name for logging
   */
  name: string;

  /**
   * Execute the step and return enriched context
   */
  execute(context: PipelineContext): Promise<PipelineContext>;
}
