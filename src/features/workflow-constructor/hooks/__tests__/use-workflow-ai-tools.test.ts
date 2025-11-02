import { renderHook, act } from '@testing-library/react';
import { useWorkflowAITools } from '../use-workflow-ai-tools';
import type { WorkflowStageWithMiniPrompts } from '@/lib/types/workflow-constructor-types';

describe('useWorkflowAITools', () => {
  const mockMarkDirty = jest.fn();
  const mockSetLocalStages = jest.fn();
  const mockSetWorkflowName = jest.fn();
  const mockSetComplexity = jest.fn();
  const mockSetIncludeMultiAgentChat = jest.fn();
  const mockSetIsPublic = jest.fn();

  const mockStages: WorkflowStageWithMiniPrompts[] = [
    {
      id: 'stage-1',
      workflowId: 'workflow-1',
      name: 'Analysis',
      description: 'Analysis stage',
      color: '#3B82F6',
      withReview: true,
      order: 0,
      miniPrompts: [
        {
          stageId: 'stage-1',
          miniPromptId: 'mp-1',
          order: 0,
          miniPrompt: {
            id: 'mp-1',
            name: 'Requirements',
            description: 'Gather requirements',
            content: '# Requirements',
          },
        },
        {
          stageId: 'stage-1',
          miniPromptId: 'mp-2',
          order: 1,
          miniPrompt: {
            id: 'mp-2',
            name: 'Analysis',
            description: 'Analyze requirements',
            content: '# Analysis',
          },
        },
      ],
    },
    {
      id: 'stage-2',
      workflowId: 'workflow-1',
      name: 'Implementation',
      description: 'Implementation stage',
      color: '#10B981',
      withReview: false,
      order: 1,
      miniPrompts: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('modify_stage action', () => {
    it('should modify stage by stageId', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: true,
          action: 'modify_stage',
          stageId: 'stage-1',
          updates: {
            name: 'Updated Analysis',
            description: 'Updated description',
          },
        });
      });

      expect(mockSetLocalStages).toHaveBeenCalledTimes(1);
      const updatedStages = mockSetLocalStages.mock.calls[0][0];
      expect(updatedStages[0].name).toBe('Updated Analysis');
      expect(updatedStages[0].description).toBe('Updated description');
      expect(mockMarkDirty).toHaveBeenCalledTimes(1);
    });

    it('should modify stage by stagePosition', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: true,
          action: 'modify_stage',
          stagePosition: 1,
          updates: {
            withReview: true,
            color: '#EF4444',
          },
        });
      });

      expect(mockSetLocalStages).toHaveBeenCalledTimes(1);
      const updatedStages = mockSetLocalStages.mock.calls[0][0];
      expect(updatedStages[1].withReview).toBe(true);
      expect(updatedStages[1].color).toBe('#EF4444');
      expect(mockMarkDirty).toHaveBeenCalledTimes(1);
    });

    it('should replace mini-prompts when provided in updates', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: true,
          action: 'modify_stage',
          stagePosition: 0,
          updates: {
            miniPrompts: [
              {
                id: 'existing-mp',
                name: 'Existing Prompt',
              },
              {
                name: 'New Prompt',
                content: '# New Content',
              },
            ],
          },
        });
      });

      expect(mockSetLocalStages).toHaveBeenCalledTimes(1);
      const updatedStages = mockSetLocalStages.mock.calls[0][0];
      expect(updatedStages[0].miniPrompts).toHaveLength(2);
      expect(updatedStages[0].miniPrompts[0].miniPromptId).toBe('existing-mp');
      expect(updatedStages[0].miniPrompts[1].miniPrompt.name).toBe('New Prompt');
    });
  });

  describe('modify_mini_prompt action', () => {
    it('should modify mini-prompt by miniPromptId', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: true,
          action: 'modify_mini_prompt',
          miniPromptId: 'mp-1',
          updates: {
            name: 'Updated Requirements',
            content: '# Updated Requirements Content',
          },
        });
      });

      expect(mockSetLocalStages).toHaveBeenCalledTimes(1);
      const updatedStages = mockSetLocalStages.mock.calls[0][0];
      expect(updatedStages[0].miniPrompts[0].miniPrompt.name).toBe('Updated Requirements');
      expect(updatedStages[0].miniPrompts[0].miniPrompt.content).toBe('# Updated Requirements Content');
      expect(mockMarkDirty).toHaveBeenCalledTimes(1);
    });

    it('should modify mini-prompt by stagePosition and miniPromptPosition', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: true,
          action: 'modify_mini_prompt',
          stagePosition: 0,
          miniPromptPosition: 1,
          updates: {
            description: 'Updated analysis description',
          },
        });
      });

      expect(mockSetLocalStages).toHaveBeenCalledTimes(1);
      const updatedStages = mockSetLocalStages.mock.calls[0][0];
      expect(updatedStages[0].miniPrompts[1].miniPrompt.description).toBe('Updated analysis description');
      expect(mockMarkDirty).toHaveBeenCalledTimes(1);
    });
  });

  describe('update_workflow_settings action', () => {
    it('should update workflow name', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: true,
          action: 'update_workflow_settings',
          updates: {
            name: 'New Workflow Name',
          },
        });
      });

      expect(mockSetWorkflowName).toHaveBeenCalledWith('New Workflow Name');
      expect(mockMarkDirty).toHaveBeenCalledTimes(1);
    });

    it('should update workflow complexity', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: true,
          action: 'update_workflow_settings',
          updates: {
            complexity: 'XL',
          },
        });
      });

      expect(mockSetComplexity).toHaveBeenCalledWith('XL');
      expect(mockMarkDirty).toHaveBeenCalledTimes(1);
    });

    it('should update includeMultiAgentChat', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: true,
          action: 'update_workflow_settings',
          updates: {
            includeMultiAgentChat: true,
          },
        });
      });

      expect(mockSetIncludeMultiAgentChat).toHaveBeenCalledWith(true);
      expect(mockMarkDirty).toHaveBeenCalledTimes(1);
    });

    it('should update visibility', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: true,
          action: 'update_workflow_settings',
          updates: {
            visibility: 'PUBLIC',
          },
        });
      });

      expect(mockSetIsPublic).toHaveBeenCalledWith(true);
      expect(mockMarkDirty).toHaveBeenCalledTimes(1);
    });

    it('should update multiple settings at once', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: true,
          action: 'update_workflow_settings',
          updates: {
            name: 'Comprehensive Update',
            complexity: 'M',
            includeMultiAgentChat: false,
            visibility: 'PRIVATE',
          },
        });
      });

      expect(mockSetWorkflowName).toHaveBeenCalledWith('Comprehensive Update');
      expect(mockSetComplexity).toHaveBeenCalledWith('M');
      expect(mockSetIncludeMultiAgentChat).toHaveBeenCalledWith(false);
      expect(mockSetIsPublic).toHaveBeenCalledWith(false);
      expect(mockMarkDirty).toHaveBeenCalledTimes(1);
    });
  });

  describe('add_stage action', () => {
    it('should add new stage at end when no position specified', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: true,
          action: 'add_stage',
          stage: {
            name: 'Testing',
            description: 'Testing stage',
            color: '#F59E0B',
            withReview: true,
            miniPrompts: [
              {
                name: 'Unit Tests',
                content: '# Unit Tests',
              },
            ],
          },
        });
      });

      expect(mockSetLocalStages).toHaveBeenCalledTimes(1);
      const updatedStages = mockSetLocalStages.mock.calls[0][0];
      expect(updatedStages).toHaveLength(3);
      expect(updatedStages[2].name).toBe('Testing');
      expect(updatedStages[2].miniPrompts).toHaveLength(1);
      expect(mockMarkDirty).toHaveBeenCalledTimes(1);
    });

    it('should add new stage at specific position', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: true,
          action: 'add_stage',
          stage: {
            name: 'Design',
            description: 'Design stage',
            position: 1,
            miniPrompts: [],
          },
        });
      });

      expect(mockSetLocalStages).toHaveBeenCalledTimes(1);
      const updatedStages = mockSetLocalStages.mock.calls[0][0];
      expect(updatedStages).toHaveLength(3);
      expect(updatedStages[1].name).toBe('Design');
      expect(mockMarkDirty).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove_stage action', () => {
    it('should remove stage by stagePosition', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: true,
          action: 'remove_stage',
          stagePosition: 0,
        });
      });

      expect(mockSetLocalStages).toHaveBeenCalledTimes(1);
      const updatedStages = mockSetLocalStages.mock.calls[0][0];
      expect(updatedStages).toHaveLength(1);
      expect(updatedStages[0].name).toBe('Implementation');
      expect(mockMarkDirty).toHaveBeenCalledTimes(1);
    });

    it('should remove stage by stageId', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: true,
          action: 'remove_stage',
          stageId: 'stage-1',
        });
      });

      expect(mockSetLocalStages).toHaveBeenCalledTimes(1);
      const updatedStages = mockSetLocalStages.mock.calls[0][0];
      expect(updatedStages).toHaveLength(1);
      expect(updatedStages[0].id).toBe('stage-2');
      expect(mockMarkDirty).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should not process result when success is false', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: false,
          action: 'modify_stage',
          updates: { name: 'Should Not Update' },
        });
      });

      expect(mockSetLocalStages).not.toHaveBeenCalled();
      expect(mockMarkDirty).not.toHaveBeenCalled();
    });

    it('should handle deprecated stageIndex parameter', () => {
      const { result } = renderHook(() =>
        useWorkflowAITools({
          localStages: mockStages,
          setLocalStages: mockSetLocalStages,
          setWorkflowName: mockSetWorkflowName,
          setComplexity: mockSetComplexity,
          setIncludeMultiAgentChat: mockSetIncludeMultiAgentChat,
          setIsPublic: mockSetIsPublic,
          markDirty: mockMarkDirty,
        })
      );

      act(() => {
        result.current.handleToolResult({
          success: true,
          action: 'modify_stage',
          stageIndex: 1, // Deprecated parameter
          updates: { name: 'Using Deprecated Param' },
        });
      });

      expect(mockSetLocalStages).toHaveBeenCalledTimes(1);
      const updatedStages = mockSetLocalStages.mock.calls[0][0];
      expect(updatedStages[1].name).toBe('Using Deprecated Param');
    });
  });
});
