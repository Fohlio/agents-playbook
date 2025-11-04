'use client';

import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/shared/ui/atoms/Card';
import { cn } from '@/shared/lib/utils/cn';
import type { MiniPrompt } from '@prisma/client';
import EditIcon from '@mui/icons-material/Edit';

interface MiniPromptCardProps {
  miniPrompt: MiniPrompt;
  isDragging?: boolean;
  onEdit?: (miniPrompt: MiniPrompt) => void;
}

export function MiniPromptCard({ miniPrompt, isDragging = false, onEdit }: MiniPromptCardProps) {
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

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(miniPrompt);
  };

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
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium text-text-primary flex-1">
            {miniPrompt.name}
          </h4>
          {onEdit && (
            <button
              onClick={handleEditClick}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label={`Edit ${miniPrompt.name}`}
              title="Edit mini-prompt"
            >
              <EditIcon className="text-gray-500 hover:text-blue-600" sx={{ fontSize: 16 }} />
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}
