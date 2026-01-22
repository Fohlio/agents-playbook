'use client';

import { useTranslations } from 'next-intl';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { MiniPrompt } from '@prisma/client';
import { MiniPromptLibrary } from './MiniPromptLibrary';
import { WorkflowStagesSection } from './WorkflowStagesSection';
import type { WorkflowStageWithMiniPrompts } from '@/shared/lib/types/workflow-constructor-types';

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
  const t = useTranslations('workflowLayout');

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-4 gap-6 p-6 h-full bg-[#050508]">
        {/* Background grid */}
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>

        <div className="col-span-1 overflow-y-auto relative">
          <MiniPromptLibrary
            miniPrompts={miniPrompts}
            onMiniPromptCreated={onMiniPromptCreated}
            onMiniPromptUpdated={onMiniPromptUpdated}
            onMiniPromptDeleted={onMiniPromptDeleted}
          />
        </div>

        <div className="col-span-3 overflow-y-auto relative">
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
            <button
              onClick={onCreateStageClick}
              className="w-full mt-4 py-6 border-2 border-dashed border-cyan-500/30 bg-transparent text-cyan-400 font-mono text-sm uppercase tracking-wider hover:border-cyan-400/50 hover:bg-cyan-500/5 transition-all cursor-pointer"
            >
              + {t('addStage')}
            </button>
          )}
        </div>
      </div>
    </DndProvider>
  );
}
