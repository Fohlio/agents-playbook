'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { WorkflowConstructorData } from '@/shared/lib/types/workflow-constructor-types';
import { useWorkflowConstructor } from '../hooks/use-workflow-constructor';
import { useWorkflowConstructorStore } from '../lib/workflow-constructor-store';
import { useWorkflowHandlers } from '../lib/use-workflow-handlers';
import { useWorkflowAIIntegration } from '../lib/use-workflow-ai-integration';
import { useWorkflowContext } from '../hooks/use-workflow-context';
import { useWorkflowActions } from '../hooks/use-workflow-actions';
import { WorkflowHeader } from './WorkflowHeader';
import { WorkflowLayout } from './WorkflowLayout';
import { MiniPromptEditorModal } from './MiniPromptEditorModal';
import { ChatSidebar } from '@/features/ai-assistant/components/ChatSidebar';
import { Sparkles } from 'lucide-react';
import { DraggableButton } from '@/shared/ui/atoms/DraggableButton';
import { Tooltip } from '@/shared/ui/molecules';

interface WorkflowConstructorProps {
  data: WorkflowConstructorData;
}

export function WorkflowConstructor({ data }: WorkflowConstructorProps) {
  const { workflow, miniPrompts: initialMiniPrompts } = data;
  const t = useTranslations('workflowConstructor');

  const initializeFromWorkflow = useWorkflowConstructorStore((s) => s.initializeFromWorkflow);
  const reset = useWorkflowConstructorStore((s) => s.reset);

  useEffect(() => {
    if (workflow) {
      initializeFromWorkflow(workflow, initialMiniPrompts);
    }
    return () => reset();
  }, [workflow, initialMiniPrompts, initializeFromWorkflow, reset]);

  const {
    workflowId,
    workflowName,
    workflowDescription,
    complexity,
    isActive,
    isPublic,
    includeMultiAgentChat,
    selectedModelIds,
    localStages,
    miniPrompts,
    isCreatingStage,
    editingStageId,
    viewingMiniPromptId,
    isChatOpen,
    isDirty,
    isSaving: storeSaving,
    setMiniPrompts,
    setIsCreatingStage,
    setEditingStageId,
    setIsChatOpen,
    setViewingMiniPromptId,
    markDirty,
  } = useWorkflowConstructorStore();

  const [editingMiniPrompt, setEditingMiniPrompt] = useState<typeof miniPrompts[0] | null>(null);

  useEffect(() => {
    if (editingMiniPrompt) {
      setViewingMiniPromptId(editingMiniPrompt.id);
    }
  }, [editingMiniPrompt, setViewingMiniPromptId]);

  const currentWorkflow = workflowId
    ? {
        id: workflowId,
        name: workflowName,
        description: workflowDescription,
        complexity,
        includeMultiAgentChat,
        isActive,
        visibility: isPublic ? ('PUBLIC' as const) : ('PRIVATE' as const),
        userId: workflow?.userId || '',
        isSystemWorkflow: false,
        position: 0,
        createdAt: workflow?.createdAt || new Date(),
        updatedAt: new Date(),
        stages: localStages,
      }
    : workflow;

  const { isSaving: hookSaving, handleSave } = useWorkflowConstructor(workflow);
  const isSaving = storeSaving || hookSaving;

  const workflowContext = useWorkflowContext({
    workflowId,
    workflowName,
    workflowDescription: workflowDescription ?? null,
    complexity: complexity ?? null,
    includeMultiAgentChat,
    stages: localStages,
    miniPrompts,
    viewingMiniPromptId: viewingMiniPromptId ?? null,
    workflow: currentWorkflow || null,
  });

  const {
    handleWorkflowNameChange,
    handleWorkflowDescriptionChange,
    handleIsActiveChange,
    handleIsPublicChange,
    handleSelectedModelIdsChange,
    handleSaveWorkflow: handleSaveWorkflowFromHook,
  } = useWorkflowActions({
    workflowId: workflowId ?? undefined,
    currentWorkflowName: workflow?.name,
    currentWorkflowDescription: workflow?.description ?? null,
    onSave: async (data) => {
      if (!workflowId) return;
      await handleSave({
        workflowId: data.workflowId,
        name: data.name,
        description: data.description,
        complexity: data.complexity,
        isActive: data.isActive,
        visibility: data.visibility,
        includeMultiAgentChat: data.includeMultiAgentChat,
        tagIds: [],
        modelIds: data.modelIds,
        stages: data.stages,
      });
    },
  });

  const {
    handleCreateStage,
    handleRemoveStage,
    handleRemoveMiniPrompt,
    handleEditStage,
    handleUpdateStage,
    handleDragEnd: handleMiniPromptDragEnd,
    handleUpdateMiniPrompt,
    handleReorderItems,
  } = useWorkflowHandlers({
    miniPrompts,
    setMiniPrompts,
    onEditMiniPrompt: setEditingMiniPrompt,
  });

  const handleUpdateMiniPromptWrapper = async (
    name: string,
    description: string,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE',
    _tagIds: string[],
    _newTagNames: string[]
  ) => {
    await handleUpdateMiniPrompt(editingMiniPrompt, name, description, content, visibility, [], []);
  };

  const { handleToolCall } = useWorkflowAIIntegration();

  const onDropMiniPrompts = (stageId: string, miniPromptIds: string[]) => {
    handleMiniPromptDragEnd(miniPromptIds, stageId, miniPrompts);
  };

  const handleCreateStageWrapper = (data: {
    name: string;
    description?: string;
    color?: string;
    withReview: boolean;
    includeMultiAgentChat?: boolean;
  }) => {
    handleCreateStage(data.name, data.description || '', data.color || '', data.withReview, data.includeMultiAgentChat ?? false);
  };

  const handleUpdateStageWrapper = (_stageId: string, data: {
    name: string;
    description?: string;
    color?: string;
    withReview: boolean;
    includeMultiAgentChat?: boolean;
  }) => {
    handleUpdateStage(data.name, data.description || '', data.color || '', data.withReview, data.includeMultiAgentChat ?? false);
  };

  if (!currentWorkflow) {
    return (
      <div className="p-8 text-center bg-[#050508] min-h-screen flex items-center justify-center">
        <div className="bg-[#0a0a0f]/80 border border-cyan-500/30 p-8" style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}>
          <p className="text-cyan-100/40 font-mono uppercase tracking-wider">{t('noWorkflowSelected')}</p>
        </div>
      </div>
    );
  }

  const handleMiniPromptUpdated = (updatedMiniPrompt: typeof miniPrompts[0]) => {
    setMiniPrompts(
      miniPrompts.map((mp) =>
        mp.id === updatedMiniPrompt.id ? updatedMiniPrompt : mp
      )
    );
    const { setLocalStages } = useWorkflowConstructorStore.getState();
    setLocalStages((prevStages) =>
      prevStages.map((stage) => ({
        ...stage,
        miniPrompts: stage.miniPrompts.map((smp: typeof stage.miniPrompts[0]) =>
          smp.miniPromptId === updatedMiniPrompt.id
            ? { ...smp, miniPrompt: updatedMiniPrompt }
            : smp
        ),
      }))
    );
    markDirty();
  };

  const handleMiniPromptDeleted = (deletedMiniPromptId: string) => {
    setMiniPrompts(miniPrompts.filter(mp => mp.id !== deletedMiniPromptId));
    
    const { setLocalStages } = useWorkflowConstructorStore.getState();
    setLocalStages((prevStages) =>
      prevStages.map((stage) => ({
        ...stage,
        miniPrompts: stage.miniPrompts.filter(
          (smp) => smp.miniPromptId !== deletedMiniPromptId
        ),
      }))
    );
    markDirty();
  };

  return (
    <div className="h-screen flex flex-col bg-[#050508]">
      <WorkflowHeader
        workflowName={workflowName}
        workflowDescription={workflowDescription}
        workflowKey={workflow?.key}
        isActive={isActive}
        isPublic={isPublic}
        selectedModelIds={selectedModelIds}
        isDirty={isDirty}
        isSaving={isSaving}
        onWorkflowNameChange={handleWorkflowNameChange}
        onWorkflowDescriptionChange={handleWorkflowDescriptionChange}
        onIsActiveChange={handleIsActiveChange}
        onIsPublicChange={handleIsPublicChange}
        onSelectedModelIdsChange={handleSelectedModelIdsChange}
        onSave={handleSaveWorkflowFromHook}
      />

      <div className="flex-1 overflow-hidden">
        <WorkflowLayout
          miniPrompts={miniPrompts}
          stages={localStages}
          isCreatingStage={isCreatingStage}
          editingStageId={editingStageId}
          onMiniPromptCreated={(newMiniPrompt) =>
            setMiniPrompts([...miniPrompts, newMiniPrompt])
          }
          onMiniPromptUpdated={handleMiniPromptUpdated}
          onMiniPromptDeleted={handleMiniPromptDeleted}
          onRemoveStage={handleRemoveStage}
          onRemoveMiniPrompt={handleRemoveMiniPrompt}
          onDropMiniPrompts={onDropMiniPrompts}
          onReorderItems={handleReorderItems}
          onEditStage={handleEditStage}
          onUpdateStage={handleUpdateStageWrapper}
          onCreateStage={handleCreateStageWrapper}
          onCancelCreateStage={() => setIsCreatingStage(false)}
          onCancelEditStage={() => setEditingStageId(null)}
          onCreateStageClick={() => setIsCreatingStage(true)}
          onMiniPromptClick={(miniPrompt) => {
            setViewingMiniPromptId(miniPrompt.id);
          }}
        />

        <ChatSidebar
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
          }}
          mode="workflow"
          workflowContext={workflowContext}
          onToolCall={handleToolCall}
        />

        <DraggableButton>
          <Tooltip content={t('aiAssistantTooltip')}>
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all hover:scale-110 cursor-pointer"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              aria-label={t('openAiAssistant')}
            >
              <Sparkles className="w-6 h-6" />
            </button>
          </Tooltip>
        </DraggableButton>
      </div>

      <MiniPromptEditorModal
        isOpen={!!editingMiniPrompt}
        onClose={() => {
          setEditingMiniPrompt(null);
        }}
        onSave={handleUpdateMiniPromptWrapper}
        initialData={editingMiniPrompt ? {
          name: editingMiniPrompt.name,
          description: editingMiniPrompt.description || '',
          content: editingMiniPrompt.content,
          visibility: editingMiniPrompt.visibility as 'PUBLIC' | 'PRIVATE',
          key: editingMiniPrompt.key,
        } : undefined}
      />
    </div>
  );
}
