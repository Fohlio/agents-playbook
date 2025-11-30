import { useCallback } from 'react';
import type { WorkflowComplexity } from '@/shared/lib/types/workflow-constructor-types';
import { useWorkflowConstructorStore } from '../lib/workflow-constructor-store';
import { jsonValueToStringArray } from '@/shared/lib/utils/prisma-json';

interface UseWorkflowActionsParams {
  workflowId?: string;
  currentWorkflowName?: string;
  currentWorkflowDescription?: string | null;
  onSave?: (data: {
    workflowId: string;
    name: string;
    description?: string;
    complexity?: WorkflowComplexity;
    isActive: boolean;
    visibility: 'PUBLIC' | 'PRIVATE';
    includeMultiAgentChat: boolean;
    tagIds: string[];
    modelIds: string[];
    stages: Array<{
      name: string;
      description?: string;
      color?: string;
      order: number;
      withReview: boolean;
      includeMultiAgentChat?: boolean;
      itemOrder?: string[];
      miniPrompts: Array<{
        miniPromptId: string;
        order: number;
      }>;
    }>;
  }) => Promise<void>;
}

export function useWorkflowActions({
  workflowId,
  currentWorkflowName,
  currentWorkflowDescription,
  onSave,
}: UseWorkflowActionsParams) {
  const {
    workflowName,
    workflowDescription,
    complexity,
    isActive,
    isPublic,
    includeMultiAgentChat,
    selectedTagIds,
    selectedModelIds,
    localStages,
    markDirty,
  } = useWorkflowConstructorStore();

  const handleWorkflowNameChange = useCallback((name: string) => {
    const { setWorkflowName } = useWorkflowConstructorStore.getState();
    setWorkflowName(name);
    if (name !== currentWorkflowName) {
      markDirty();
    }
  }, [currentWorkflowName, markDirty]);

  const handleWorkflowDescriptionChange = useCallback((description: string | null) => {
    const { setWorkflowDescription } = useWorkflowConstructorStore.getState();
    setWorkflowDescription(description);
    if (description !== (currentWorkflowDescription || '')) {
      markDirty();
    }
  }, [currentWorkflowDescription, markDirty]);

  const handleIsActiveChange = useCallback((isActive: boolean) => {
    const { setIsActive } = useWorkflowConstructorStore.getState();
    setIsActive(isActive);
    markDirty();
  }, [markDirty]);

  const handleIsPublicChange = useCallback((isPublic: boolean) => {
    const { setIsPublic } = useWorkflowConstructorStore.getState();
    setIsPublic(isPublic);
    markDirty();
  }, [markDirty]);

  const handleIncludeMultiAgentChatChange = useCallback((include: boolean) => {
    const { setIncludeMultiAgentChat } = useWorkflowConstructorStore.getState();
    setIncludeMultiAgentChat(include);
    markDirty();
  }, [markDirty]);

  const handleSelectedTagIdsChange = useCallback((tagIds: string[]) => {
    const { setSelectedTagIds } = useWorkflowConstructorStore.getState();
    setSelectedTagIds(tagIds);
    markDirty();
  }, [markDirty]);

  const handleSelectedModelIdsChange = useCallback((modelIds: string[]) => {
    const { setSelectedModelIds } = useWorkflowConstructorStore.getState();
    setSelectedModelIds(modelIds);
    markDirty();
  }, [markDirty]);

  const handleSaveWorkflow = useCallback(async () => {
    if (!workflowId || !onSave) return;

    await onSave({
      workflowId,
      name: workflowName,
      description: workflowDescription ?? undefined,
      complexity: complexity ?? undefined,
      isActive,
      visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
      includeMultiAgentChat,
      tagIds: selectedTagIds,
      modelIds: selectedModelIds,
      stages: localStages.map((stage, index) => {
        // Clean up itemOrder: filter out auto-prompt IDs that don't match the current stage ID
        // This prevents old stage IDs from being saved
        const stageItemOrder = jsonValueToStringArray(stage.itemOrder);
        const cleanedItemOrder: string[] | undefined = stageItemOrder
          ? stageItemOrder.filter((id: string) => {
              if (id.startsWith('multi-agent-chat-')) {
                return id === `multi-agent-chat-${stage.id}`;
              }
              if (id.startsWith('memory-board-')) {
                return id === `memory-board-${stage.id}`;
              }
              return true; // Keep mini-prompt IDs
            })
          : undefined;

        return {
          name: stage.name,
          description: stage.description ?? undefined,
          color: stage.color ?? undefined,
          order: index,
          withReview: stage.withReview,
          includeMultiAgentChat: stage.includeMultiAgentChat ?? false,
          itemOrder: cleanedItemOrder,
          miniPrompts: stage.miniPrompts.map((smp: typeof stage.miniPrompts[0], mpIndex: number) => ({
            miniPromptId: smp.miniPromptId,
            order: mpIndex,
          })),
        };
      }),
    });
  }, [
    workflowId,
    workflowName,
    workflowDescription,
    complexity,
    isActive,
    isPublic,
    includeMultiAgentChat,
    selectedTagIds,
    selectedModelIds,
    localStages,
    onSave,
  ]);

  return {
    handleWorkflowNameChange,
    handleWorkflowDescriptionChange,
    handleIsActiveChange,
    handleIsPublicChange,
    handleIncludeMultiAgentChatChange,
    handleSelectedTagIdsChange,
    handleSelectedModelIdsChange,
    handleSaveWorkflow,
  };
}

