'use client';

import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/shared/ui/atoms/Card';
import { cn } from '@/shared/lib/utils/cn';
import type { MiniPrompt } from '@prisma/client';

interface MiniPromptCardProps {
  miniPrompt: MiniPrompt;
  isDragging?: boolean;
}

export function MiniPromptCard({ miniPrompt, isDragging = false }: MiniPromptCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: miniPrompt.id,
    data: {
      type: 'mini-prompt',
      miniPromptId: miniPrompt.id,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-opacity',
        isDragging && 'opacity-50'
      )}
    >
      <Card
        className={cn(
          'p-3 !bg-white border border-border-base hover:shadow-md hover:border-border-hover transition-all',
          isDragging && 'shadow-lg !border-accent-primary'
        )}
        testId={`mini-prompt-${miniPrompt.id}`}
      >
        <h4 className="text-sm font-medium text-text-primary">
          {miniPrompt.name}
        </h4>
      </Card>
    </div>
  );
}
