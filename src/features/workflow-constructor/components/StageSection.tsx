'use client';

import { Card } from '@/shared/ui/atoms/Card';
import Button from '@/shared/ui/atoms/Button';
import type { WorkflowStageWithMiniPrompts } from '@/lib/types/workflow-constructor-types';
import { StageDropZone } from './StageDropZone';

interface StageSectionProps {
  stage: WorkflowStageWithMiniPrompts;
  onRemoveStage: (stageId: string) => void;
  onRemoveMiniPrompt: (stageId: string, miniPromptId: string) => void;
}

export function StageSection({
  stage,
  onRemoveStage,
  onRemoveMiniPrompt,
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
        <Button
          variant="danger"
          size="sm"
          onClick={() => onRemoveStage(stage.id)}
          testId={`remove-stage-${stage.id}`}
        >
          Remove Stage
        </Button>
      </div>

      <StageDropZone
        stage={stage}
        onRemoveMiniPrompt={(miniPromptId) =>
          onRemoveMiniPrompt(stage.id, miniPromptId)
        }
      />
    </Card>
  );
}
