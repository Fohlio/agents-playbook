import { UIMessage } from 'ai';

/**
 * AI Chat Mode
 *
 * Determines which instruction set and tools to use
 */
export type AIChatMode = 'workflow' | 'mini-prompt';

/**
 * AI Chat Session
 *
 * Database representation of a chat session
 */
export interface AIChatSession {
  id: string;
  userId: string;
  workflowId?: string | null;
  miniPromptId?: string | null;
  mode: string;
  totalTokens: number;
  archivedAt?: Date | null;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Token Usage Statistics
 *
 * Tracks token consumption for the session
 */
export interface TokenUsage {
  input: number;
  output: number;
  total: number;
}

/**
 * AI Tool Result
 *
 * Result returned by AI tools (createWorkflow, modifyStage, etc.)
 */
export interface AIToolResult {
  success: boolean;
  action?: string;
  workflow?: WorkflowToolData;
  stage?: StageToolData;
  miniPrompt?: MiniPromptToolData;
  stageIndex?: number; // Deprecated: use stagePosition
  stageId?: string; // Database ID of stage (for saved stages)
  stagePosition?: number; // Position/index of stage (for temporary stages)
  updates?: Record<string, unknown>;
  miniPromptId?: string;
  miniPromptPosition?: number; // Position of mini-prompt within stage
  message?: string;
}

/**
 * Workflow data structure from AI tools
 */
export interface WorkflowToolData {
  name: string;
  description?: string;
  complexity?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  includeMultiAgentChat?: boolean;
  stages: StageToolData[];
}

/**
 * Stage data structure from AI tools
 */
export interface StageToolData {
  name: string;
  description?: string;
  color?: string;
  withReview?: boolean;
  includeMultiAgentChat?: boolean;
  position?: number;
  miniPrompts: MiniPromptReference[];
}

/**
 * Mini-prompt reference within a stage
 */
export interface MiniPromptReference {
  id?: string; // Existing mini-prompt ID (if reusing)
  name: string;
  description?: string;
  content?: string; // Required if creating new
}

/**
 * Mini-prompt data structure from AI tools
 */
export interface MiniPromptToolData {
  name: string;
  description?: string;
  content: string;
  tags?: string[];
}

/**
 * Workflow Context for AI
 *
 * Provides current workflow state to the AI
 */
export interface WorkflowContext {
  workflow?: {
    id: string;
    name: string;
    description?: string | null;
    complexity?: string | null;
    includeMultiAgentChat: boolean;
    stages?: Array<{
      id: string;
      name: string;
      description?: string | null;
      color?: string | null;
      withReview: boolean;
      includeMultiAgentChat?: boolean;
      order: number;
      miniPrompts?: Array<{
        miniPrompt: {
          id: string;
          name: string;
          description?: string | null;
          content: string;
        };
        order: number;
      }>;
    }>;
  };
  availableMiniPrompts?: Array<{
    id: string;
    name: string;
    description?: string | null;
  }>;
  currentMiniPrompt?: {
    id: string;
    name: string;
    description?: string | null;
    content: string;
  };
  mode?: AIChatMode;
}

/**
 * AI Chat Request
 *
 * Request body for POST /api/ai-assistant/chat
 */
export interface AIChatRequest {
  messages: UIMessage[];
  workflowContext?: WorkflowContext;
  mode: AIChatMode;
  sessionId?: string;
}

/**
 * AI Chat Response
 *
 * Complete response from the AI (non-streaming)
 */
export interface AIChatResponse {
  sessionId: string;
  message: {
    role: 'assistant';
    content: string;
    toolInvocations?: unknown[];
  };
  tokenUsage: TokenUsage;
}

/**
 * Chat Session Summary
 *
 * List view of chat sessions
 */
export interface ChatSessionSummary {
  id: string;
  mode: string;
  workflowId?: string | null;
  miniPromptId?: string | null;
  workflowName?: string;
  miniPromptName?: string;
  lastMessageAt: Date;
  messageCount: number;
  totalTokens: number;
}

/**
 * Execution Plan Item
 *
 * Represents a planned change from AI tool call
 */
export interface ExecutionPlanItem {
  toolName: string;
  description: string;
  data: AIToolResult;
}

/**
 * Execution Plan
 *
 * Collection of planned changes for user approval
 */
export interface ExecutionPlan {
  items: ExecutionPlanItem[];
  summary: string;
}
