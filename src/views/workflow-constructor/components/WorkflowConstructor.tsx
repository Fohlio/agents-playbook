'use client';

import { useEffect, useState } from 'react';
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

  // Initialize store with workflow data
  const initializeFromWorkflow = useWorkflowConstructorStore((s) => s.initializeFromWorkflow);
  const reset = useWorkflowConstructorStore((s) => s.reset);

  useEffect(() => {
    if (workflow) {
      initializeFromWorkflow(workflow, initialMiniPrompts);
    }
    return () => reset();
  }, [workflow, initialMiniPrompts, initializeFromWorkflow, reset]);

  // Get state from store
  const {
    workflowId,
    workflowName,
    workflowDescription,
    complexity,
    isActive,
    isPublic,
    includeMultiAgentChat,
    selectedTagIds,
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
  const [editingTagIds, setEditingTagIds] = useState<string[]>([]);

  // Sync viewingMiniPromptId with editingMiniPrompt - when a mini-prompt is opened for editing, set viewingMiniPromptId
  useEffect(() => {
    if (editingMiniPrompt) {
      setViewingMiniPromptId(editingMiniPrompt.id);
    }
  }, [editingMiniPrompt, setViewingMiniPromptId]);

  // Build a synthetic workflow from Zustand state for the chat context
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

  // Use the existing useWorkflowConstructor hook for saving
  const { isSaving: hookSaving, handleSave } = useWorkflowConstructor(workflow);
  const isSaving = storeSaving || hookSaving;

  // Use extracted hooks
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
    handleSelectedTagIdsChange,
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
        tagIds: data.tagIds,
        modelIds: data.modelIds,
        stages: data.stages,
      });
    },
  });

  // Get handlers
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
    onEditTagIds: setEditingTagIds,
  });

  const handleUpdateMiniPromptWrapper = async (
    name: string,
    description: string,
    content: string,
    visibility: 'PUBLIC' | 'PRIVATE',
    tagIds: string[],
    newTagNames: string[]
  ) => {
    await handleUpdateMiniPrompt(editingMiniPrompt, name, description, content, visibility, tagIds, newTagNames);
  };

  // Get AI integration
  const { handleToolCall } = useWorkflowAIIntegration();

  // Drag and drop handler for stages
  const onDropMiniPrompts = (stageId: string, miniPromptIds: string[]) => {
    handleMiniPromptDragEnd(miniPromptIds, stageId, miniPrompts);
  };

  // Wrapper functions for stage handlers to match component interface
  const handleCreateStageWrapper = (data: {
    name: string;
    description?: string;
    color?: string;
    withReview: boolean;
    includeMultiAgentChat?: boolean;
  }) => {
    handleCreateStage(data.name, data.description || '', data.color || '', data.withReview, data.includeMultiAgentChat ?? false);
  };

  const handleUpdateStageWrapper = (stageId: string, data: {
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
      <div className="p-8 text-center">
        <p className="text-text-tertiary">No workflow selected</p>
      </div>
    );
  }

  // Handlers for mini-prompt updates
  const handleMiniPromptUpdated = (updatedMiniPrompt: typeof miniPrompts[0]) => {
    setMiniPrompts(
      miniPrompts.map((mp) =>
        mp.id === updatedMiniPrompt.id ? updatedMiniPrompt : mp
      )
    );
    // Also update mini-prompts in stages
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
    // Remove from library
    setMiniPrompts(miniPrompts.filter(mp => mp.id !== deletedMiniPromptId));
    
    // Remove from all stages
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
    <div className="h-screen flex flex-col">
      <WorkflowHeader
        workflowName={workflowName}
        workflowDescription={workflowDescription}
        workflowKey={workflow?.key}
        isActive={isActive}
        isPublic={isPublic}
        selectedTagIds={selectedTagIds}
        selectedModelIds={selectedModelIds}
        isDirty={isDirty}
        isSaving={isSaving}
        onWorkflowNameChange={handleWorkflowNameChange}
        onWorkflowDescriptionChange={handleWorkflowDescriptionChange}
        onIsActiveChange={handleIsActiveChange}
        onIsPublicChange={handleIsPublicChange}
        onSelectedTagIdsChange={handleSelectedTagIdsChange}
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

        {/* AI Assistant Chat Sidebar */}
        <ChatSidebar
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
          }}
          mode="workflow"
          workflowContext={workflowContext}
          onToolCall={handleToolCall}
        />

        {/* Floating AI Assistant Button */}
        <DraggableButton>
          <Tooltip content="Open AI Assistant to help design your workflow">
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
              aria-label="Open AI Assistant"
            >
              <Sparkles className="w-6 h-6" />
            </button>
          </Tooltip>
        </DraggableButton>
      </div>

      {/* Mini Prompt Edit Modal */}
      <MiniPromptEditorModal
        isOpen={!!editingMiniPrompt}
        onClose={() => {
          setEditingMiniPrompt(null);
          setEditingTagIds([]);
        }}
        onSave={handleUpdateMiniPromptWrapper}
        initialData={editingMiniPrompt ? {
          name: editingMiniPrompt.name,
          description: editingMiniPrompt.description || '',
          content: editingMiniPrompt.content,
          visibility: editingMiniPrompt.visibility as 'PUBLIC' | 'PRIVATE',
          tagIds: editingTagIds,
          key: editingMiniPrompt.key,
        } : undefined}
      />
    </div>
  );
}
