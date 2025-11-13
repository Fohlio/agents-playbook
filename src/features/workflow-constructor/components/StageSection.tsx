'use client';

import { Card } from '@/shared/ui/atoms/Card';
import Button from '@/shared/ui/atoms/Button';
import { BetaBadge } from '@/shared/ui/atoms';
import type { WorkflowStageWithMiniPrompts } from '@/lib/types/workflow-constructor-types';
import { StageDropZone } from './StageDropZone';
import { Tooltip } from '@/shared/ui/molecules';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface StageSectionProps {
  stage: WorkflowStageWithMiniPrompts;
  onRemoveStage: (stageId: string) => void;
  onRemoveMiniPrompt: (stageId: string, miniPromptId: string) => void;
  onDropMiniPrompts: (stageId: string, miniPromptIds: string[]) => void;
  onEditStage?: (stageId: string) => void;
  onToggleWithReview?: (stageId: string, withReview: boolean) => void;
  onMiniPromptClick?: (miniPrompt: { id: string; name: string; description?: string | null; content: string }) => void;
  includeMultiAgentChat?: boolean;
}

export function StageSection({
  stage,
  onRemoveStage,
  onRemoveMiniPrompt,
  onDropMiniPrompts,
  onEditStage,
  onToggleWithReview,
  onMiniPromptClick,
  includeMultiAgentChat = false,
}: StageSectionProps) {
  return (
    <Card className="mb-4" testId={`stage-section-${stage.id}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: stage.color ?? '#64748b' }}
          />
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {stage.name}
            </h3>
            {stage.description && (
              <p className="text-sm text-text-secondary">{stage.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onToggleWithReview && (
            <Tooltip content="When enabled, adds a Memory Board review prompt at the end of this stage for handoff context">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stage.withReview}
                  onChange={(e) => onToggleWithReview(stage.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-text-primary">
                  With Review
                </span>
                <BetaBadge size="sm" />
              </label>
            </Tooltip>
          )}
          {onEditStage && (
            <Tooltip content="Edit stage details">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEditStage(stage.id)}
                testId={`edit-stage-${stage.id}`}
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </Button>
            </Tooltip>
          )}
          <Tooltip content="Remove this stage">
            <Button
              variant="danger"
              size="sm"
              onClick={() => onRemoveStage(stage.id)}
              testId={`remove-stage-${stage.id}`}
            >
              <DeleteIcon sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
        </div>
      </div>

      <StageDropZone
        stage={stage}
        onRemoveMiniPrompt={(miniPromptId) =>
          onRemoveMiniPrompt(stage.id, miniPromptId)
        }
        onDropMiniPrompts={onDropMiniPrompts}
        onMiniPromptClick={onMiniPromptClick}
        includeMultiAgentChat={includeMultiAgentChat}
      />
    </Card>
  );
}
