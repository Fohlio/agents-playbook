import { useCallback } from 'react';
import { useWorkflowConstructorStore } from './workflow-constructor-store';
import type { MiniPrompt } from '@prisma/client';

/**
 * Custom hook for workflow constructor handlers
 * Provides all event handlers for workflow operations
 */
interface UseWorkflowHandlersOptions {
  miniPrompts: MiniPrompt[];
  setMiniPrompts: (miniPrompts: MiniPrompt[] | ((prev: MiniPrompt[]) => MiniPrompt[])) => void;
  onEditMiniPrompt: (miniPrompt: MiniPrompt | null) => void;
  onEditTagIds: (tagIds: string[]) => void;
}

export function useWorkflowHandlers(options?: UseWorkflowHandlersOptions) {
  const {
    localStages,
    setLocalStages,
    setIsCreatingStage,
    setEditingStageId,
    setViewingMiniPromptId,
    setIsChatOpen,
    markDirty,
  } = useWorkflowConstructorStore();

  const { miniPrompts = [], setMiniPrompts, onEditMiniPrompt, onEditTagIds } = options || {};

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
    (miniPromptId: string, stageId: string, miniPromptsList: MiniPrompt[]) => {
      const stage = localStages.find((s) => s.id === stageId);
      if (!stage) return;

      const alreadyExists = stage.miniPrompts.some(
        (smp) => smp.miniPromptId === miniPromptId
      );
      if (alreadyExists) return;

      const miniPrompt = miniPromptsList.find((mp) => mp.id === miniPromptId);
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

  const handleEditMiniPrompt = useCallback(
    async (miniPromptId: string) => {
      if (!onEditMiniPrompt || !onEditTagIds) return;

      // Find the mini prompt in the library
      const miniPrompt = miniPrompts.find((mp) => mp.id === miniPromptId);
      if (!miniPrompt) {
        // Try to fetch it from API if not in library (might be in a stage but not in library)
        try {
          const response = await fetch(`/api/mini-prompts/${miniPromptId}`);
          if (!response.ok) throw new Error('Failed to fetch mini prompt');
          const data = await response.json();
          onEditTagIds(data.tagIds || []);
          onEditMiniPrompt(data);
        } catch (error) {
          console.error('Failed to fetch mini prompt:', error);
          alert('Failed to load mini prompt for editing');
        }
        return;
      }

      // Fetch tags for the mini prompt
      try {
        const response = await fetch(`/api/mini-prompts/${miniPromptId}`);
        if (!response.ok) throw new Error('Failed to fetch mini prompt');
        const data = await response.json();
        onEditTagIds(data.tagIds || []);
        onEditMiniPrompt(miniPrompt);
      } catch (error) {
        console.error('Failed to fetch mini prompt tags:', error);
        onEditTagIds([]);
        onEditMiniPrompt(miniPrompt);
      }
    },
    [miniPrompts, onEditMiniPrompt, onEditTagIds]
  );

  const handleUpdateMiniPrompt = useCallback(
    async (
      editingMiniPrompt: MiniPrompt | null,
      name: string,
      description: string,
      content: string,
      visibility: 'PUBLIC' | 'PRIVATE',
      tagIds: string[]
    ) => {
      if (!editingMiniPrompt || !setMiniPrompts || !onEditMiniPrompt || !onEditTagIds) return;

      // Check if this is a temp mini-prompt (not saved to database yet)
      const isTempMiniPrompt = editingMiniPrompt.id.startsWith('temp-');

      if (isTempMiniPrompt) {
        // For temp mini-prompts, just update locally
        const updated: MiniPrompt = {
          ...editingMiniPrompt,
          name,
          description: description || null,
          content,
          visibility,
          updatedAt: new Date(),
        } as MiniPrompt;

        setMiniPrompts((prev) =>
          prev.map((mp) => (mp.id === updated.id ? updated : mp))
        );

        // Also update mini-prompts in stages
        setLocalStages((prevStages) =>
          prevStages.map((stage) => ({
            ...stage,
            miniPrompts: stage.miniPrompts.map((smp) =>
              smp.miniPromptId === updated.id
                ? { ...smp, miniPrompt: updated }
                : smp
            ),
          }))
        );

        onEditMiniPrompt(null);
        onEditTagIds([]);
        markDirty();
      } else {
        // For saved mini-prompts, update in database
        try {
          const response = await fetch(`/api/mini-prompts/${editingMiniPrompt.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              description,
              content,
              visibility,
              tagIds,
            }),
          });

          if (!response.ok) throw new Error('Failed to update mini prompt');
          const updated = await response.json();

          // Update in library
          setMiniPrompts((prev) =>
            prev.map((mp) => (mp.id === updated.id ? updated : mp))
          );

          // Also update mini-prompts in stages
          setLocalStages((prevStages) =>
            prevStages.map((stage) => ({
              ...stage,
              miniPrompts: stage.miniPrompts.map((smp) =>
                smp.miniPromptId === updated.id
                  ? { ...smp, miniPrompt: updated }
                  : smp
              ),
            }))
          );

          onEditMiniPrompt(null);
          onEditTagIds([]);
          markDirty();
        } catch (error) {
          console.error('Failed to update mini prompt:', error);
          alert('Failed to update mini prompt');
        }
      }
    },
    [setMiniPrompts, setLocalStages, markDirty, onEditMiniPrompt, onEditTagIds]
  );

  return {
    handleCreateStage,
    handleRemoveStage,
    handleRemoveMiniPrompt,
    handleToggleWithReview,
    handleEditStage,
    handleUpdateStage,
    handleDragEnd,
    handleEditMiniPrompt,
    handleUpdateMiniPrompt,
  };
}
