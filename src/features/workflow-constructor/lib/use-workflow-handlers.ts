import { useCallback } from 'react';
import { useWorkflowConstructorStore } from './workflow-constructor-store';
import type { MiniPrompt } from '@prisma/client';

/**
 * Custom hook for workflow constructor handlers
 * Provides all event handlers for workflow operations
 */
export function useWorkflowHandlers() {
  const {
    localStages,
    setLocalStages,
    setIsCreatingStage,
    setEditingStageId,
    setViewingMiniPromptId,
    setIsChatOpen,
    markDirty,
  } = useWorkflowConstructorStore();

  const handleCreateStage = useCallback(
    (name: string, description: string, color: string, withReview: boolean) => {
      const newStage = {
        id: `temp-${Date.now()}`,
        workflowId: '',
        name: name.trim(),
        description: description.trim() || null,
        color,
        order: localStages.length,
        withReview,
        createdAt: new Date(),
        miniPrompts: [],
      };
      setLocalStages([...localStages, newStage]);
      setIsCreatingStage(false);
      markDirty();
    },
    [localStages, setLocalStages, setIsCreatingStage, markDirty]
  );

  const handleRemoveStage = useCallback(
    (stageId: string) => {
      setLocalStages(localStages.filter((s) => s.id !== stageId));
      markDirty();
    },
    [localStages, setLocalStages, markDirty]
  );

  const handleRemoveMiniPrompt = useCallback(
    (stageId: string, miniPromptId: string) => {
      setLocalStages(
        localStages.map((stage) => {
          if (stage.id === stageId) {
            return {
              ...stage,
              miniPrompts: stage.miniPrompts.filter(
                (smp) => smp.miniPromptId !== miniPromptId
              ),
            };
          }
          return stage;
        })
      );
      markDirty();
    },
    [localStages, setLocalStages, markDirty]
  );

  const handleEditMiniPrompt = useCallback(
    (miniPromptId: string) => {
      setViewingMiniPromptId(miniPromptId);
      setIsChatOpen(true);
    },
    [setViewingMiniPromptId, setIsChatOpen]
  );

  const handleToggleWithReview = useCallback(
    (stageId: string, withReview: boolean) => {
      setLocalStages(
        localStages.map((stage) => {
          if (stage.id === stageId) {
            return {
              ...stage,
              withReview,
            };
          }
          return stage;
        })
      );
      markDirty();
    },
    [localStages, setLocalStages, markDirty]
  );

  const handleEditStage = useCallback(
    (stageId: string) => {
      setEditingStageId(stageId);
      setIsCreatingStage(false);
    },
    [setEditingStageId, setIsCreatingStage]
  );

  const handleUpdateStage = useCallback(
    (name: string, description: string, color: string, withReview: boolean) => {
      const editingStageId = useWorkflowConstructorStore.getState().editingStageId;
      if (!editingStageId) return;

      setLocalStages(
        localStages.map((s) => {
          if (s.id === editingStageId) {
            return {
              ...s,
              name: name.trim(),
              description: description.trim() || null,
              color,
              withReview,
            };
          }
          return s;
        })
      );
      setEditingStageId(null);
      markDirty();
    },
    [localStages, setLocalStages, setEditingStageId, markDirty]
  );

  const handleDragEnd = useCallback(
    (miniPromptId: string, stageId: string, miniPrompts: MiniPrompt[]) => {
      const stage = localStages.find((s) => s.id === stageId);
      if (!stage) return;

      const alreadyExists = stage.miniPrompts.some(
        (smp) => smp.miniPromptId === miniPromptId
      );
      if (alreadyExists) return;

      const miniPrompt = miniPrompts.find((mp) => mp.id === miniPromptId);
      if (!miniPrompt) return;

      setLocalStages(
        localStages.map((s) => {
          if (s.id === stageId) {
            return {
              ...s,
              miniPrompts: [
                ...s.miniPrompts,
                {
                  stageId: s.id,
                  miniPromptId: miniPrompt.id,
                  order: s.miniPrompts.length,
                  miniPrompt,
                },
              ],
            };
          }
          return s;
        })
      );
      markDirty();
    },
    [localStages, setLocalStages, markDirty]
  );

  return {
    handleCreateStage,
    handleRemoveStage,
    handleRemoveMiniPrompt,
    handleEditMiniPrompt,
    handleToggleWithReview,
    handleEditStage,
    handleUpdateStage,
    handleDragEnd,
  };
}
