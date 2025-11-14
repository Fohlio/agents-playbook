import { useMemo } from 'react';
import type { WorkflowStageWithMiniPrompts } from '@/lib/types/workflow-constructor-types';
import type { MiniPrompt } from '@prisma/client';
import type { WorkflowContext } from '@/types/ai-chat';

interface WorkflowContextParams {
  workflowId?: string | null;
  workflowName: string;
  workflowDescription?: string | null;
  complexity?: string | null;
  includeMultiAgentChat: boolean;
  stages: WorkflowStageWithMiniPrompts[];
  miniPrompts: MiniPrompt[];
  viewingMiniPromptId?: string | null;
  workflow?: {
    id: string;
    name: string;
    description?: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

export function useWorkflowContext({
  workflowId,
  workflowName,
  workflowDescription,
  complexity,
  includeMultiAgentChat,
  stages,
  miniPrompts,
  viewingMiniPromptId,
  workflow,
}: WorkflowContextParams): WorkflowContext {
  return useMemo((): WorkflowContext => {
    // Find current mini-prompt
    let currentMiniPrompt = undefined;
    if (viewingMiniPromptId) {
      // First try to find in main miniPrompts array
      let mp = miniPrompts.find((m) => m.id === viewingMiniPromptId);
      
      // If not found, search in stages
      if (!mp) {
        for (const stage of stages) {
          const stageMp = stage.miniPrompts.find(
            (smp) => smp.miniPrompt.id === viewingMiniPromptId
          );
          if (stageMp) {
            mp = stageMp.miniPrompt;
            break;
          }
        }
      }
      
      if (mp) {
        currentMiniPrompt = {
          id: mp.id,
          name: mp.name,
          description: mp.description,
          content: mp.content,
        };
      }
    }

    const currentWorkflow = workflowId && workflow
      ? {
          id: workflow.id,
          name: workflowName,
          description: workflowDescription,
          complexity: complexity,
          includeMultiAgentChat,
          stages: stages.map((stage) => ({
            id: stage.id,
            name: stage.name,
            description: stage.description,
            color: stage.color,
            withReview: stage.withReview,
            includeMultiAgentChat: stage.includeMultiAgentChat ?? false,
            order: stage.order,
            miniPrompts: stage.miniPrompts.map((smp) => ({
              miniPrompt: {
                id: smp.miniPrompt.id,
                name: smp.miniPrompt.name,
                description: smp.miniPrompt.description,
                content: smp.miniPrompt.content,
              },
              order: smp.order,
            })),
          })),
        }
      : workflowId
        ? {
            id: 'new',
            name: workflowName,
            description: workflowDescription,
            complexity: null,
            includeMultiAgentChat,
            stages: stages.map((stage) => ({
              id: stage.id,
              name: stage.name,
              description: stage.description,
              color: stage.color,
              withReview: stage.withReview,
              order: stage.order,
              miniPrompts: stage.miniPrompts.map((smp) => ({
                miniPrompt: {
                  id: smp.miniPrompt.id,
                  name: smp.miniPrompt.name,
                  description: smp.miniPrompt.description,
                  content: smp.miniPrompt.content,
                },
                order: smp.order,
              })),
            })),
          }
        : undefined;

    return {
      workflow: currentWorkflow,
      availableMiniPrompts: miniPrompts.map((mp) => ({
        id: mp.id,
        name: mp.name,
        description: mp.description,
      })),
      currentMiniPrompt,
    };
  }, [
    workflowId,
    workflowName,
    workflowDescription,
    complexity,
    includeMultiAgentChat,
    stages,
    miniPrompts,
    viewingMiniPromptId,
    workflow,
  ]);
}

