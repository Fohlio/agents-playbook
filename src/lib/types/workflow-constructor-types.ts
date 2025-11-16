import type { Workflow, WorkflowStage, MiniPrompt, StageMiniPrompt, WorkflowComplexity } from '@prisma/client';

export type { WorkflowComplexity };

export type WorkflowWithStages = Workflow & {
  stages: WorkflowStageWithMiniPrompts[];
};

export type WorkflowStageWithMiniPrompts = WorkflowStage & {
  miniPrompts: StageMiniPromptWithMiniPrompt[];
  // Optional: stores the order of all items (mini-prompts + automatic prompts) for flexible positioning
  // Format: array of IDs where IDs starting with 'memory-board-' or 'multi-agent-chat-' are automatic prompts
  itemOrder?: string[];
};

export type StageMiniPromptWithMiniPrompt = StageMiniPrompt & {
  miniPrompt: MiniPrompt;
};

export interface WorkflowConstructorData {
  workflow: WorkflowWithStages | null;
  miniPrompts: MiniPrompt[];
}

export interface CreateWorkflowStageInput {
  workflowId: string;
  name: string;
  description?: string;
  color?: string;
  order: number;
}

export interface UpdateWorkflowStageInput {
  id: string;
  name?: string;
  description?: string;
  color?: string;
  order?: number;
}

export interface AddMiniPromptToStageInput {
  stageId: string;
  miniPromptId: string;
  order: number;
}

export interface RemoveMiniPromptFromStageInput {
  stageId: string;
  miniPromptId: string;
}

export interface ReorderStageMiniPromptsInput {
  stageId: string;
  miniPromptOrders: Array<{ miniPromptId: string; order: number }>;
}

export interface SaveWorkflowInput {
  workflowId: string;
  name?: string;
  description?: string;
  complexity?: WorkflowComplexity;
  isActive?: boolean;
  visibility?: 'PUBLIC' | 'PRIVATE';
  includeMultiAgentChat?: boolean;
  tagIds?: string[];
  stages: Array<{
    name: string;
    description?: string;
    color?: string;
    order: number;
    withReview?: boolean;
    includeMultiAgentChat?: boolean;
    itemOrder?: string[];
    miniPrompts: Array<{
      miniPromptId: string;
      order: number;
    }>;
  }>;
}

// Auto-prompt metadata for visualization
export interface AutoPromptMetadata {
  id: string;
  name: string;
  type: 'memory-board' | 'multi-agent-chat';
  isAutoAttached: true;
  position: 'stage-end' | 'after-mini-prompt';
}
