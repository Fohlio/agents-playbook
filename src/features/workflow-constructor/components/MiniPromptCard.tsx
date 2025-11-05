'use client';

import { useDrag } from 'react-dnd';
import { Card } from '@/shared/ui/atoms/Card';
import { cn } from '@/shared/lib/utils/cn';
import type { MiniPrompt } from '@prisma/client';

interface MiniPromptCardProps {
  miniPrompt: MiniPrompt;
}

export function MiniPromptCard({ miniPrompt }: MiniPromptCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'MINI_PROMPT',
    item: () => {
      return { 
        miniPromptIds: [miniPrompt.id],
        type: 'MINI_PROMPT'
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [miniPrompt.id]);

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
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
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium text-text-primary flex-1">
            {miniPrompt.name}
          </h4>
        </div>
      </Card>
    </div>
  );
}
