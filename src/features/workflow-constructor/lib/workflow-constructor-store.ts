import { create } from 'zustand';
import { WorkflowComplexity, MiniPrompt } from '@prisma/client';
import type { WorkflowStageWithMiniPrompts } from '@/lib/types/workflow-constructor-types';

interface WorkflowConstructorState {
  // Workflow metadata
  workflowId: string | null;
  workflowName: string;
  workflowDescription: string | null;
  complexity: WorkflowComplexity | null;
  isActive: boolean;
  isPublic: boolean;
  includeMultiAgentChat: boolean;
  selectedTagIds: string[];

  // Workflow structure
  localStages: WorkflowStageWithMiniPrompts[];
  miniPrompts: MiniPrompt[];

  // UI state
  isCreatingStage: boolean;
  editingStageId: string | null;
  viewingMiniPromptId: string | null;
  isChatOpen: boolean;
  isDirty: boolean;
  isSaving: boolean;

  // Actions - Workflow metadata
  setWorkflowId: (id: string | null) => void;
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (description: string | null) => void;
  setComplexity: (complexity: WorkflowComplexity | null) => void;
  setIsActive: (isActive: boolean) => void;
  setIsPublic: (isPublic: boolean) => void;
  setIncludeMultiAgentChat: (include: boolean) => void;
  setSelectedTagIds: (tagIds: string[]) => void;

  // Actions - Workflow structure
  setLocalStages: (stages: WorkflowStageWithMiniPrompts[] | ((prev: WorkflowStageWithMiniPrompts[]) => WorkflowStageWithMiniPrompts[])) => void;
  setMiniPrompts: (miniPrompts: MiniPrompt[] | ((prev: MiniPrompt[]) => MiniPrompt[])) => void;

  // Actions - UI state
  setIsCreatingStage: (isCreating: boolean) => void;
  setEditingStageId: (stageId: string | null) => void;
  setViewingMiniPromptId: (miniPromptId: string | null) => void;
  setIsChatOpen: (isOpen: boolean) => void;
  markDirty: () => void;
  markClean: () => void;
  setIsSaving: (isSaving: boolean) => void;

  // Actions - Stage operations
  addStage: (stage: WorkflowStageWithMiniPrompts) => void;
  removeStage: (stageId: string) => void;
  updateStage: (stageId: string, updates: Partial<WorkflowStageWithMiniPrompts>) => void;

  // Actions - Mini-prompt operations
  addMiniPromptToStage: (stageId: string, miniPrompt: MiniPrompt) => void;
  removeMiniPromptFromStage: (stageId: string, miniPromptId: string) => void;

  // Actions - Reset
  reset: () => void;
  initializeFromWorkflow: (workflow: {
    id: string;
    name: string;
    description: string | null;
    complexity: WorkflowComplexity | null;
    isActive: boolean;
    visibility: string;
    includeMultiAgentChat: boolean;
    stages: WorkflowStageWithMiniPrompts[];
    tags?: Array<{ tag: { id: string } }>;
  }, miniPrompts: MiniPrompt[]) => void;
}

const initialState = {
  workflowId: null,
  workflowName: 'Untitled Workflow',
  workflowDescription: null,
  complexity: null,
  isActive: false,
  isPublic: false,
  includeMultiAgentChat: false,
  selectedTagIds: [],
  localStages: [],
  miniPrompts: [],
  isCreatingStage: false,
  editingStageId: null,
  viewingMiniPromptId: null,
  isChatOpen: false,
  isDirty: false,
  isSaving: false,
};

export const useWorkflowConstructorStore = create<WorkflowConstructorState>((set) => ({
  ...initialState,

  // Workflow metadata actions
  setWorkflowId: (id) => set({ workflowId: id }),
  setWorkflowName: (name) => set({ workflowName: name }),
  setWorkflowDescription: (description) => set({ workflowDescription: description }),
  setComplexity: (complexity) => set({ complexity }),
  setIsActive: (isActive) => set({ isActive }),
  setIsPublic: (isPublic) => set({ isPublic }),
  setIncludeMultiAgentChat: (include) => set({ includeMultiAgentChat: include }),
  setSelectedTagIds: (tagIds) => set({ selectedTagIds: tagIds }),

  // Workflow structure actions
  setLocalStages: (stages) =>
    set((state) => ({
      localStages: typeof stages === 'function' ? stages(state.localStages) : stages,
    })),
  setMiniPrompts: (miniPrompts) =>
    set((state) => ({
      miniPrompts: typeof miniPrompts === 'function' ? miniPrompts(state.miniPrompts) : miniPrompts,
    })),

  // UI state actions
  setIsCreatingStage: (isCreating) => set({ isCreatingStage: isCreating }),
  setEditingStageId: (stageId) => set({ editingStageId: stageId }),
  setViewingMiniPromptId: (miniPromptId) => set({ viewingMiniPromptId: miniPromptId }),
  setIsChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
  setIsSaving: (isSaving) => set({ isSaving }),

  // Stage operations
  addStage: (stage) =>
    set((state) => ({
      localStages: [...state.localStages, stage],
      isDirty: true,
    })),
  removeStage: (stageId) =>
    set((state) => ({
      localStages: state.localStages.filter((s) => s.id !== stageId),
      isDirty: true,
    })),
  updateStage: (stageId, updates) =>
    set((state) => ({
      localStages: state.localStages.map((s) =>
        s.id === stageId ? { ...s, ...updates } : s
      ),
      isDirty: true,
    })),

  // Mini-prompt operations
  addMiniPromptToStage: (stageId, miniPrompt) =>
    set((state) => ({
      localStages: state.localStages.map((stage) => {
        if (stage.id === stageId) {
          const alreadyExists = stage.miniPrompts.some(
            (smp) => smp.miniPromptId === miniPrompt.id
          );
          if (alreadyExists) return stage;

          return {
            ...stage,
            miniPrompts: [
              ...stage.miniPrompts,
              {
                stageId: stage.id,
                miniPromptId: miniPrompt.id,
                order: stage.miniPrompts.length,
                miniPrompt,
              },
            ],
          };
        }
        return stage;
      }),
      isDirty: true,
    })),
  removeMiniPromptFromStage: (stageId, miniPromptId) =>
    set((state) => ({
      localStages: state.localStages.map((stage) => {
        if (stage.id === stageId) {
          return {
            ...stage,
            miniPrompts: stage.miniPrompts.filter(
              (smp) => smp.miniPromptId !== miniPromptId
            ),
          };
        }
        return stage;
      }),
      isDirty: true,
    })),

  // Reset - preserve UI state (isChatOpen, viewingMiniPromptId) to avoid closing modals
  reset: () => set((state) => ({
    ...initialState,
    // Preserve UI state to prevent modal from closing unexpectedly
    isChatOpen: state.isChatOpen,
    viewingMiniPromptId: state.viewingMiniPromptId,
  })),
  initializeFromWorkflow: (workflow, miniPrompts) =>
    set({
      workflowId: workflow.id,
      workflowName: workflow.name,
      workflowDescription: workflow.description,
      complexity: workflow.complexity,
      isActive: workflow.isActive,
      isPublic: workflow.visibility === 'PUBLIC',
      includeMultiAgentChat: workflow.includeMultiAgentChat,
      selectedTagIds: workflow.tags?.map((t) => t.tag.id) ?? [],
      localStages: workflow.stages ?? [],
      miniPrompts,
      isDirty: false,
    }),
}));
