'use client';

import { useDrag } from 'react-dnd';
import { cn } from '@/shared/lib/utils/cn';
import type { MiniPrompt } from '@prisma/client';

interface MiniPromptCardProps {
  miniPrompt: MiniPrompt;
  onClick?: (miniPrompt: MiniPrompt) => void;
}

export function MiniPromptCard({ miniPrompt, onClick }: MiniPromptCardProps) {
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

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger onClick if dragging
    if (isDragging) return;
    // Don't trigger if clicking on a button or interactive element
    if ((e.target as HTMLElement).closest('button')) return;
    onClick?.(miniPrompt);
  };

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={cn(
        'cursor-grab active:cursor-grabbing transition-all touch-manipulation',
        isDragging && 'opacity-50',
        onClick && !isDragging && 'cursor-pointer'
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          'p-2 sm:p-3 bg-[#0a0a0f]/80 border border-pink-500/30 hover:border-pink-400/50 hover:shadow-[0_0_15px_rgba(255,0,102,0.1)] transition-all min-h-[44px]',
          isDragging && 'shadow-[0_0_20px_rgba(0,255,255,0.3)] border-cyan-400'
        )}
        style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
        data-testid={`mini-prompt-${miniPrompt.id}`}
      >
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs sm:text-sm font-mono text-pink-400 flex-1 truncate">
            {miniPrompt.name}
          </h4>
        </div>
      </div>
    </div>
  );
}
