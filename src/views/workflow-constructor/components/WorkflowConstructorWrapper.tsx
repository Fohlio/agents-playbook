'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { MiniPrompt } from '@prisma/client';
import { useWorkflowConstructorStore } from '../lib/workflow-constructor-store';
import { useWorkflowHandlers } from '../lib/use-workflow-handlers';
import { useWorkflowAIIntegration } from '../lib/use-workflow-ai-integration';
import { MiniPromptLibrary } from './MiniPromptLibrary';
import { StageSection } from './StageSection';
import { StageCreateForm } from './StageCreateForm';
import { createWorkflow } from '../actions/workflow-actions';
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
  const t = useTranslations('workflowConstructorWrapper');

  const reset = useWorkflowConstructorStore((s) => s.reset);
  const setMiniPrompts = useWorkflowConstructorStore((s) => s.setMiniPrompts);

  useEffect(() => {
    const currentMiniPrompts = useWorkflowConstructorStore.getState().miniPrompts;
    const miniPromptsChanged = JSON.stringify(currentMiniPrompts.map(mp => mp.id).sort()) !== 
                               JSON.stringify(initialMiniPrompts.map(mp => mp.id).sort());
    
    if (miniPromptsChanged) {
      console.log('[WorkflowConstructorWrapper] Mini-prompts changed, resetting store');
      reset();
      setMiniPrompts(initialMiniPrompts);
    } else {
      setMiniPrompts(initialMiniPrompts);
    }
  }, [initialMiniPrompts, reset, setMiniPrompts]);

  const {
    workflowName,
    isActive,
    isPublic,
    includeMultiAgentChat,
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
    setLocalStages,
    setIsCreatingStage,
    setEditingStageId,
    setIsChatOpen,
    setViewingMiniPromptId,
    setIsSaving,
  } = useWorkflowConstructorStore();

  const {
    handleCreateStage,
    handleRemoveStage,
    handleRemoveMiniPrompt,
    handleEditStage,
    handleUpdateStage,
    handleDragEnd: handleMiniPromptDragEnd,
    handleReorderItems,
  } = useWorkflowHandlers();

  const { handleToolCall } = useWorkflowAIIntegration();

  const onDropMiniPrompts = (stageId: string, miniPromptIds: string[]) => {
    handleMiniPromptDragEnd(miniPromptIds, stageId, miniPrompts);
  };

  const handleSaveWorkflow = async () => {
    console.log('[WorkflowConstructorWrapper] Starting handleSaveWorkflow');
    console.log('[WorkflowConstructorWrapper] localStages:', localStages.length);
    console.log('[WorkflowConstructorWrapper] workflowName:', workflowName);

    setIsSaving(true);
    try {
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

      const workflowData = {
        name: workflowName,
        userId,
        isActive,
        complexity: undefined,
        visibility: isPublic ? 'PUBLIC' : 'PRIVATE' as 'PUBLIC' | 'PRIVATE',
        includeMultiAgentChat: false,
        tagIds: [],
        newTagNames: [],
        tempMiniPrompts: tempMiniPromptsData,
        stages: localStages.map((stage, index) => ({
          name: stage.name,
          description: stage.description ?? undefined,
          color: stage.color ?? undefined,
          order: index,
          withReview: stage.withReview,
          includeMultiAgentChat: stage.includeMultiAgentChat ?? false,
          miniPrompts: stage.miniPrompts.map((smp: typeof stage.miniPrompts[0], mpIndex: number) => ({
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
        alert(t('createFailed', { error: result.error || 'Unknown error' }));
      }
    } catch (error) {
      console.error('[WorkflowConstructorWrapper] Failed to create workflow:', error);
      console.error('[WorkflowConstructorWrapper] Error stack:', error instanceof Error ? error.stack : 'No stack');
      alert(t('createFailed', { error: error instanceof Error ? error.message : 'Unknown error' }));
    } finally {
      setIsSaving(false);
      console.log('[WorkflowConstructorWrapper] Finished handleSaveWorkflow');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#050508]">
      {/* Cyberpunk Header */}
      <div className="bg-[#0a0a0f]/95 backdrop-blur-md border-b border-cyan-500/30 px-6 py-4">
        <div className="flex items-center justify-between mb-3 gap-4">
          <div className="flex-1 min-w-0 max-w-4xl">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder={t('workflowNamePlaceholder')}
              className="text-2xl font-bold font-mono text-cyan-400 bg-transparent border-0 focus:outline-none focus:ring-0 px-0 w-full uppercase tracking-wider placeholder:text-cyan-500/30"
              style={{ textShadow: '0 0 10px #00ffff40' }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSaveWorkflow}
              disabled={isSaving || localStages.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            >
              {isSaving ? t('creating') : t('createWorkflow')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              id="new-workflow-active-checkbox"
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
            <span className={`text-xs font-mono uppercase tracking-wider ${isActive ? 'text-green-400' : 'text-cyan-100/40'}`}>
              {isActive ? t('active') : t('inactive')}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              id="new-workflow-public-checkbox"
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
            <span className={`text-xs font-mono uppercase tracking-wider ${isPublic ? 'text-purple-400' : 'text-cyan-100/40'}`}>
              {isPublic ? t('public') : t('private')}
            </span>
          </label>
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
                }}
                onMiniPromptDeleted={(deletedMiniPromptId) => {
                  setMiniPrompts(miniPrompts.filter(mp => mp.id !== deletedMiniPromptId));
                  
                  setLocalStages((prevStages) =>
                    prevStages.map((stage) => ({
                      ...stage,
                      miniPrompts: stage.miniPrompts.filter(
                        (smp: typeof stage.miniPrompts[0]) => smp.miniPromptId !== deletedMiniPromptId
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
                          includeMultiAgentChat: stage.includeMultiAgentChat ?? false,
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
                      onReorderItems={handleReorderItems}
                      onEditStage={handleEditStage}
                      onMiniPromptClick={(miniPrompt) => {
                        setViewingMiniPromptId(miniPrompt.id);
                      }}
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
                    className="w-full border-2 border-dashed border-cyan-500/30 p-6 text-center hover:border-cyan-400/50 hover:bg-cyan-500/5 transition-all cursor-pointer"
                    style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
                  >
                    <span className="text-cyan-400 font-mono uppercase tracking-wider">+ {t('addStage')}</span>
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
          }}
          mode="workflow"
          workflowContext={useMemo(() => {
            let currentMiniPrompt = undefined;
            if (viewingMiniPromptId) {
              let mp = miniPrompts.find((m) => m.id === viewingMiniPromptId);
              
              if (!mp) {
                for (const stage of localStages) {
                  const stageMp = stage.miniPrompts.find(
                    (smp: typeof stage.miniPrompts[0]) => smp.miniPrompt.id === viewingMiniPromptId
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
                foundInStages: !!localStages.some(s => s.miniPrompts.some((smp: typeof s.miniPrompts[0]) => smp.miniPrompt.id === viewingMiniPromptId)),
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
                  miniPrompts: stage.miniPrompts.map((smp: typeof stage.miniPrompts[0]) => ({
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
          <Tooltip content={t('aiAssistantTooltip')}>
            <button
              onClick={() => setIsChatOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-4 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-110 hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] cursor-pointer"
              aria-label={t('openAiAssistant')}
            >
              <Sparkles className="w-6 h-6" />
            </button>
          </Tooltip>
        </DraggableButton>
      </div>
    </div>
  );
}
