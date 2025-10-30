'use client';

import { useState, useCallback } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import Button from '@/shared/ui/atoms/Button';
import Input from '@/shared/ui/atoms/Input';
import Toggle from '@/shared/ui/atoms/Toggle';
import type {
  WorkflowConstructorData,
  WorkflowStageWithMiniPrompts,
} from '@/lib/types/workflow-constructor-types';
import { useDragAndDrop } from '../hooks/use-drag-and-drop';
import { useWorkflowConstructor } from '../hooks/use-workflow-constructor';
import { MiniPromptLibrary } from './MiniPromptLibrary';
import { StageSection } from './StageSection';
import { StageCreateForm } from './StageCreateForm';
import { TagSelector } from '@/shared/ui/molecules/TagSelector';

interface WorkflowConstructorProps {
  data: WorkflowConstructorData;
}

export function WorkflowConstructor({ data }: WorkflowConstructorProps) {
  const { workflow, miniPrompts: initialMiniPrompts } = data;
  const { workflow: currentWorkflow, isDirty, isSaving, handleSave, markDirty } =
    useWorkflowConstructor(workflow);

  const {
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd: onDragEnd,
    handleDragCancel,
  } = useDragAndDrop();

  const [localStages, setLocalStages] = useState<WorkflowStageWithMiniPrompts[]>(
    currentWorkflow?.stages ?? []
  );

  const [miniPrompts, setMiniPrompts] = useState(initialMiniPrompts);
  const [isCreatingStage, setIsCreatingStage] = useState(false);
  const [workflowName, setWorkflowName] = useState(currentWorkflow?.name ?? 'Untitled Workflow');
  const [isActive, setIsActive] = useState(currentWorkflow?.isActive ?? false);
  const [isPublic, setIsPublic] = useState(currentWorkflow?.visibility === 'PUBLIC');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    currentWorkflow?.tags?.map((t: any) => t.tag.id) ?? []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      onDragEnd();
      const { active, over } = event;

      if (!over || !currentWorkflow) return;

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
      markDirty();
    },
    [currentWorkflow, localStages, miniPrompts, onDragEnd, markDirty]
  );

  const handleCreateStage = useCallback(
    (name: string, description: string, color: string) => {
      if (!currentWorkflow) return;

      const newStage: WorkflowStageWithMiniPrompts = {
        id: `temp-${Date.now()}`,
        workflowId: currentWorkflow.id,
        name,
        description: description || null,
        color,
        order: localStages.length,
        createdAt: new Date(),
        miniPrompts: [],
      };

      setLocalStages([...localStages, newStage]);
      setIsCreatingStage(false);
      markDirty();
    },
    [currentWorkflow, localStages, markDirty]
  );

  const handleRemoveStage = useCallback(
    (stageId: string) => {
      setLocalStages(localStages.filter((s) => s.id !== stageId));
      markDirty();
    },
    [localStages, markDirty]
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
      markDirty();
    },
    [localStages, markDirty]
  );

  const handleSaveWorkflow = useCallback(async () => {
    if (!currentWorkflow) return;

    await handleSave({
      workflowId: currentWorkflow.id,
      name: workflowName,
      description: currentWorkflow.description ?? undefined,
      isActive: isActive,
      visibility: isPublic ? 'PUBLIC' : 'PRIVATE',
      tagIds: selectedTagIds,
      stages: localStages.map((stage, index) => ({
        name: stage.name,
        description: stage.description ?? undefined,
        color: stage.color ?? undefined,
        order: index,
        miniPrompts: stage.miniPrompts.map((smp, mpIndex) => ({
          miniPromptId: smp.miniPromptId,
          order: mpIndex,
        })),
      })),
    });
  }, [currentWorkflow, workflowName, isActive, isPublic, selectedTagIds, localStages, handleSave]);

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
              placeholder="Workflow name"
              className="text-2xl font-bold text-text-primary bg-transparent border-b-2 border-transparent hover:border-border-hover focus:border-accent-primary focus:outline-none transition-colors w-full max-w-md"
            />
          </div>
          <div className="flex gap-3 items-center">
            <Toggle
              checked={isActive}
              onChange={(checked) => {
                setIsActive(checked);
                markDirty();
              }}
              label={isActive ? 'Active' : 'Inactive'}
              testId="workflow-active-toggle"
            />
            <Toggle
              checked={isPublic}
              onChange={(checked) => {
                setIsPublic(checked);
                markDirty();
              }}
              label={isPublic ? 'Public' : 'Private'}
              testId="workflow-public-toggle"
            />
            <Button
              variant="secondary"
              onClick={() => setLocalStages(currentWorkflow.stages)}
              disabled={!isDirty}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveWorkflow}
            disabled={!isDirty || isSaving}
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
            onChange={(tagIds) => {
              setSelectedTagIds(tagIds);
              markDirty();
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
                {localStages.map((stage) => (
                  <StageSection
                    key={stage.id}
                    stage={stage}
                    onRemoveStage={handleRemoveStage}
                    onRemoveMiniPrompt={handleRemoveMiniPrompt}
                  />
                ))}

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
    </div>
  );
}
