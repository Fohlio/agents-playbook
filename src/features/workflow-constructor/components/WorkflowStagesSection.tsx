'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { WorkflowStageWithMiniPrompts } from '@/lib/types/workflow-constructor-types';
import { StageSection } from './StageSection';
import { StageCreateForm } from './StageCreateForm';

interface WorkflowStagesSectionProps {
  stages: WorkflowStageWithMiniPrompts[];
  isCreatingStage: boolean;
  editingStageId: string | null;
  includeMultiAgentChat: boolean;
  onRemoveStage: (stageId: string) => void;
  onRemoveMiniPrompt: (stageId: string, miniPromptId: string) => void;
  onDropMiniPrompts: (stageId: string, miniPromptIds: string[]) => void;
  onEditStage: (stageId: string) => void;
  onUpdateStage: (stageId: string, data: {
    name: string;
    description?: string;
    color?: string;
    withReview: boolean;
  }) => void;
  onToggleWithReview: (stageId: string, withReview: boolean) => void;
  onCreateStage: (data: {
    name: string;
    description?: string;
    color?: string;
    withReview: boolean;
  }) => void;
  onCancelCreateStage: () => void;
  onCancelEditStage: () => void;
  onMiniPromptClick?: (miniPrompt: { id: string; name: string; description?: string | null; content: string }) => void;
}

export function WorkflowStagesSection({
  stages,
  isCreatingStage,
  editingStageId,
  includeMultiAgentChat,
  onRemoveStage,
  onRemoveMiniPrompt,
  onDropMiniPrompts,
  onEditStage,
  onUpdateStage,
  onToggleWithReview,
  onCreateStage,
  onCancelCreateStage,
  onCancelEditStage,
  onMiniPromptClick,
}: WorkflowStagesSectionProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {stages.map((stage) => {
          if (editingStageId === stage.id) {
            return (
              <StageCreateForm
                key={stage.id}
                mode="edit"
                initialValues={{
                  name: stage.name,
                  description: stage.description || undefined,
                  color: stage.color || '',
                  withReview: stage.withReview,
                }}
                onSubmit={(name, description, color, withReview) => {
                  onUpdateStage(stage.id, {
                    name,
                    description: description || undefined,
                    color: color || undefined,
                    withReview,
                  });
                }}
                onCancel={onCancelEditStage}
              />
            );
          }
          return (
            <StageSection
              key={stage.id}
              stage={stage}
              onRemoveStage={onRemoveStage}
              onRemoveMiniPrompt={onRemoveMiniPrompt}
              onDropMiniPrompts={onDropMiniPrompts}
              onEditStage={onEditStage}
              onToggleWithReview={onToggleWithReview}
              onMiniPromptClick={onMiniPromptClick}
              includeMultiAgentChat={includeMultiAgentChat}
            />
          );
        })}

        {isCreatingStage ? (
          <StageCreateForm
            onSubmit={(name, description, color, withReview) => {
              onCreateStage({
                name,
                description: description || undefined,
                color: color || undefined,
                withReview,
              });
            }}
            onCancel={onCancelCreateStage}
          />
        ) : null}
      </div>
    </DndProvider>
  );
}

