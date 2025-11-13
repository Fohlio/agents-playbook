'use client';

import { useDrop } from 'react-dnd';
import { cn } from '@/shared/lib/utils/cn';
import type { WorkflowStageWithMiniPrompts, AutoPromptMetadata } from '@/lib/types/workflow-constructor-types';
import { MiniPromptCard } from './MiniPromptCard';
import { AutoPromptCard } from './AutoPromptCard';
import { Tooltip } from '@/shared/ui/molecules';

interface StageDropZoneProps {
  stage: WorkflowStageWithMiniPrompts;
  onRemoveMiniPrompt: (miniPromptId: string) => void;
  onDropMiniPrompts: (stageId: string, miniPromptIds: string[]) => void;
  onMiniPromptClick?: (miniPrompt: { id: string; name: string; description?: string | null; content: string }) => void;
  includeMultiAgentChat?: boolean;
}

export function StageDropZone({
  stage,
  onRemoveMiniPrompt,
  onDropMiniPrompts,
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
        <div className="space-y-2">
          {stage.miniPrompts.map((stageMiniPrompt) => (
            <div key={stageMiniPrompt.miniPromptId}>
              <div className="relative group">
                <MiniPromptCard 
                  miniPrompt={stageMiniPrompt.miniPrompt}
                  onClick={onMiniPromptClick ? () => onMiniPromptClick({
                    id: stageMiniPrompt.miniPrompt.id,
                    name: stageMiniPrompt.miniPrompt.name,
                    description: stageMiniPrompt.miniPrompt.description,
                    content: stageMiniPrompt.miniPrompt.content,
                  }) : undefined}
                />
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
