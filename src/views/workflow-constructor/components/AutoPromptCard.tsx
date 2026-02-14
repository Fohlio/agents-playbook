'use client';

import { Card } from '@/shared/ui/atoms/Card';
import { cn } from '@/shared/lib/utils/cn';
import type { AutoPromptMetadata } from '@/shared/lib/types/workflow-constructor-types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AutoPromptCardProps {
  autoPrompt: AutoPromptMetadata;
  className?: string;
  isDraggable?: boolean;
}

/**
 * AutoPromptCard displays an automatic mini-prompt that is auto-attached based on workflow/stage settings.
 * Can be dragged to reorder within a stage.
 */
export function AutoPromptCard({ autoPrompt, className, isDraggable = false }: AutoPromptCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: autoPrompt.id,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const icon = autoPrompt.type === 'memory-board' ? '📋' : '🤖';
  const badgeText = autoPrompt.type === 'memory-board' ? 'Review' : 'Auto';
  const isMemoryBoard = autoPrompt.type === 'memory-board';
  const tooltipText =
    isMemoryBoard
      ? 'Memory Board: Auto-attached when "With Review" is enabled. Provides handoff context between stages.'
      : 'Multi-Agent Chat: Auto-attached when "Include Multi-Agent Chat" is enabled. Facilitates coordination between agents.';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isDraggable ? { ...attributes, ...listeners } : {})}
      className={cn(
        isDraggable && 'cursor-grab active:cursor-grabbing',
        'touch-none' // Prevent touch scrolling on mobile
      )}
      title={tooltipText}
    >
      <Card
        className={cn(
          'p-3 border-2 border-dashed relative bg-[#0a0a0f]/80',
          isMemoryBoard ? 'border-cyan-500/35' : 'border-pink-500/35',
          isDraggable && !isDragging && (isMemoryBoard
            ? 'hover:border-cyan-400/60 hover:shadow-[0_0_15px_rgba(0,255,255,0.12)]'
            : 'hover:border-pink-400/60 hover:shadow-[0_0_15px_rgba(255,0,102,0.12)]'),
          isDragging && 'shadow-[0_0_20px_rgba(0,255,255,0.3)] border-cyan-400/80',
          className
        )}
        testId={`auto-prompt-${autoPrompt.id}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-label={autoPrompt.type}>
            {icon}
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn('text-sm font-medium', isMemoryBoard ? 'text-cyan-300' : 'text-pink-300')}>
                {autoPrompt.name}
              </h4>
              <span className={cn(
                'px-2 py-0.5 text-xs font-medium rounded border',
                isMemoryBoard
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                  : 'bg-pink-500/15 text-pink-300 border-pink-500/30'
              )}>
                {badgeText}
              </span>
            </div>
            <p className={cn('text-xs', isMemoryBoard ? 'text-cyan-100/65' : 'text-cyan-100/55')}>
              {autoPrompt.type === 'memory-board'
                ? 'Handoff memory board for stage review'
                : 'Internal agents coordination chat'}
            </p>
          </div>
          {isDraggable ? (
            <div className="text-cyan-400/60 select-none" title="Drag to reorder">
              ⋮⋮
            </div>
          ) : (
            <div className="text-cyan-400/60" title="Auto-attached">
              🔒
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
