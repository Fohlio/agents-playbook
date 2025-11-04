'use client';

import { useEffect, useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import Button from '@/shared/ui/atoms/Button';
import Input from '@/shared/ui/atoms/Input';
import { BetaBadge } from '@/shared/ui/atoms';
import type { WorkflowConstructorData } from '@/lib/types/workflow-constructor-types';
import { useDragAndDrop } from '../hooks/use-drag-and-drop';
import { useWorkflowConstructor } from '../hooks/use-workflow-constructor';
import { useWorkflowConstructorStore } from '../lib/workflow-constructor-store';
import { useWorkflowHandlers } from '../lib/use-workflow-handlers';
import { useWorkflowAIIntegration } from '../lib/use-workflow-ai-integration';
import { MiniPromptLibrary } from './MiniPromptLibrary';
import { StageSection } from './StageSection';
import { StageCreateForm } from './StageCreateForm';
import { MiniPromptEditorModal } from './MiniPromptEditorModal';
import { TagMultiSelect } from '@/shared/ui/molecules';
import { Tooltip } from '@/shared/ui/molecules';
import { ChatSidebar } from '@/features/ai-assistant/components/ChatSidebar';
import { Sparkles } from 'lucide-react';
import { DraggableButton } from '@/shared/ui/atoms/DraggableButton';

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
    localStages,
    miniPrompts,
    isCreatingStage,
    editingStageId,
    viewingMiniPromptId,
    isChatOpen,
    isDirty,
    isSaving: storeSaving,
    setWorkflowName,
    setWorkflowDescription,
    setIsActive,
    setIsPublic,
    setIncludeMultiAgentChat,
    setSelectedTagIds,
    setMiniPrompts,
    setIsCreatingStage,
    setEditingStageId,
    setIsChatOpen,
    setViewingMiniPromptId,
    markDirty,
  } = useWorkflowConstructorStore();

  const [editingMiniPrompt, setEditingMiniPrompt] = useState<typeof miniPrompts[0] | null>(null);
  const [editingTagIds, setEditingTagIds] = useState<string[]>([]);

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

  // Get handlers
  const {
    handleCreateStage,
    handleRemoveStage,
    handleRemoveMiniPrompt,
    handleToggleWithReview,
    handleEditStage,
    handleUpdateStage,
    handleDragEnd: handleMiniPromptDragEnd,
    handleEditMiniPrompt,
    handleUpdateMiniPrompt,
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
    tagIds: string[]
  ) => {
    await handleUpdateMiniPrompt(editingMiniPrompt, name, description, content, visibility, tagIds);
  };

  // Get AI integration
  const { handleToolCall } = useWorkflowAIIntegration();

  // Drag and drop
  const {
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd: onDragEnd,
    handleDragCancel,
  } = useDragAndDrop();

  const handleDragEnd = (event: DragEndEvent) => {
    onDragEnd();
    const { active, over } = event;

    if (!over || !currentWorkflow) return;

    const miniPromptId = active.id as string;
    const stageId = over.id as string;

    handleMiniPromptDragEnd(miniPromptId, stageId, miniPrompts);
  };

  const handleSaveWorkflow = async () => {
    if (!workflowId) return;

    await handleSave({
      workflowId,
      name: workflowName,
      description: workflowDescription ?? undefined,
      complexity: complexity ?? undefined,
      isActive: isActive,
      visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
      includeMultiAgentChat: includeMultiAgentChat,
      tagIds: selectedTagIds,
      stages: localStages.map((stage, index) => ({
        name: stage.name,
        description: stage.description ?? undefined,
        color: stage.color ?? undefined,
        order: index,
        withReview: stage.withReview,
        miniPrompts: stage.miniPrompts.map((smp, mpIndex) => ({
          miniPromptId: smp.miniPromptId,
          order: mpIndex,
        })),
      })),
    });
  };

  if (!currentWorkflow) {
    return (
      <div className="p-8 text-center">
        <p className="text-text-tertiary">No workflow selected</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-surface-base border-b border-border-base px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <Input
              type="text"
              value={workflowName}
              onChange={(e) => {
                setWorkflowName(e.target.value);
                if (e.target.value !== currentWorkflow.name) {
                  markDirty();
                }
              }}
              placeholder="Workflow Name"
              className="text-2xl font-bold border-0 bg-transparent focus:ring-0 px-0"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSaveWorkflow}
              disabled={!isDirty || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Workflow'}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => {
                  setIsActive(e.target.checked);
                  markDirty();
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-text-secondary">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => {
                  setIsPublic(e.target.checked);
                  markDirty();
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-text-secondary">Public</span>
            </label>
            <Tooltip content="Enable AI coordination prompts after each mini-prompt to help multiple agents collaborate effectively">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMultiAgentChat}
                  onChange={(e) => {
                    setIncludeMultiAgentChat(e.target.checked);
                    markDirty();
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-text-secondary flex items-center gap-1">
                  Multi-Agent Chat
                  <BetaBadge />
                </span>
              </label>
            </Tooltip>
          </div>
        </div>

        <div className="mt-4">
          <TagMultiSelect
            selectedTagIds={selectedTagIds}
            onChange={(tagIds) => {
              setSelectedTagIds(tagIds);
              markDirty();
            }}
          />
        </div>

        <div className="mt-3">
          <textarea
            value={workflowDescription || ''}
            onChange={(e) => {
              setWorkflowDescription(e.target.value || null);
              if (e.target.value !== (currentWorkflow.description || '')) {
                markDirty();
              }
            }}
            placeholder="Workflow Description (optional)"
            rows={3}
            className="w-full text-sm text-text-secondary rounded-md border border-gray-200 px-3 py-2 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-500 focus:shadow-md bg-white placeholder:text-gray-400 resize-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid grid-cols-4 gap-6 p-6 h-full">
            <div className="col-span-1 overflow-y-auto">
              <MiniPromptLibrary
                miniPrompts={miniPrompts}
                onMiniPromptCreated={(newMiniPrompt) =>
                  setMiniPrompts([...miniPrompts, newMiniPrompt])
                }
                onMiniPromptUpdated={(updatedMiniPrompt) => {
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
                      miniPrompts: stage.miniPrompts.map((smp) =>
                        smp.miniPromptId === updatedMiniPrompt.id
                          ? { ...smp, miniPrompt: updatedMiniPrompt }
                          : smp
                      ),
                    }))
                  );
                  markDirty();
                }}
              />
            </div>

            <div className="col-span-3 overflow-y-auto">
              <div className="space-y-4">
                {localStages.map((stage) => {
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
                        onSubmit={handleUpdateStage}
                        onCancel={() => setEditingStageId(null)}
                      />
                    );
                  }
                  return (
                    <StageSection
                      key={stage.id}
                      stage={stage}
                      onRemoveStage={handleRemoveStage}
                      onRemoveMiniPrompt={handleRemoveMiniPrompt}
                      onEditMiniPrompt={handleEditMiniPrompt}
                      onEditStage={handleEditStage}
                      onToggleWithReview={handleToggleWithReview}
                      includeMultiAgentChat={includeMultiAgentChat}
                    />
                  );
                })}

                {isCreatingStage ? (
                  <StageCreateForm
                    onSubmit={handleCreateStage}
                    onCancel={() => setIsCreatingStage(false)}
                  />
                ) : (
                  <button
                    onClick={() => setIsCreatingStage(true)}
                    className="w-full border-2 border-dashed border-border-base rounded-lg p-6 text-center hover:border-border-hover hover:bg-surface-hover transition-colors"
                  >
                    <span className="text-text-secondary">+ Add Stage</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </DndContext>

        {/* AI Assistant Chat Sidebar */}
        <ChatSidebar
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setViewingMiniPromptId(null);
          }}
          mode="workflow"
          workflowContext={{
            workflow: currentWorkflow
              ? {
                  id: currentWorkflow.id,
                  name: workflowName,
                  description: currentWorkflow.description,
                  complexity: complexity,
                  includeMultiAgentChat,
                  stages: localStages.map((stage) => ({
                    id: stage.id,
                    name: stage.name,
                    description: stage.description,
                    color: stage.color,
                    withReview: stage.withReview,
                    order: stage.order,
                    miniPrompts: stage.miniPrompts.map((smp) => ({
                      miniPrompt: {
                        id: smp.miniPrompt.id,
                        name: smp.miniPrompt.name,
                        description: smp.miniPrompt.description,
                        content: smp.miniPrompt.content,
                      },
                      order: smp.order,
                    })),
                  })),
                }
              : undefined,
            availableMiniPrompts: miniPrompts.map((mp) => ({
              id: mp.id,
              name: mp.name,
              description: mp.description,
            })),
            currentMiniPrompt: viewingMiniPromptId
              ? (() => {
                  const mp = miniPrompts.find((m) => m.id === viewingMiniPromptId);
                  return mp
                    ? {
                        id: mp.id,
                        name: mp.name,
                        description: mp.description,
                        content: mp.content,
                      }
                    : undefined;
                })()
              : undefined,
          }}
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
        } : undefined}
      />
    </div>
  );
}
