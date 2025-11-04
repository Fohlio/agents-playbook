'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/shared/lib/utils/cn';
import type { WorkflowStageWithMiniPrompts, AutoPromptMetadata } from '@/lib/types/workflow-constructor-types';
import { MiniPromptCard } from './MiniPromptCard';
import { AutoPromptCard } from './AutoPromptCard';
import { Tooltip } from '@/shared/ui/molecules';
import EditIcon from '@mui/icons-material/Edit';

interface StageDropZoneProps {
  stage: WorkflowStageWithMiniPrompts;
  onRemoveMiniPrompt: (miniPromptId: string) => void;
  onEditMiniPrompt?: (miniPromptId: string) => void;
  includeMultiAgentChat?: boolean;
}

export function StageDropZone({
  stage,
  onRemoveMiniPrompt,
  onEditMiniPrompt,
  includeMultiAgentChat = false
}: StageDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: stage.id,
    data: {
      type: 'stage',
      stageId: stage.id,
    },
  });

  const isEmpty = stage.miniPrompts.length === 0;

  // Memory Board auto-prompt (if withReview is true)
  const memoryBoardPrompt: AutoPromptMetadata | null = stage.withReview
    ? {
        id: `memory-board-${stage.id}`,
        name: 'Handoff Memory Board',
        type: 'memory-board',
        isAutoAttached: true,
        position: 'stage-end',
      }
    : null;

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
            <div key={stageMiniPrompt.miniPromptId}>
              <div className="relative group">
                <MiniPromptCard miniPrompt={stageMiniPrompt.miniPrompt} />
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEditMiniPrompt && (
                    <Tooltip content="Edit this mini-prompt">
                      <button
                        onClick={() => onEditMiniPrompt(stageMiniPrompt.miniPromptId)}
                        className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-600"
                        aria-label="Edit mini-prompt"
                      >
                        <EditIcon sx={{ fontSize: 14 }} />
                      </button>
                    </Tooltip>
                  )}
                  <Tooltip content="Remove this mini-prompt from the stage">
                    <button
                      onClick={() => onRemoveMiniPrompt(stageMiniPrompt.miniPromptId)}
                      className="bg-surface-error text-text-error rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 hover:text-white"
                      aria-label="Remove mini-prompt"
                    >
                      ×
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Internal Agents Chat auto-prompt after each mini-prompt */}
              {includeMultiAgentChat && (
                <AutoPromptCard
                  autoPrompt={{
                    id: `multi-agent-chat-${stageMiniPrompt.miniPromptId}`,
                    name: 'Internal Agents Chat',
                    type: 'multi-agent-chat',
                    isAutoAttached: true,
                    position: 'after-mini-prompt',
                  }}
                  className="mt-2"
                />
              )}
            </div>
          ))}

          {/* Memory Board at end of stage */}
          {memoryBoardPrompt && (
            <AutoPromptCard
              autoPrompt={memoryBoardPrompt}
              className="mt-2"
            />
          )}
        </div>
      )}
    </div>
  );
}
