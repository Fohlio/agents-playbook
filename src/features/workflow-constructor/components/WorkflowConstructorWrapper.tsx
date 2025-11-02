'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import Button from '@/shared/ui/atoms/Button';
import Input from '@/shared/ui/atoms/Input';
import Toggle from '@/shared/ui/atoms/Toggle';
import type { MiniPrompt } from '@prisma/client';
import type { WorkflowStageWithMiniPrompts } from '@/lib/types/workflow-constructor-types';
import { useDragAndDrop } from '../hooks/use-drag-and-drop';
import { MiniPromptLibrary } from './MiniPromptLibrary';
import { StageSection } from './StageSection';
import { StageCreateForm } from './StageCreateForm';
import { GeneralSettings } from './GeneralSettings';
import { saveWorkflow } from '../actions/workflow-actions';
import { TagSelector } from '@/shared/ui/molecules/TagSelector';
import { Tooltip } from '@/shared/ui/molecules';
import { ChatSidebar } from '@/features/ai-assistant/components/ChatSidebar';
import { ExecutionPlanModal } from '@/features/ai-assistant/components/ExecutionPlanModal';
import { AIToolResult, ExecutionPlan } from '@/types/ai-chat';
import { Sparkles } from 'lucide-react';

interface WorkflowConstructorWrapperProps {
  userId: string;
  miniPrompts: MiniPrompt[];
}

