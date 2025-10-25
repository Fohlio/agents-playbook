'use client';

import { useState, useCallback } from 'react';
import type {
  WorkflowWithStages,
  SaveWorkflowInput,
} from '@/lib/types/workflow-constructor-types';
import { saveWorkflow } from '../actions/workflow-actions';

interface WorkflowBuilderState {
  workflow: WorkflowWithStages | null;
  isDirty: boolean;
  isSaving: boolean;
}

export function useWorkflowConstructor(initialWorkflow: WorkflowWithStages | null) {
  const [state, setState] = useState<WorkflowBuilderState>({
    workflow: initialWorkflow,
    isDirty: false,
    isSaving: false,
  });

  const setWorkflow = useCallback((workflow: WorkflowWithStages) => {
    setState((prev) => ({
      ...prev,
      workflow,
      isDirty: true,
    }));
  }, []);

  const handleSave = useCallback(async (input: SaveWorkflowInput) => {
    setState((prev) => ({ ...prev, isSaving: true }));
    try {
      const savedWorkflow = await saveWorkflow(input);
      setState({
        workflow: savedWorkflow,
        isDirty: false,
        isSaving: false,
      });
      return savedWorkflow;
    } catch (error) {
      setState((prev) => ({ ...prev, isSaving: false }));
      throw error;
    }
  }, []);

  const markDirty = useCallback(() => {
    setState((prev) => ({ ...prev, isDirty: true }));
  }, []);

  const resetDirty = useCallback(() => {
    setState((prev) => ({ ...prev, isDirty: false }));
  }, []);

  return {
    workflow: state.workflow,
    isDirty: state.isDirty,
    isSaving: state.isSaving,
    setWorkflow,
    handleSave,
    markDirty,
    resetDirty,
  };
}
