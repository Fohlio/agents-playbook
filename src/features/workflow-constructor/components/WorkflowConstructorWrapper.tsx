'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import Button from '@/shared/ui/atoms/Button';
import Input from '@/shared/ui/atoms/Input';
import type { MiniPrompt } from '@prisma/client';
import type { WorkflowStageWithMiniPrompts } from '@/lib/types/workflow-constructor-types';
import { useDragAndDrop } from '../hooks/use-drag-and-drop';
import { MiniPromptLibrary } from './MiniPromptLibrary';
import { StageSection } from './StageSection';
import { StageCreateForm } from './StageCreateForm';
import { saveWorkflow } from '../actions/workflow-actions';
import { ROUTES } from '@/shared/routes';

interface WorkflowConstructorWrapperProps {
  userId: string;
  miniPrompts: MiniPrompt[];
}

export function WorkflowConstructorWrapper({ userId, miniPrompts: initialMiniPrompts }: WorkflowConstructorWrapperProps) {
  const router = useRouter();
  const {
    sensors,
    activeId,
    handleDragStart,
    handleDragOver,
    handleDragEnd: onDragEnd,
    handleDragCancel,
  } = useDragAndDrop();

  const [localStages, setLocalStages] = useState<WorkflowStageWithMiniPrompts[]>([]);
  const [miniPrompts, setMiniPrompts] = useState(initialMiniPrompts);
  const [isCreatingStage, setIsCreatingStage] = useState(false);
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    (name: string, description: string, color: string) => {
      const newStage: WorkflowStageWithMiniPrompts = {
        id: `temp-${Date.now()}`,
        workflowId: 'new',
        name,
        description: description || null,
        color,
        order: localStages.length,
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
        }),
      });
      const workflow = await response.json();

      // Then save all stages
      await saveWorkflow({
        workflowId: workflow.id,
        name: workflowName,
        isActive: isActive,
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

      // Redirect to the workflow list
      router.push(ROUTES.WORKFLOWS.LIST);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  }, [userId, workflowName, isActive, localStages, router]);

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-surface-base border-b border-border-base px-6 py-4 flex items-center justify-between">
        <div className="flex-1">
          <Input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Workflow name"
            className="text-2xl font-bold text-text-primary bg-transparent border-b-2 border-transparent hover:border-border-hover focus:border-accent-primary focus:outline-none transition-colors w-full max-w-md"
          />
          <p className="text-sm text-text-secondary mt-1">
            Workflow Constructor
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            <span className="ms-3 text-sm font-medium text-text-primary">
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </label>
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
