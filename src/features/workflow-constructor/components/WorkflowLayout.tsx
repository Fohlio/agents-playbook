'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { MiniPrompt } from '@prisma/client';
import { Button } from '@/shared/ui/atoms';
import { MiniPromptLibrary } from './MiniPromptLibrary';
import { WorkflowStagesSection } from './WorkflowStagesSection';
import type { WorkflowStageWithMiniPrompts } from '@/lib/types/workflow-constructor-types';

interface WorkflowLayoutProps {
  miniPrompts: MiniPrompt[];
  stages: WorkflowStageWithMiniPrompts[];
  isCreatingStage: boolean;
  editingStageId: string | null;
  onMiniPromptCreated: (miniPrompt: MiniPrompt) => void;
  onMiniPromptUpdated: (miniPrompt: MiniPrompt) => void;
  onMiniPromptDeleted: (miniPromptId: string) => void;
  onRemoveStage: (stageId: string) => void;
  onRemoveMiniPrompt: (stageId: string, miniPromptId: string) => void;
  onDropMiniPrompts: (stageId: string, miniPromptIds: string[]) => void;
  onReorderItems?: (stageId: string, itemIds: string[]) => void;
  onEditStage: (stageId: string) => void;
  onUpdateStage: (stageId: string, data: {
    name: string;
    description?: string;
    color?: string;
    withReview: boolean;
  }) => void;
  onCreateStage: (data: {
    name: string;
    description?: string;
    color?: string;
    withReview: boolean;
    includeMultiAgentChat?: boolean;
  }) => void;
  onCancelCreateStage: () => void;
  onCancelEditStage: () => void;
  onCreateStageClick: () => void;
  onMiniPromptClick?: (miniPrompt: { id: string; name: string; description?: string | null; content: string }) => void;
}

export function WorkflowLayout({
  miniPrompts,
  stages,
  isCreatingStage,
  editingStageId,
  onMiniPromptCreated,
  onMiniPromptUpdated,
  onMiniPromptDeleted,
  onRemoveStage,
  onRemoveMiniPrompt,
  onDropMiniPrompts,
  onReorderItems,
  onEditStage,
  onUpdateStage,
  onCreateStage,
  onCancelCreateStage,
  onCancelEditStage,
  onCreateStageClick,
  onMiniPromptClick,
}: WorkflowLayoutProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-4 gap-6 p-6 h-full">
        <div className="col-span-1 overflow-y-auto">
          <MiniPromptLibrary
            miniPrompts={miniPrompts}
            onMiniPromptCreated={onMiniPromptCreated}
            onMiniPromptUpdated={onMiniPromptUpdated}
            onMiniPromptDeleted={onMiniPromptDeleted}
          />
        </div>

        <div className="col-span-3 overflow-y-auto">
          <WorkflowStagesSection
            stages={stages}
            isCreatingStage={isCreatingStage}
            editingStageId={editingStageId}
            onRemoveStage={onRemoveStage}
            onRemoveMiniPrompt={onRemoveMiniPrompt}
            onDropMiniPrompts={onDropMiniPrompts}
            onReorderItems={onReorderItems}
            onEditStage={onEditStage}
            onUpdateStage={onUpdateStage}
            onCreateStage={onCreateStage}
            onCancelCreateStage={onCancelCreateStage}
            onCancelEditStage={onCancelEditStage}
            onMiniPromptClick={onMiniPromptClick}
          />
          {!isCreatingStage && (
            <Button
              onClick={onCreateStageClick}
              variant="secondary"
              fullWidth
              className="mt-4 border-2 border-dashed border-border-base hover:border-border-hover hover:bg-surface-hover py-6"
            >
              <span className="text-text-secondary">+ Add Stage</span>
            </Button>
          )}
        </div>
      </div>
    </DndProvider>
  );
}

