import type { WorkflowStageWithMiniPrompts } from '@/shared/lib/types/workflow-constructor-types';
import type { JsonValue } from '@prisma/client/runtime/library';

/**
 * Creates a new workflow stage with proper typing.
 * Used for creating temporary stages in the UI before saving.
 */
export function createWorkflowStage(
  params: {
    id: string;
    workflowId: string;
    name: string;
    description: string | null;
    color: string;
    order: number;
    withReview: boolean;
    includeMultiAgentChat: boolean;
  }
): WorkflowStageWithMiniPrompts {
  return {
    id: params.id,
    workflowId: params.workflowId,
    name: params.name,
    description: params.description,
    color: params.color,
    order: params.order,
    withReview: params.withReview,
    includeMultiAgentChat: params.includeMultiAgentChat,
    createdAt: new Date(),
    miniPrompts: [],
    itemOrder: null as JsonValue,
  } as WorkflowStageWithMiniPrompts;
}

