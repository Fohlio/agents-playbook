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
  onRemoveStage: (stageId: string) => void;
  onRemoveMiniPrompt: (stageId: string, miniPromptId: string) => void;
  onDropMiniPrompts: (stageId: string, miniPromptIds: string[]) => void;
  onEditStage: (stageId: string) => void;
  onUpdateStage: (stageId: string, data: {
    name: string;
    description?: string;
    color?: string;
    withReview: boolean;
    includeMultiAgentChat?: boolean;
  }) => void;
  onToggleWithReview: (stageId: string, withReview: boolean) => void;
  onToggleMultiAgentChat?: (stageId: string, includeMultiAgentChat: boolean) => void;
  onCreateStage: (data: {
    name: string;
    description?: string;
    color?: string;
    withReview: boolean;
    includeMultiAgentChat?: boolean;
  }) => void;
  onCancelCreateStage: () => void;
  onCancelEditStage: () => void;
  onMiniPromptClick?: (miniPrompt: { id: string; name: string; description?: string | null; content: string }) => void;
}

export function WorkflowStagesSection({
  stages,
  isCreatingStage,
  editingStageId,
  onRemoveStage,
  onRemoveMiniPrompt,
  onDropMiniPrompts,
  onEditStage,
  onUpdateStage,
  onToggleWithReview,
  onToggleMultiAgentChat,
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
                  includeMultiAgentChat: stage.includeMultiAgentChat ?? false,
                }}
                onSubmit={(name, description, color, withReview, includeMultiAgentChat) => {
                  onUpdateStage(stage.id, {
                    name,
                    description: description || undefined,
                    color: color || undefined,
                    withReview,
                    includeMultiAgentChat,
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
              onToggleMultiAgentChat={onToggleMultiAgentChat}
              onMiniPromptClick={onMiniPromptClick}
            />
          );
        })}

        {isCreatingStage ? (
          <StageCreateForm
            onSubmit={(name, description, color, withReview, includeMultiAgentChat) => {
              onCreateStage({
                name,
                description: description || undefined,
                color: color || undefined,
                withReview,
                includeMultiAgentChat,
              });
            }}
            onCancel={onCancelCreateStage}
          />
        ) : null}
      </div>
    </DndProvider>
  );
}

