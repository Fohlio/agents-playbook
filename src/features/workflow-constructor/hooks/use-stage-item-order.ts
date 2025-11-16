import { useMemo } from 'react';
import type { WorkflowStageWithMiniPrompts } from '@/lib/types/workflow-constructor-types';
import { jsonValueToStringArray } from '@/lib/utils/prisma-json';

interface UseStageItemOrderParams {
  stage: WorkflowStageWithMiniPrompts;
  includeMultiAgentChat: boolean;
}

/**
 * Hook to compute and manage the order of items (mini-prompts + automatic prompts) in a stage.
 * Handles building default order when itemOrder is not set, and merging new items when itemOrder exists.
 */
export function useStageItemOrder({ stage, includeMultiAgentChat }: UseStageItemOrderParams) {
  // Build map of all available items (mini-prompts + automatic prompts)
  const itemsMap = useMemo(() => {
    const map = new Map<string, { type: 'mini-prompt' | 'auto-prompt'; id: string }>();
    
    // Add all mini-prompts to map
    stage.miniPrompts.forEach((stageMiniPrompt) => {
      map.set(stageMiniPrompt.miniPromptId, {
        type: 'mini-prompt',
        id: stageMiniPrompt.miniPromptId,
      });
    });

    // Check stored itemOrder to see if auto-prompts are already there
    const stageItemOrder = jsonValueToStringArray(stage.itemOrder);
    const multiAgentChatId = `multi-agent-chat-${stage.id}`;
    const memoryBoardId = `memory-board-${stage.id}`;
    
    // Normalize stored IDs: if any auto-prompt ID has an old stage ID, treat it as if it's for current stage
    // This handles cases where stage IDs changed (e.g., after saveWorkflow deletes/recreates stages)
    const hasMultiAgentChatInOrder = stageItemOrder?.some((id) => 
      typeof id === 'string' && id.startsWith('multi-agent-chat-')
    ) ?? false;
    const hasMemoryBoardInOrder = stageItemOrder?.some((id) => 
      typeof id === 'string' && id.startsWith('memory-board-')
    ) ?? false;
    
    // Add multi-agent chat auto-prompt if enabled OR if it's in the stored order (normalized check)
    // This ensures items in stored order are preserved even if settings changed or stage ID changed
    if (includeMultiAgentChat || hasMultiAgentChatInOrder) {
      map.set(multiAgentChatId, {
        type: 'auto-prompt',
        id: multiAgentChatId,
      });
    }

    // Add memory board if enabled OR if it's in the stored order (normalized check)
    if (stage.withReview || hasMemoryBoardInOrder) {
      map.set(memoryBoardId, {
        type: 'auto-prompt',
        id: memoryBoardId,
      });
    }
    
    return map;
  }, [stage.miniPrompts, stage.withReview, stage.id, stage.itemOrder, includeMultiAgentChat]);

  // Compute itemIds based on stored order or build default order
  const itemIds = useMemo(() => {
    const stageItemOrder = jsonValueToStringArray(stage.itemOrder);
    if (stageItemOrder && stageItemOrder.length > 0) {
      const multiAgentChatId = `multi-agent-chat-${stage.id}`;
      const memoryBoardId = `memory-board-${stage.id}`;
      
      // CRITICAL: Normalize auto-prompt IDs to use current stage ID
      // This handles cases where stage IDs changed (e.g., after saveWorkflow deletes/recreates stages)
      // We preserve the order but update the stage ID in auto-prompt IDs
      const normalizedOrder = stageItemOrder.map((id): string => {
        if (typeof id !== 'string') return id;
        
        // If it's a multi-agent chat ID with an old stage ID, normalize it to current stage ID
        if (id.startsWith('multi-agent-chat-')) {
          return multiAgentChatId;
        }
        
        // If it's a memory board ID with an old stage ID, normalize it to current stage ID
        if (id.startsWith('memory-board-')) {
          return memoryBoardId;
        }
        
        // For mini-prompts, keep as-is
        return id;
      });
      
      // CRITICAL: Preserve exact order from normalized itemOrder
      // Filter out items that no longer exist (not in itemsMap), but keep relative order
      const filtered = normalizedOrder.filter((id): id is string => {
        if (typeof id !== 'string') return false;
        
        // For auto-prompts, check if they're in itemsMap (they should be if enabled or in stored order)
        if (id.startsWith('multi-agent-chat-')) {
          return itemsMap.has(id);
        }
        
        if (id.startsWith('memory-board-')) {
          return itemsMap.has(id);
        }
        
        // For mini-prompts, only include if they exist in itemsMap
        return itemsMap.has(id);
      });
      
      // Track which items are already in the FILTERED order (after filtering)
      // This is important - we check the filtered array, not the original, to avoid re-adding items
      const itemsInFilteredOrder = new Set(filtered);
      
      // Find items that exist but aren't in the filtered order (new items)
      const newMiniPromptIds: string[] = [];
      stage.miniPrompts.forEach((smp) => {
        const id = smp.miniPromptId;
        if (!itemsInFilteredOrder.has(id) && itemsMap.has(id)) {
          newMiniPromptIds.push(id);
        }
      });
      
      // Check if auto-prompts are missing from FILTERED order (not original)
      // Only add them if they're not already in the filtered array
      const needsMultiAgentChat = includeMultiAgentChat && itemsMap.has(multiAgentChatId) && !itemsInFilteredOrder.has(multiAgentChatId);
      const needsMemoryBoard = stage.withReview && itemsMap.has(memoryBoardId) && !itemsInFilteredOrder.has(memoryBoardId);
      
      // Only modify the order if we have new items to add
      // Otherwise, return the filtered stored order as-is to preserve exact positions
      if (newMiniPromptIds.length > 0 || needsMultiAgentChat || needsMemoryBoard) {
        // Find the position of memory board in the filtered array (if it exists)
        const memoryBoardIndex = filtered.indexOf(memoryBoardId);
        
        // Insert new mini-prompts before memory board (if it exists), otherwise at the end
        if (memoryBoardIndex >= 0) {
          filtered.splice(memoryBoardIndex, 0, ...newMiniPromptIds);
          // Insert multi-agent chat before memory board if needed
          if (needsMultiAgentChat) {
            const newMemoryBoardIndex = filtered.indexOf(memoryBoardId);
            filtered.splice(newMemoryBoardIndex, 0, multiAgentChatId);
          }
        } else {
          // No memory board, add new items at the end
          filtered.push(...newMiniPromptIds);
          if (needsMultiAgentChat) {
            filtered.push(multiAgentChatId);
          }
          if (needsMemoryBoard) {
            filtered.push(memoryBoardId);
          }
        }
      }
      
      // Return the filtered order - this preserves the exact positions from the stored order
      return filtered;
    } else {
      // Build default order: all mini-prompts, then multi-agent-chat (if enabled, one per stage), then memory-board
      // Sort mini-prompts by their order field to respect database order
      const sortedMiniPrompts = [...stage.miniPrompts].sort((a, b) => a.order - b.order);
      const result: string[] = [];
      
      // Add all mini-prompts
      sortedMiniPrompts.forEach((stageMiniPrompt) => {
        result.push(stageMiniPrompt.miniPromptId);
      });
      
      // Add multi-agent chat (one per stage) after all mini-prompts if enabled
      if (includeMultiAgentChat) {
        result.push(`multi-agent-chat-${stage.id}`);
      }
      
      // Add memory board at end if enabled
      if (stage.withReview) {
        result.push(`memory-board-${stage.id}`);
      }
      
      return result;
    }
  }, [stage.itemOrder, stage.miniPrompts, stage.withReview, stage.id, includeMultiAgentChat, itemsMap]);

  return {
    itemIds,
    itemsMap,
  };
}

