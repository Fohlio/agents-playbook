'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useDrop } from 'react-dnd';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensors, useSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/shared/lib/utils/cn';
import type { WorkflowStageWithMiniPrompts, AutoPromptMetadata } from '@/shared/lib/types/workflow-constructor-types';
import { AutoPromptCard } from './AutoPromptCard';
import { arrayMove } from '@dnd-kit/sortable';
import { useStageItemOrder } from '../hooks/use-stage-item-order';
import { jsonValueToStringArray } from '@/shared/lib/utils/prisma-json';

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

// Sortable wrapper for MiniPromptCard - Cyberpunk Style
function SortableMiniPromptCard({
  stageMiniPrompt,
  onRemove,
  onClick,
  removeTooltip,
}: {
  stageMiniPrompt: WorkflowStageWithMiniPrompts['miniPrompts'][0];
  onRemove: () => void;
  onClick?: () => void;
  removeTooltip: string;
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
        if (isDragging) return;
        if ((e.target as HTMLElement).closest('button')) return;
        onClick?.();
      }}
    >
      <div
        className={cn(
          'p-2 sm:p-3 bg-[#0a0a0f]/80 border border-pink-500/30 hover:border-pink-400/50 hover:shadow-[0_0_15px_rgba(255,0,102,0.1)] transition-all min-h-[44px]',
          isDragging && 'shadow-[0_0_20px_rgba(0,255,255,0.3)] border-cyan-400'
        )}
        style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
        data-testid={`mini-prompt-${stageMiniPrompt.miniPrompt.id}`}
      >
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs sm:text-sm font-mono text-pink-400 flex-1 truncate">
            {stageMiniPrompt.miniPrompt.name}
          </h4>
        </div>
      </div>
      <div className="absolute top-1 right-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="bg-pink-500 text-white w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-pink-400 cursor-pointer"
          style={{ clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))' }}
          aria-label="Remove mini-prompt"
          title={removeTooltip}
        >
          x
        </button>
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
  const t = useTranslations('stageDropZone');

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

  const { itemIds: itemIdsRaw } = useStageItemOrder({
    stage,
    includeMultiAgentChat,
  });
  const itemIds: string[] = itemIdsRaw.filter((id): id is string => typeof id === 'string');

  const itemsMap = useMemo(() => {
    const map = new Map<string, StageItem>();
    
    stage.miniPrompts.forEach((stageMiniPrompt: typeof stage.miniPrompts[0]) => {
      map.set(stageMiniPrompt.miniPromptId, {
        type: 'mini-prompt',
        id: stageMiniPrompt.miniPromptId,
        stageMiniPrompt,
      });
    });

    const storedItemOrder = jsonValueToStringArray(stage.itemOrder);
    const storedIds = new Set(
      storedItemOrder?.filter((id) => {
        if (id.startsWith('multi-agent-chat-')) {
          return id === `multi-agent-chat-${stage.id}`;
        }
        if (id.startsWith('memory-board-')) {
          return id === `memory-board-${stage.id}`;
        }
        return true;
      }) || []
    );

    const multiAgentChatId = `multi-agent-chat-${stage.id}`;
    const shouldIncludeMultiAgentChat = includeMultiAgentChat || storedIds.has(multiAgentChatId);
    if (shouldIncludeMultiAgentChat) {
      map.set(multiAgentChatId, {
        type: 'auto-prompt',
        id: multiAgentChatId,
        autoPrompt: {
          id: multiAgentChatId,
          name: t('internalAgentsChat'),
          type: 'multi-agent-chat',
          isAutoAttached: true,
          position: 'stage-end',
        },
      });
    }

    const memoryBoardId = `memory-board-${stage.id}`;
    if (stage.withReview || storedIds.has(memoryBoardId)) {
      map.set(memoryBoardId, {
        type: 'auto-prompt',
        id: memoryBoardId,
        autoPrompt: {
          id: memoryBoardId,
          name: t('handoffMemoryBoard'),
          type: 'memory-board',
          isAutoAttached: true,
          position: 'stage-end',
        },
      });
    }
    
    return map;
  }, [stage, includeMultiAgentChat, t]);

  const items: StageItem[] = itemIds.map(id => itemsMap.get(id)!).filter(Boolean);

  const isEmpty = items.length === 0;

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !onReorderItems) return;

    const oldIndex = itemIds.indexOf(active.id as string);
    const newIndex = itemIds.indexOf(over.id as string);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reorderedIds = arrayMove(itemIds, oldIndex, newIndex);
    onReorderItems(stage.id, reorderedIds);
  }, [stage.id, itemIds, onReorderItems]);

  return (
    <div
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={cn(
        'min-h-32 border-2 border-dashed p-3 transition-colors',
        isOver
          ? 'border-cyan-400 bg-cyan-500/10 shadow-[0_0_20px_rgba(0,255,255,0.2)]'
          : 'border-cyan-500/20 bg-[#050508]/50',
        isEmpty && 'flex items-center justify-center'
      )}
      data-testid={`stage-drop-zone-${stage.id}`}
    >
      {isEmpty ? (
        <p className="text-sm text-cyan-100/40 font-mono uppercase">
          {t('dropPrompts')}
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
                      removeTooltip={t('removeTooltip')}
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
