import type { Workflow, WorkflowStage, MiniPrompt, StageMiniPrompt } from '@prisma/client';

export type WorkflowWithStages = Workflow & {
  stages: WorkflowStageWithMiniPrompts[];
};

export type WorkflowStageWithMiniPrompts = WorkflowStage & {
  miniPrompts: StageMiniPromptWithMiniPrompt[];
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
  isActive?: boolean;
  visibility?: 'PUBLIC' | 'PRIVATE';
  tagIds?: string[];
  stages: Array<{
    name: string;
    description?: string;
    color?: string;
    order: number;
    miniPrompts: Array<{
      miniPromptId: string;
      order: number;
    }>;
  }>;
}
