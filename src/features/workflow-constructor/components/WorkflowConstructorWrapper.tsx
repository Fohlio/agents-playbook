'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Button from '@/shared/ui/atoms/Button';
import Input from '@/shared/ui/atoms/Input';
import { BetaBadge } from '@/shared/ui/atoms';
import type { MiniPrompt } from '@prisma/client';
import { useWorkflowConstructorStore } from '../lib/workflow-constructor-store';
import { useWorkflowHandlers } from '../lib/use-workflow-handlers';
import { useWorkflowAIIntegration } from '../lib/use-workflow-ai-integration';
import { MiniPromptLibrary } from './MiniPromptLibrary';
import { StageSection } from './StageSection';
import { StageCreateForm } from './StageCreateForm';
import { createWorkflow } from '../actions/workflow-actions';
import { TagMultiSelect, type Tag } from '@/shared/ui/molecules';
import { Tooltip } from '@/shared/ui/molecules';
import { ChatSidebar } from '@/features/ai-assistant/components/ChatSidebar';
import { Sparkles } from 'lucide-react';
import { DraggableButton } from '@/shared/ui/atoms/DraggableButton';

interface WorkflowConstructorWrapperProps {
  userId: string;
  miniPrompts: MiniPrompt[];
}

export function WorkflowConstructorWrapper({
  userId,
  miniPrompts: initialMiniPrompts,
}: WorkflowConstructorWrapperProps) {
  const router = useRouter();
  const [allTags, setAllTags] = useState<Tag[]>([]);

  // Initialize store for new workflow
  const reset = useWorkflowConstructorStore((s) => s.reset);
  const setMiniPrompts = useWorkflowConstructorStore((s) => s.setMiniPrompts);

  useEffect(() => {
    reset();
    setMiniPrompts(initialMiniPrompts);
  }, [initialMiniPrompts, reset, setMiniPrompts]);

  // Get state from store
  const {
    workflowName,
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
    isSaving,
    setWorkflowName,
    setIsActive,
    setIsPublic,
    setIncludeMultiAgentChat,
    setSelectedTagIds,
    setLocalStages,
    setIsCreatingStage,
    setEditingStageId,
    setIsChatOpen,
    setViewingMiniPromptId,
    setIsSaving,
  } = useWorkflowConstructorStore();

  // Get handlers
  const {
    handleCreateStage,
    handleRemoveStage,
    handleRemoveMiniPrompt,
    handleToggleWithReview,
    handleEditStage,
    handleUpdateStage,
    handleDragEnd: handleMiniPromptDragEnd,
  } = useWorkflowHandlers();

  // Get AI integration
  const { handleToolCall } = useWorkflowAIIntegration();

  // Drag and drop handler for stages
  const onDropMiniPrompts = (stageId: string, miniPromptIds: string[]) => {
    handleMiniPromptDragEnd(miniPromptIds, stageId, miniPrompts);
  };

  const handleSaveWorkflow = async () => {
    console.log('[WorkflowConstructorWrapper] Starting handleSaveWorkflow');
    console.log('[WorkflowConstructorWrapper] localStages:', localStages.length);
    console.log('[WorkflowConstructorWrapper] workflowName:', workflowName);

    setIsSaving(true);
    try {
      // Collect temp mini-prompts that need to be created
      const tempMiniPromptsData: Record<string, { name: string; description: string; content: string; visibility: 'PUBLIC' | 'PRIVATE' }> = {};

      for (const stage of localStages) {
        for (const smp of stage.miniPrompts) {
          if (smp.miniPromptId.startsWith('temp-')) {
            console.log('[WorkflowConstructorWrapper] Found temp mini-prompt:', smp.miniPromptId);
            tempMiniPromptsData[smp.miniPromptId] = {
              name: smp.miniPrompt.name,
              description: smp.miniPrompt.description || '',
              content: smp.miniPrompt.content,
              visibility: smp.miniPrompt.visibility,
            };
          }
        }
      }

      // Separate temp tags from existing tags
      const existingTagIds = selectedTagIds.filter(id => !id.startsWith('temp-tag-'));
      const tempTagIds = selectedTagIds.filter(id => id.startsWith('temp-tag-'));
      const newTagNames = tempTagIds
        .map(id => allTags.find(t => t.id === id)?.name)
        .filter((name): name is string => !!name);

      console.log('[WorkflowConstructorWrapper] Existing tags:', existingTagIds);
      console.log('[WorkflowConstructorWrapper] New tags to create:', newTagNames);
      console.log('[WorkflowConstructorWrapper] Temp mini-prompts:', Object.keys(tempMiniPromptsData));

      const workflowData = {
        name: workflowName,
        userId,
        isActive,
        complexity: undefined,
        visibility: isPublic ? 'PUBLIC' : 'PRIVATE' as 'PUBLIC' | 'PRIVATE',
        includeMultiAgentChat,
        tagIds: existingTagIds,
        newTagNames,
        tempMiniPrompts: tempMiniPromptsData,
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
      };

      console.log('[WorkflowConstructorWrapper] Calling createWorkflow with:', workflowData);
      const result = await createWorkflow(workflowData);
      console.log('[WorkflowConstructorWrapper] createWorkflow result:', result);

      if (result.success && result.workflowId) {
        console.log('[WorkflowConstructorWrapper] Redirecting to:', `/dashboard/library`);
        router.push(`/dashboard/library`);
      } else {
        console.error('[WorkflowConstructorWrapper] Workflow creation failed:', result.error);
        alert(`Failed to create workflow: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('[WorkflowConstructorWrapper] Failed to create workflow:', error);
      console.error('[WorkflowConstructorWrapper] Error stack:', error instanceof Error ? error.stack : 'No stack');
      alert(`Failed to create workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
      console.log('[WorkflowConstructorWrapper] Finished handleSaveWorkflow');
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-surface-base border-b border-border-base px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <Input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Workflow Name"
              className="text-2xl font-bold border-0 bg-transparent focus:ring-0 px-0"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSaveWorkflow}
              disabled={isSaving || localStages.length === 0}
            >
              {isSaving ? 'Creating...' : 'Create Workflow'}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-text-secondary">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-text-secondary">Public</span>
            </label>
            <Tooltip content="Enable AI coordination prompts after each mini-prompt to help multiple agents collaborate effectively">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMultiAgentChat}
                  onChange={(e) => setIncludeMultiAgentChat(e.target.checked)}
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
            onChange={setSelectedTagIds}
            onTagsChanged={setAllTags}
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <DndProvider backend={HTML5Backend}>
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
                }}
                onMiniPromptDeleted={(deletedMiniPromptId) => {
                  // Remove from library
                  setMiniPrompts(miniPrompts.filter(mp => mp.id !== deletedMiniPromptId));
                  
                  // Remove from all stages
                  setLocalStages((prevStages) =>
                    prevStages.map((stage) => ({
                      ...stage,
                      miniPrompts: stage.miniPrompts.filter(
                        (smp) => smp.miniPromptId !== deletedMiniPromptId
                      ),
                    }))
                  );
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
                      onDropMiniPrompts={onDropMiniPrompts}
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
        </DndProvider>

        {/* AI Assistant Chat Sidebar */}
        <ChatSidebar
          isOpen={isChatOpen}
          onClose={() => {
            console.log('[WorkflowConstructorWrapper] ChatSidebar onClose called');
            console.trace('[WorkflowConstructorWrapper] Close call stack');
            setIsChatOpen(false);
            setViewingMiniPromptId(null);
          }}
          mode="workflow"
          workflowContext={{
            workflow: {
              id: 'new',
              name: workflowName,
              description: null,
              complexity: null,
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
            },
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
    </div>
  );
}
