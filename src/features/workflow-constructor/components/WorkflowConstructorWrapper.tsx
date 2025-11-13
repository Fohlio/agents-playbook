'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button, Input, BetaBadge, Checkbox } from '@/shared/ui/atoms';
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
    // Only reset if this is a true reset (e.g., component mount or miniPrompts actually changed)
    // Don't reset on every render - this was causing the chat modal to close
    const currentMiniPrompts = useWorkflowConstructorStore.getState().miniPrompts;
    const miniPromptsChanged = JSON.stringify(currentMiniPrompts.map(mp => mp.id).sort()) !== 
                               JSON.stringify(initialMiniPrompts.map(mp => mp.id).sort());
    
    if (miniPromptsChanged) {
      console.log('[WorkflowConstructorWrapper] Mini-prompts changed, resetting store');
      reset();
      setMiniPrompts(initialMiniPrompts);
    } else {
      // Just update mini-prompts without full reset to preserve UI state
      setMiniPrompts(initialMiniPrompts);
    }
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
            <Checkbox
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              id="new-workflow-active-checkbox"
              label="Active"
            />
            <Checkbox
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              id="new-workflow-public-checkbox"
              label="Public"
            />
            <Tooltip content="Enable AI coordination prompts after each mini-prompt to help multiple agents collaborate effectively">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={includeMultiAgentChat}
                  onChange={(e) => setIncludeMultiAgentChat(e.target.checked)}
                  id="new-workflow-multi-agent-chat-checkbox"
                />
                <label htmlFor="new-workflow-multi-agent-chat-checkbox" className="text-sm text-text-secondary flex items-center gap-1 cursor-pointer">
                  Multi-Agent Chat
                  <BetaBadge />
                </label>
              </div>
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
                      onMiniPromptClick={(miniPrompt) => {
                        setViewingMiniPromptId(miniPrompt.id);
                      }}
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
            setIsChatOpen(false);
            // Don't clear viewingMiniPromptId when closing chat - user might want to keep viewing it
            // setViewingMiniPromptId(null);
          }}
          mode="workflow"
          workflowContext={useMemo(() => {
            // Find current mini-prompt
            let currentMiniPrompt = undefined;
            if (viewingMiniPromptId) {
              // First try to find in main miniPrompts array
              let mp = miniPrompts.find((m) => m.id === viewingMiniPromptId);
              
              // If not found, search in stages
              if (!mp) {
                for (const stage of localStages) {
                  const stageMp = stage.miniPrompts.find(
                    (smp) => smp.miniPrompt.id === viewingMiniPromptId
                  );
                  if (stageMp) {
                    mp = stageMp.miniPrompt;
                    break;
                  }
                }
              }
              
              if (mp) {
                currentMiniPrompt = {
                  id: mp.id,
                  name: mp.name,
                  description: mp.description,
                  content: mp.content,
                };
              }
              
              console.log('[WorkflowConstructorWrapper] Building workflowContext (memoized):', {
                viewingMiniPromptId,
                foundInMiniPrompts: !!miniPrompts.find((m) => m.id === viewingMiniPromptId),
                foundInStages: !!localStages.some(s => s.miniPrompts.some(smp => smp.miniPrompt.id === viewingMiniPromptId)),
                foundMiniPrompt: !!mp,
                currentMiniPrompt: currentMiniPrompt ? { id: currentMiniPrompt.id, name: currentMiniPrompt.name } : null,
              });
            }

            return {
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
              currentMiniPrompt,
            };
          }, [
            viewingMiniPromptId,
            miniPrompts,
            localStages,
            workflowName,
            includeMultiAgentChat,
          ])}
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
