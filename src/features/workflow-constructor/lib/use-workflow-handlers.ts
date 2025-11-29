import { useCallback } from 'react';
import { useWorkflowConstructorStore } from './workflow-constructor-store';
import type { MiniPrompt } from '@prisma/client';
import { jsonValueToStringArray } from '@/lib/utils/prisma-json';
import { createWorkflowStage } from './create-stage';

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
    markDirty,
  } = useWorkflowConstructorStore();

  const { miniPrompts = [], setMiniPrompts, onEditMiniPrompt, onEditTagIds } = options || {};

  const handleCreateStage = useCallback(
    (name: string, description: string, color: string, withReview: boolean, includeMultiAgentChat: boolean = false) => {
      const newStage = createWorkflowStage({
        id: `temp-${Date.now()}`,
        workflowId: '',
        name: name.trim(),
        description: description.trim() || null,
        color,
        order: localStages.length,
        withReview,
        includeMultiAgentChat,
      });
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
            const updatedMiniPrompts = stage.miniPrompts.filter(
              (smp: typeof stage.miniPrompts[0]) => smp.miniPromptId !== miniPromptId
            );
            // Remove the mini-prompt ID from itemOrder
            // Note: Multi-agent chat auto-prompts use format `multi-agent-chat-${stage.id}` (stage-level),
            // so they are not removed when removing a mini-prompt
            const currentItemOrder = jsonValueToStringArray(stage.itemOrder) || [];
            const updatedItemOrder = currentItemOrder.filter(
              (id) => id !== miniPromptId
            );
            return {
              ...stage,
              miniPrompts: updatedMiniPrompts,
              itemOrder: updatedItemOrder,
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
            const memoryBoardId = `memory-board-${stage.id}`;
            let updatedItemOrder = jsonValueToStringArray(stage.itemOrder) || [];
            
            if (withReview) {
              // Add memory board at the end if not already present
              if (!updatedItemOrder.includes(memoryBoardId)) {
                updatedItemOrder = [...updatedItemOrder, memoryBoardId];
              }
            } else {
              // Remove memory board if present
              updatedItemOrder = updatedItemOrder.filter(id => id !== memoryBoardId);
            }
            
            return {
              ...stage,
              withReview,
              itemOrder: updatedItemOrder,
            };
          }
          return stage;
        })
      );
      markDirty();
    },
    [localStages, setLocalStages, markDirty]
  );

  const handleToggleMultiAgentChat = useCallback(
    (stageId: string, includeMultiAgentChat: boolean) => {
      setLocalStages(
        localStages.map((stage) => {
          if (stage.id === stageId) {
            let updatedItemOrder = jsonValueToStringArray(stage.itemOrder) || [];
            const multiAgentChatId = `multi-agent-chat-${stage.id}`;
            
            if (includeMultiAgentChat) {
              // Add multi-agent chat (one per stage) if not already present
              // Insert it after all mini-prompts but before memory-board
              if (!updatedItemOrder.includes(multiAgentChatId)) {
                const memoryBoardId = `memory-board-${stage.id}`;
                const memoryBoardIndex = updatedItemOrder.indexOf(memoryBoardId);
                
                if (memoryBoardIndex >= 0) {
                  // Insert before memory-board
                  updatedItemOrder.splice(memoryBoardIndex, 0, multiAgentChatId);
                } else {
                  // Add at end if no memory-board
                  updatedItemOrder.push(multiAgentChatId);
                }
              }
            } else {
              // Remove the multi-agent chat auto-prompt for this stage
              updatedItemOrder = updatedItemOrder.filter(
                id => id !== multiAgentChatId
              );
            }
            
            return {
              ...stage,
              includeMultiAgentChat,
              itemOrder: updatedItemOrder,
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
    (name: string, description: string, color: string, withReview: boolean, includeMultiAgentChat: boolean = false) => {
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
              includeMultiAgentChat,
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
    (miniPromptIds: string | string[], stageId: string, miniPromptsList: MiniPrompt[]) => {
      // Use functional update to avoid stale closure issues
      setLocalStages((prevStages) => {
        const stage = prevStages.find((s) => s.id === stageId);
        if (!stage) return prevStages;

        // Normalize to array
        const idsToAdd = Array.isArray(miniPromptIds) ? miniPromptIds : [miniPromptIds];
        
        // Filter out any that already exist in the stage
        const newIds = idsToAdd.filter(
          (id: string) => !stage.miniPrompts.some((smp: typeof stage.miniPrompts[0]) => smp.miniPromptId === id)
        );
        
        if (newIds.length === 0) return prevStages;

        // Find all mini-prompts to add
        const miniPromptsToAdd = newIds
          .map((id) => miniPromptsList.find((mp) => mp.id === id))
          .filter((mp): mp is MiniPrompt => mp !== undefined);
        
        if (miniPromptsToAdd.length === 0) return prevStages;

        const startOrder = stage.miniPrompts.length;
        const newMiniPrompts = [
          ...stage.miniPrompts,
          ...miniPromptsToAdd.map((miniPrompt, index) => ({
            stageId: stage.id,
            miniPromptId: miniPrompt.id,
            order: startOrder + index,
            miniPrompt,
          })),
        ];
        
        // Update itemOrder: add new mini-prompts at the end (before memory-board if it exists)
        // Check which items are already in itemOrder to avoid duplicates
        const currentItemOrder = jsonValueToStringArray(stage.itemOrder) || [];
        const itemsInOrder = new Set(currentItemOrder);
        
        const memoryBoardId = `memory-board-${stage.id}`;
        const memoryBoardIndex = currentItemOrder.indexOf(memoryBoardId);
        const itemsBeforeMemoryBoard = memoryBoardIndex >= 0 
          ? currentItemOrder.slice(0, memoryBoardIndex)
          : currentItemOrder;
        const itemsAfterMemoryBoard = memoryBoardIndex >= 0
          ? currentItemOrder.slice(memoryBoardIndex)
          : [];
        
        // Add new mini-prompts before memory-board
        // Only add if they're not already in the order
        const newItemIds: string[] = [];
        miniPromptsToAdd.forEach((mp) => {
          if (!itemsInOrder.has(mp.id)) {
            newItemIds.push(mp.id);
          }
        });
        
        // Build the updated order: items before memory-board + new mini-prompts + multi-agent chat (if needed) + memory-board
        const updatedItemOrder: string[] = [
          ...itemsBeforeMemoryBoard,
          ...newItemIds,
        ];
        
        // Add multi-agent chat (one per stage) if enabled and not already in order
        // Insert it after mini-prompts but before memory-board
        if (stage.includeMultiAgentChat) {
          const multiAgentChatId = `multi-agent-chat-${stage.id}`;
          if (!itemsInOrder.has(multiAgentChatId)) {
            updatedItemOrder.push(multiAgentChatId);
          }
        }
        
        // Add memory-board at the end if it exists in current order
        updatedItemOrder.push(...itemsAfterMemoryBoard);
        
        // If memory-board is not in the order but stage.withReview is true, add it at the end
        if (stage.withReview && !itemsInOrder.has(memoryBoardId)) {
          updatedItemOrder.push(memoryBoardId);
        }
        
        return prevStages.map((s) => {
          if (s.id === stageId) {
            return {
              ...s,
              miniPrompts: newMiniPrompts,
              itemOrder: updatedItemOrder,
            };
          }
          return s;
        });
      });
      markDirty();
    },
    [setLocalStages, markDirty]
  );

  const handleReorderItems = useCallback(
    (stageId: string, itemIds: string[]) => {
      // Use functional update to avoid stale closure issues
      setLocalStages((prevStages) => {
        const stage = prevStages.find((s) => s.id === stageId);
        if (!stage) return prevStages;

        // Filter out automatic prompt IDs (they start with 'memory-board-' or 'multi-agent-chat-')
        const miniPromptIds = itemIds.filter(
          (id) => !id.startsWith('memory-board-') && !id.startsWith('multi-agent-chat-')
        );

        // Reorder mini-prompts based on the new order
        const reorderedMiniPrompts = miniPromptIds
          .map((id: string) => stage.miniPrompts.find((smp: typeof stage.miniPrompts[0]) => smp.miniPromptId === id))
          .filter((smp): smp is typeof stage.miniPrompts[0] => smp !== undefined)
          .map((smp: typeof stage.miniPrompts[0], index: number) => ({
            ...smp,
            order: index,
          }));

        // Update stage with reordered mini-prompts AND store the complete item order (including automatic prompts)
        return prevStages.map((s) => {
          if (s.id === stageId) {
            return {
              ...s,
              miniPrompts: reorderedMiniPrompts,
              itemOrder: itemIds, // Store the complete order including automatic prompts
            };
          }
          return s;
        });
      });
      markDirty();
    },
    [setLocalStages, markDirty]
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
      tagIds: string[],
      newTagNames: string[]
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
            miniPrompts: stage.miniPrompts.map((smp: typeof stage.miniPrompts[0]) =>
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
              newTagNames,
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
    handleToggleMultiAgentChat,
    handleEditStage,
    handleUpdateStage,
    handleDragEnd,
    handleReorderItems,
    handleEditMiniPrompt,
    handleUpdateMiniPrompt,
  };
}
