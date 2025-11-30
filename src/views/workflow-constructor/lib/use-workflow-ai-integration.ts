import { useState, useCallback } from 'react';
import { useWorkflowConstructorStore } from './workflow-constructor-store';
import { useWorkflowAITools } from '../hooks/use-workflow-ai-tools';
import type { AIToolResult, ExecutionPlan } from '@/types/ai-chat';
import type { WorkflowStageWithMiniPrompts } from '@/shared/lib/types/workflow-constructor-types';

/**
 * Custom hook for AI assistant integration
 * Handles AI tool results and execution plan management
 */
export function useWorkflowAIIntegration() {
  const {
    localStages,
    setLocalStages,
    setWorkflowName,
    setComplexity,
    setIncludeMultiAgentChat,
    setIsPublic,
    setMiniPrompts,
    markDirty,
  } = useWorkflowConstructorStore();

  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(null);
  const [showExecutionPlan, setShowExecutionPlan] = useState(false);

  const { handleToolResult } = useWorkflowAITools({
    localStages,
    setLocalStages,
    setWorkflowName,
    setComplexity,
    setIncludeMultiAgentChat,
    setIsPublic,
    setMiniPrompts,
    setSelectedTagIds: useWorkflowConstructorStore.getState().setSelectedTagIds,
    markDirty,
  });

  const handleToolCall = useCallback(
    (toolResult: AIToolResult) => {
      console.log('[useWorkflowAIIntegration] handleToolCall received:', toolResult);
      console.log('[useWorkflowAIIntegration] Type of toolResult:', typeof toolResult);

      // Guard against string or primitive types being passed
      if (typeof toolResult !== 'object' || toolResult === null) {
        console.error('[useWorkflowAIIntegration] toolResult is not an object, ignoring:', toolResult);
        return;
      }

      // Normalize the tool result - infer action from the data structure
      const normalizedResult = { ...toolResult };
      if (!normalizedResult.action) {
        if (normalizedResult.workflow) {
          normalizedResult.action = 'createWorkflow';
        } else if (normalizedResult.stage) {
          normalizedResult.action = 'add_stage';
        } else if (normalizedResult.miniPrompt) {
          normalizedResult.action = 'createMiniPrompt';
        }
      }

      // Process tool result and update local state immediately
      handleToolResult(normalizedResult);
    },
    [handleToolResult]
  );

  const handleApproveExecutionPlan = useCallback(() => {
    if (!executionPlan) return;

    const workflowId = useWorkflowConstructorStore.getState().workflowId;

    // Apply execution plan changes
    executionPlan.items.forEach((item) => {
      const { data } = item;

      // Handle createWorkflow
      if (data.workflow) {
        setWorkflowName(data.workflow.name);
        if (data.workflow.complexity) {
          setComplexity(data.workflow.complexity);
        }
        if (data.workflow.includeMultiAgentChat !== undefined) {
          setIncludeMultiAgentChat(data.workflow.includeMultiAgentChat);
        }
        // Create stages from workflow data
        if (data.workflow.stages && data.workflow.stages.length > 0) {
          interface StageCreationData {
            name: string;
            description?: string;
            color?: string;
            withReview?: boolean;
            includeMultiAgentChat?: boolean;
          }

          const newStages: WorkflowStageWithMiniPrompts[] = data.workflow.stages.map(
            (stageData: StageCreationData, idx: number) => {
              const stage: Omit<WorkflowStageWithMiniPrompts, 'itemOrder'> & { itemOrder?: string[] } = {
                id: `temp-${Date.now()}-${idx}`,
                workflowId: workflowId || '',
                name: stageData.name,
                description: stageData.description || null,
                color: stageData.color || null,
                order: idx,
                withReview: stageData.withReview ?? true,
                includeMultiAgentChat: stageData.includeMultiAgentChat ?? false,
                createdAt: new Date(),
                miniPrompts: [],
              };
              return stage as WorkflowStageWithMiniPrompts;
            }
          );
          setLocalStages(newStages);
        }
        markDirty();
      }

      // Handle addStage
      if (data.action === 'add_stage' && data.stage) {
        const newStage: Omit<WorkflowStageWithMiniPrompts, 'itemOrder'> & { itemOrder?: string[] } = {
          id: `temp-${Date.now()}`,
          workflowId: workflowId || '',
          name: data.stage.name,
          description: data.stage.description || null,
          color: data.stage.color || null,
          order:
            data.stage.position === -1
              ? localStages.length
              : (data.stage.position ?? localStages.length),
          withReview: data.stage.withReview ?? true,
          includeMultiAgentChat: data.stage.includeMultiAgentChat ?? false,
          createdAt: new Date(),
          miniPrompts: [],
        };
        
        const typedStage = newStage as WorkflowStageWithMiniPrompts;

        if (data.stage.position === -1) {
          setLocalStages([...localStages, typedStage]);
        } else {
          const updatedStages = [...localStages];
          updatedStages.splice(
            data.stage.position ?? localStages.length,
            0,
            typedStage
          );
          setLocalStages(updatedStages.map((s, i) => ({ ...s, order: i })));
        }
        markDirty();
      }

      // Handle modifyStage
      if (
        data.action === 'modify_stage' &&
        data.stageIndex !== undefined &&
        data.updates
      ) {
        const updates = data.updates; // Capture for TypeScript
        setLocalStages((prevStages) =>
          prevStages.map((stage, idx) => {
            if (idx === data.stageIndex) {
              return {
                ...stage,
                ...(updates.name ? { name: String(updates.name) } : {}),
                ...(updates.description !== undefined
                  ? {
                      description: updates.description
                        ? String(updates.description)
                        : null,
                    }
                  : {}),
                ...(updates.color !== undefined
                  ? { color: updates.color ? String(updates.color) : null }
                  : {}),
                ...(updates.withReview !== undefined
                  ? { withReview: Boolean(updates.withReview) }
                  : {}),
              };
            }
            return stage;
          })
        );
        markDirty();
      }

      // Handle removeStage
      if (data.action === 'remove_stage' && data.stageIndex !== undefined) {
        setLocalStages((prevStages) => {
          const updated = prevStages.filter((_, idx) => idx !== data.stageIndex);
          return updated.map((s, i) => ({ ...s, order: i }));
        });
        markDirty();
      }

      // Handle createMiniPrompt and modifyMiniPrompt
      if (data.miniPrompt) {
        console.log('Mini-prompt operation:', data);
      }
    });

    setExecutionPlan(null);
    setShowExecutionPlan(false);
  }, [
    executionPlan,
    localStages,
    setLocalStages,
    setWorkflowName,
    setComplexity,
    setIncludeMultiAgentChat,
    markDirty,
  ]);

  return {
    executionPlan,
    showExecutionPlan,
    setShowExecutionPlan,
    handleToolCall,
    handleApproveExecutionPlan,
  };
}
