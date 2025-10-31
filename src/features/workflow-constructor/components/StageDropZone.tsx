'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/shared/lib/utils/cn';
import type { WorkflowStageWithMiniPrompts } from '@/lib/types/workflow-constructor-types';
import { MiniPromptCard } from './MiniPromptCard';
import { Tooltip } from '@/shared/ui/molecules';

interface StageDropZoneProps {
  stage: WorkflowStageWithMiniPrompts;
  onRemoveMiniPrompt: (miniPromptId: string) => void;
}

export function StageDropZone({ stage, onRemoveMiniPrompt }: StageDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: stage.id,
    data: {
      type: 'stage',
      stageId: stage.id,
    },
  });

  const isEmpty = stage.miniPrompts.length === 0;

  return (
    <div
      ref={setNodeRef}
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
        <div className="space-y-2">
          {stage.miniPrompts.map((stageMiniPrompt) => (
            <div
              key={stageMiniPrompt.miniPromptId}
              className="relative group"
            >
              <MiniPromptCard miniPrompt={stageMiniPrompt.miniPrompt} />
              <Tooltip content="Remove this mini-prompt from the stage">
                <button
                  onClick={() => onRemoveMiniPrompt(stageMiniPrompt.miniPromptId)}
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-error text-text-error rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 hover:text-white"
                  aria-label="Remove mini-prompt"
                >
                  ×
                </button>
              </Tooltip>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