export function WorkflowConstructorWrapper({ userId, miniPrompts: initialMiniPrompts }: WorkflowConstructorWrapperProps) {
  const router = useRouter();
  const {
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd: onDragEnd,
    handleDragCancel,
  } = useDragAndDrop();

  const [localStages, setLocalStages] = useState<WorkflowStageWithMiniPrompts[]>([]);
  const [miniPrompts, setMiniPrompts] = useState(initialMiniPrompts);
  const [isCreatingStage, setIsCreatingStage] = useState(false);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isActive, setIsActive] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [includeMultiAgentChat, setIncludeMultiAgentChat] = useState(false);

  // AI Assistant state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showExecutionPlan, setShowExecutionPlan] = useState(false);
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(null);

  // AI Assistant handlers
  const handleToolCall = useCallback((result: AIToolResult) => {
    // Handle different tool actions
    if (result.action === 'add_stage' && result.stage) {
      // Add a new stage
      const newStage: WorkflowStageWithMiniPrompts = {
        id: `temp-${Date.now()}`,
        workflowId: 'new',
        name: result.stage.name,
        description: result.stage.description || null,
        color: result.stage.color || '#6366f1',
        order: result.stage.position === -1 ? localStages.length : (result.stage.position ?? localStages.length),
        withReview: result.stage.withReview ?? true,
        createdAt: new Date(),
        miniPrompts: [],
      };

      // Insert at position
      const newStages = [...localStages];
      if (result.stage.position === -1 || result.stage.position === undefined) {
        newStages.push(newStage);
      } else {
        newStages.splice(result.stage.position, 0, newStage);
      }

      setLocalStages(newStages);
    } else if (result.action === 'modify_stage' && typeof result.stageIndex === 'number' && result.updates) {
      // Modify an existing stage
      setLocalStages(localStages.map((stage, idx) => {
        if (idx === result.stageIndex) {
          return {
            ...stage,
            ...(result.updates?.name ? { name: result.updates.name as string } : {}),
            ...(result.updates?.description !== undefined ? { description: result.updates.description as string | null } : {}),
            ...(result.updates?.color ? { color: result.updates.color as string } : {}),
            ...(result.updates?.withReview !== undefined ? { withReview: result.updates.withReview as boolean } : {}),
          };
        }
        return stage;
      }));
    } else if (result.action === 'remove_stage' && typeof result.stageIndex === 'number') {
      // Remove a stage
      setLocalStages(localStages.filter((_, idx) => idx !== result.stageIndex));
    } else if (result.workflow) {
      // Create complete workflow structure
      setWorkflowName(result.workflow.name);
      setIncludeMultiAgentChat(result.workflow.includeMultiAgentChat ?? false);

      const newStages: WorkflowStageWithMiniPrompts[] = result.workflow.stages.map((stage, stageIdx) => ({
        id: `temp-${Date.now()}-${stageIdx}`,
        workflowId: 'new',
        name: stage.name,
        description: stage.description || null,
        color: stage.color || '#6366f1',
        order: stageIdx,
        withReview: stage.withReview ?? true,
        createdAt: new Date(),
        miniPrompts: stage.miniPrompts.map((mp, mpIdx) => {
          // Check if this is an existing mini-prompt
          const existingMp = mp.id ? miniPrompts.find(m => m.id === mp.id) : null;

          if (existingMp) {
            return {
              stageId: `temp-${Date.now()}-${stageIdx}`,
              miniPromptId: existingMp.id,
              order: mpIdx,
              miniPrompt: existingMp,
            };
          } else {
            // Create new mini-prompt placeholder
            const newMp = {
              id: `new-${Date.now()}-${mpIdx}`,
              name: mp.name,
              description: mp.description || null,
              content: mp.content || '',
              userId,
              visibility: 'PRIVATE' as const,
              isActive: true,
              isSystemMiniPrompt: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            // Add to mini-prompts list
            setMiniPrompts(prev => [...prev, newMp]);

            return {
              stageId: `temp-${Date.now()}-${stageIdx}`,
              miniPromptId: newMp.id,
              order: mpIdx,
              miniPrompt: newMp,
            };
          }
        }),
      }));

      setLocalStages(newStages);
    }
  }, [localStages, miniPrompts, userId]);

  const handleApproveExecutionPlan = useCallback(() => {
    setShowExecutionPlan(false);
    setExecutionPlan(null);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      onDragEnd();
      const { active, over } = event;

      if (!over) return;

      const miniPromptId = active.id as string;
      const stageId = over.id as string;

      const stage = localStages.find((s) => s.id === stageId);
      if (!stage) return;

      const alreadyExists = stage.miniPrompts.some(
        (smp) => smp.miniPromptId === miniPromptId
      );
      if (alreadyExists) return;

      const miniPrompt = miniPrompts.find((mp) => mp.id === miniPromptId);
      if (!miniPrompt) return;

      const newStages = localStages.map((s) => {
        if (s.id === stageId) {
          return {
            ...s,
            miniPrompts: [
              ...s.miniPrompts,
              {
                stageId: s.id,
                miniPromptId,
                order: s.miniPrompts.length,
                miniPrompt,
              },
            ],
          };
        }
        return s;
      });

      setLocalStages(newStages);
    },
    [localStages, miniPrompts, onDragEnd]
  );

  const handleCreateStage = useCallback(
    (name: string, description: string, color: string, withReview: boolean) => {
      const newStage: WorkflowStageWithMiniPrompts = {
        id: `temp-${Date.now()}`,
        workflowId: 'new',
        name,
        description: description || null,
        color,
        order: localStages.length,
        withReview,
        createdAt: new Date(),
        miniPrompts: [],
      };

      setLocalStages([...localStages, newStage]);
      setIsCreatingStage(false);
    },
    [localStages]
  );

  const handleRemoveStage = useCallback(
    (stageId: string) => {
      setLocalStages(localStages.filter((s) => s.id !== stageId));
    },
    [localStages]
  );

  const handleRemoveMiniPrompt = useCallback(
    (stageId: string, miniPromptId: string) => {
      setLocalStages(
        localStages.map((stage) => {
          if (stage.id === stageId) {
            return {
              ...stage,
              miniPrompts: stage.miniPrompts.filter(
                (smp) => smp.miniPromptId !== miniPromptId
              ),
            };
          }
          return stage;
        })
      );
    },
    [localStages]
  );

  const handleEditMiniPrompt = useCallback((miniPromptId: string) => {
    // Open mini-prompt in new tab for editing
    window.open(`/dashboard/library?editMiniPrompt=${miniPromptId}`, '_blank');
  }, []);

  const handleToggleWithReview = useCallback(
    (stageId: string, withReview: boolean) => {
      setLocalStages(
        localStages.map((stage) => {
          if (stage.id === stageId) {
            return {
              ...stage,
              withReview,
            };
          }
          return stage;
        })
      );
    },
    [localStages]
  );

  const handleEditStage = useCallback(
    (stageId: string) => {
      setEditingStageId(stageId);
      setIsCreatingStage(false);
    },
    []
  );

  const handleUpdateStage = useCallback(
    (name: string, description: string, color: string, withReview: boolean) => {
      if (!editingStageId) return;

      setLocalStages(
        localStages.map((s) => {
          if (s.id === editingStageId) {
            return {
              ...s,
              name: name.trim(),
              description: description.trim() || null,
              color,
              withReview,
            };
          }
          return s;
        })
      );
      setEditingStageId(null);
    },
    [editingStageId, localStages]
  );

  const handleSaveWorkflow = useCallback(async () => {
    setIsSaving(true);
    try {
      // First create the workflow
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: workflowName,
          isActive,
          tagIds: selectedTagIds,
        }),
      });
      const workflow = await response.json();

      // Then save all stages
      await saveWorkflow({
        workflowId: workflow.id,
        name: workflowName,
        isActive: isActive,
        includeMultiAgentChat,
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

      // Redirect to the library
      router.push('/dashboard/library');
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  }, [userId, workflowName, isActive, selectedTagIds, localStages, router, includeMultiAgentChat]);

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-surface-base border-b border-border-base px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <Input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Workflow name"
              className="text-2xl font-bold text-text-primary bg-transparent border-b-2 border-transparent hover:border-border-hover focus:border-accent-primary focus:outline-none transition-colors w-full max-w-md"
            />
          </div>
          <div className="flex gap-3 items-center">
            <GeneralSettings
              includeMultiAgentChat={includeMultiAgentChat}
              onChange={setIncludeMultiAgentChat}
              compact
            />
            <Toggle
              checked={isActive}
              onChange={setIsActive}
              label={isActive ? 'Active' : 'Inactive'}
              testId="workflow-active-toggle"
            />
            <Button
              variant="primary"
              onClick={handleSaveWorkflow}
              disabled={isSaving || !workflowName.trim()}
              testId="save-workflow"
            >
              {isSaving ? 'Saving...' : 'Save Workflow'}
            </Button>
          </div>
        </div>
        <div className="max-w-2xl">
          <label className="block text-sm font-medium text-text-primary mb-2">
            Tags
          </label>
          <TagSelector
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
            allowCreate
            onCreateTag={async (name, color) => {
              try {
                const response = await fetch('/api/tags', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, color })
                });
                if (response.ok) {
                  return await response.json();
                } else {
                  const error = await response.json();
                  alert(error.error || 'Failed to create tag');
                  return null;
                }
              } catch {
                alert('Failed to create tag');
                return null;
              }
            }}
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
      </div>

      {/* AI Assistant Chat Sidebar */}
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        mode="workflow"
        onToolCall={handleToolCall}
      />

      {/* Execution Plan Modal */}
      <ExecutionPlanModal
        isOpen={showExecutionPlan}
        onClose={() => setShowExecutionPlan(false)}
        onApprove={handleApproveExecutionPlan}
        executionPlan={executionPlan}
      />

      {/* Floating AI Assistant Button */}
      <Tooltip content="Get AI help to create this workflow">
        <Button
          variant="primary"
          onClick={() => setIsChatOpen(true)}
          className="!fixed bottom-8 right-8 !rounded-full !p-4 !w-14 !h-14 shadow-2xl hover:shadow-primary-500/50 z-50 transition-all hover:scale-110"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="w-6 h-6" />
        </Button>
      </Tooltip>
    </div>
  );
}
