'use client';

import { useCallback, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensors, useSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/shared/lib/utils/cn';
import type { WorkflowStageWithMiniPrompts, AutoPromptMetadata } from '@/lib/types/workflow-constructor-types';
import { AutoPromptCard } from './AutoPromptCard';
import { Tooltip } from '@/shared/ui/molecules';
import { arrayMove } from '@dnd-kit/sortable';
import { Card } from '@/shared/ui/atoms/Card';
import { useStageItemOrder } from '../hooks/use-stage-item-order';
import { jsonValueToStringArray } from '@/lib/utils/prisma-json';

interface StageDropZoneProps {
  stage: WorkflowStageWithMiniPrompts;
  onRemoveMiniPrompt: (miniPromptId: string) => void;
  onDropMiniPrompts: (stageId: string, miniPromptIds: string[]) => void;
  onReorderItems?: (stageId: string, itemIds: string[]) => void;
  onMiniPromptClick?: (miniPrompt: { id: string; name: string; description?: string | null; content: string }) => void;
  includeMultiAgentChat?: boolean;
}

// Unified item type for sorting
type StageItem = 
  | { type: 'mini-prompt'; id: string; stageMiniPrompt: WorkflowStageWithMiniPrompts['miniPrompts'][0] }
  | { type: 'auto-prompt'; id: string; autoPrompt: AutoPromptMetadata };

// Sortable wrapper for MiniPromptCard
// This wrapper handles reordering within a stage using @dnd-kit
function SortableMiniPromptCard({
  stageMiniPrompt,
  onRemove,
  onClick,
}: {
  stageMiniPrompt: WorkflowStageWithMiniPrompts['miniPrompts'][0];
  onRemove: () => void;
  onClick?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: stageMiniPrompt.miniPromptId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={cn(
        "relative group cursor-grab active:cursor-grabbing touch-manipulation",
        onClick && !isDragging && 'cursor-pointer'
      )}
      onClick={(e) => {
        // Don't trigger onClick if dragging
        if (isDragging) return;
        // Don't trigger if clicking on a button or interactive element
        if ((e.target as HTMLElement).closest('button')) return;
        onClick?.();
      }}
    >
      <div>
        <Card
          className={cn(
            'p-2 sm:p-3 !bg-white border border-border-base hover:shadow-md hover:border-border-hover transition-all min-h-[44px]',
            isDragging && 'shadow-lg !border-accent-primary'
          )}
          testId={`mini-prompt-${stageMiniPrompt.miniPrompt.id}`}
        >
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs sm:text-sm font-medium text-text-primary flex-1 truncate">
              {stageMiniPrompt.miniPrompt.name}
            </h4>
          </div>
        </Card>
      </div>
      <div className="absolute top-1 right-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
        <Tooltip content="Remove this mini-prompt from the stage">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="bg-surface-error text-text-error rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 hover:text-white"
            aria-label="Remove mini-prompt"
          >
            ×
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

export function StageDropZone({
  stage,
  onRemoveMiniPrompt,
  onDropMiniPrompts,
  onReorderItems,
  onMiniPromptClick,
  includeMultiAgentChat = false
}: StageDropZoneProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'MINI_PROMPT',
    drop: (item: { miniPromptIds: string[] }) => {
      onDropMiniPrompts(stage.id, item.miniPromptIds);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [stage.id, onDropMiniPrompts]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Use the hook to compute item order
  const { itemIds: itemIdsRaw } = useStageItemOrder({
    stage,
    includeMultiAgentChat,
  });
  // Ensure itemIds is typed as string[]
  const itemIds: string[] = itemIdsRaw.filter((id): id is string => typeof id === 'string');

  // Build map of all available items (mini-prompts + automatic prompts) with full data
  const itemsMap = useMemo(() => {
    const map = new Map<string, StageItem>();
    
    // Add all mini-prompts to map
    stage.miniPrompts.forEach((stageMiniPrompt: typeof stage.miniPrompts[0]) => {
      map.set(stageMiniPrompt.miniPromptId, {
        type: 'mini-prompt',
        id: stageMiniPrompt.miniPromptId,
        stageMiniPrompt,
      });
    });

    // Check stored itemOrder to see if auto-prompts are already there
    // This ensures items in stored order are preserved even if settings changed
    const storedItemOrder = jsonValueToStringArray(stage.itemOrder);
    // Only check for auto-prompts that match the current stage ID (filter out old IDs)
    const storedIds = new Set(
      storedItemOrder?.filter((id) => {
        if (id.startsWith('multi-agent-chat-')) {
          return id === `multi-agent-chat-${stage.id}`;
        }
        if (id.startsWith('memory-board-')) {
          return id === `memory-board-${stage.id}`;
        }
        return true; // Keep mini-prompt IDs
      }) || []
    );

    // Add multi-agent chat auto-prompt if enabled OR if it's in the stored order (with correct stage ID)
    const multiAgentChatId = `multi-agent-chat-${stage.id}`;
    const shouldIncludeMultiAgentChat = includeMultiAgentChat || storedIds.has(multiAgentChatId);
    if (shouldIncludeMultiAgentChat) {
      map.set(multiAgentChatId, {
        type: 'auto-prompt',
        id: multiAgentChatId,
        autoPrompt: {
          id: multiAgentChatId,
          name: 'Internal Agents Chat',
          type: 'multi-agent-chat',
          isAutoAttached: true,
          position: 'stage-end',
        },
      });
      
    }

    // Add memory board if enabled OR if it's in the stored order
    const memoryBoardId = `memory-board-${stage.id}`;
    if (stage.withReview || storedIds.has(memoryBoardId)) {
      map.set(memoryBoardId, {
        type: 'auto-prompt',
        id: memoryBoardId,
        autoPrompt: {
          id: memoryBoardId,
          name: 'Handoff Memory Board',
          type: 'memory-board',
          isAutoAttached: true,
          position: 'stage-end',
        },
      });
    }
    
    return map;
  }, [stage, stage.itemOrder, includeMultiAgentChat]);

  // Build items array in the correct order
  const items: StageItem[] = itemIds.map(id => itemsMap.get(id)!).filter(Boolean);

  const isEmpty = items.length === 0;

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !onReorderItems) return;

    // Use itemIds directly - it's already computed correctly by useStageItemOrder
    // and matches what's in the SortableContext
    const oldIndex = itemIds.indexOf(active.id as string);
    const newIndex = itemIds.indexOf(over.id as string);

    if (oldIndex === -1 || newIndex === -1) {
      console.warn('[StageDropZone] Drag end: item not found in itemIds', {
        activeId: active.id,
        overId: over.id,
        itemIds,
        activeIdInItemIds: itemIds.includes(active.id as string),
        overIdInItemIds: itemIds.includes(over.id as string),
      });
      return;
    }

    const reorderedIds = arrayMove(itemIds, oldIndex, newIndex);
    onReorderItems(stage.id, reorderedIds);
  }, [stage.id, itemIds, onReorderItems]);

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={cn(
        'min-h-32 rounded-lg border-2 border-dashed p-3 transition-colors',
        isOver
          ? 'border-accent-primary bg-accent-primary/10'
          : 'border-border-base bg-surface-secondary',
        isEmpty && 'flex items-center justify-center'
      )}
      data-testid={`stage-drop-zone-${stage.id}`}
    >
      {isEmpty ? (
        <p className="text-sm text-text-tertiary">
          Drop mini-prompts here
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => {
                if (item.type === 'mini-prompt') {
                  return (
                    <SortableMiniPromptCard
                      key={item.id}
                      stageMiniPrompt={item.stageMiniPrompt}
                      onRemove={() => onRemoveMiniPrompt(item.id)}
                      onClick={onMiniPromptClick ? () => onMiniPromptClick({
                        id: item.stageMiniPrompt.miniPrompt.id,
                        name: item.stageMiniPrompt.miniPrompt.name,
                        description: item.stageMiniPrompt.miniPrompt.description,
                        content: item.stageMiniPrompt.miniPrompt.content,
                      }) : undefined}
                    />
                  );
                } else {
                  return (
                    <AutoPromptCard
                      key={item.id}
                      autoPrompt={item.autoPrompt}
                      isDraggable={true}
                      className="mt-2"
                    />
                  );
                }
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
