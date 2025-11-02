import { describe, it, expect } from '@jest/globals';
import { workflowTools } from '@/lib/ai-tools/workflow-tools';

describe('Enhanced Workflow AI Tools', () => {
  describe('modifyStage - position-based identification', () => {
    it('should modify stage by stageId', async () => {
      const input = {
        stageId: 'stage-123',
        updates: {
          name: 'Updated Stage Name',
          description: 'Updated description',
        },
      };

      const result = await workflowTools.modifyStage.execute(input, {
        messages: [],
        toolCallId: 'test-1',
        toolName: 'modifyStage',
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('modify_stage');
      expect(result.stageId).toBe('stage-123');
      expect(result.stagePosition).toBeUndefined();
      expect(result.updates).toEqual(input.updates);
      expect(result.message).toContain('stage-123');
    });

    it('should modify stage by stagePosition', async () => {
      const input = {
        stagePosition: 2,
        updates: {
          name: 'Third Stage',
          withReview: false,
        },
      };

      const result = await workflowTools.modifyStage.execute(input, {
        messages: [],
        toolCallId: 'test-2',
        toolName: 'modifyStage',
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('modify_stage');
      expect(result.stageId).toBeUndefined();
      expect(result.stagePosition).toBe(2);
      expect(result.updates).toEqual(input.updates);
      expect(result.message).toContain('position 2');
    });

    it('should throw error when no identifier provided', async () => {
      const input = {
        updates: {
          name: 'Updated Stage',
        },
      };

      await expect(
        workflowTools.modifyStage.execute(input, {
          messages: [],
          toolCallId: 'test-3',
          toolName: 'modifyStage',
        })
      ).rejects.toThrow('Either stageId or stagePosition must be provided');
    });

    it('should modify stage with all update fields', async () => {
      const input = {
        stagePosition: 0,
        updates: {
          name: 'Comprehensive Update',
          description: 'All fields updated',
          color: '#FF5733',
          withReview: true,
          miniPrompts: [
            {
              id: 'existing-123',
              name: 'Existing Mini-Prompt',
            },
            {
              name: 'New Mini-Prompt',
              content: '# New Content',
            },
          ],
        },
      };

      const result = await workflowTools.modifyStage.execute(input, {
        messages: [],
        toolCallId: 'test-4',
        toolName: 'modifyStage',
      });

      expect(result.success).toBe(true);
      expect(result.updates.miniPrompts).toHaveLength(2);
      expect(result.updates.color).toBe('#FF5733');
    });
  });

  describe('modifyMiniPrompt - position-based identification', () => {
    it('should modify mini-prompt by miniPromptId', async () => {
      const input = {
        miniPromptId: 'prompt-456',
        updates: {
          name: 'Updated Prompt',
          content: '# Updated Content',
        },
      };

      const result = await workflowTools.modifyMiniPrompt.execute(input, {
        messages: [],
        toolCallId: 'test-5',
        toolName: 'modifyMiniPrompt',
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('modify_mini_prompt');
      expect(result.miniPromptId).toBe('prompt-456');
      expect(result.stagePosition).toBeUndefined();
      expect(result.miniPromptPosition).toBeUndefined();
      expect(result.updates).toEqual(input.updates);
      expect(result.message).toContain('prompt-456');
    });

    it('should modify mini-prompt by stagePosition and miniPromptPosition', async () => {
      const input = {
        stagePosition: 1,
        miniPromptPosition: 3,
        updates: {
          content: '# Modified Content',
          description: 'Updated via position',
        },
      };

      const result = await workflowTools.modifyMiniPrompt.execute(input, {
        messages: [],
        toolCallId: 'test-6',
        toolName: 'modifyMiniPrompt',
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('modify_mini_prompt');
      expect(result.miniPromptId).toBeUndefined();
      expect(result.stagePosition).toBe(1);
      expect(result.miniPromptPosition).toBe(3);
      expect(result.updates).toEqual(input.updates);
      expect(result.message).toContain('stage 1');
      expect(result.message).toContain('position 3');
    });

    it('should throw error when miniPromptId missing and positions incomplete', async () => {
      const input = {
        stagePosition: 1,
        // Missing miniPromptPosition
        updates: {
          content: '# Content',
        },
      };

      await expect(
        workflowTools.modifyMiniPrompt.execute(input, {
          messages: [],
          toolCallId: 'test-7',
          toolName: 'modifyMiniPrompt',
        })
      ).rejects.toThrow('Either miniPromptId or both stagePosition and miniPromptPosition must be provided');
    });

    it('should throw error when no identifiers provided', async () => {
      const input = {
        updates: {
          name: 'Updated',
        },
      };

      await expect(
        workflowTools.modifyMiniPrompt.execute(input, {
          messages: [],
          toolCallId: 'test-8',
          toolName: 'modifyMiniPrompt',
        })
      ).rejects.toThrow('Either miniPromptId or both stagePosition and miniPromptPosition must be provided');
    });

    it('should modify mini-prompt with tags', async () => {
      const input = {
        miniPromptId: 'prompt-789',
        updates: {
          name: 'Tagged Prompt',
          tags: ['analysis', 'backend', 'testing'],
        },
      };

      const result = await workflowTools.modifyMiniPrompt.execute(input, {
        messages: [],
        toolCallId: 'test-9',
        toolName: 'modifyMiniPrompt',
      });

      expect(result.success).toBe(true);
      expect(result.updates.tags).toEqual(['analysis', 'backend', 'testing']);
    });
  });

  describe('updateWorkflowSettings', () => {
    it('should update all workflow settings', async () => {
      const input = {
        name: 'New Workflow Name',
        description: 'Updated description',
        complexity: 'XL' as const,
        includeMultiAgentChat: true,
        visibility: 'PUBLIC' as const,
      };

      const result = await workflowTools.updateWorkflowSettings.execute(input, {
        messages: [],
        toolCallId: 'test-10',
        toolName: 'updateWorkflowSettings',
      });

      expect(result.success).toBe(true);
      expect(result.action).toBe('update_workflow_settings');
      expect(result.updates).toEqual(input);
      expect(result.message).toContain('Workflow settings will be updated');
    });

    it('should update partial workflow settings - name only', async () => {
      const input = {
        name: 'Only Name Changed',
      };

      const result = await workflowTools.updateWorkflowSettings.execute(input, {
        messages: [],
        toolCallId: 'test-11',
        toolName: 'updateWorkflowSettings',
      });

      expect(result.success).toBe(true);
      expect(result.updates).toEqual({ name: 'Only Name Changed' });
    });

    it('should update partial workflow settings - complexity only', async () => {
      const input = {
        complexity: 'S' as const,
      };

      const result = await workflowTools.updateWorkflowSettings.execute(input, {
        messages: [],
        toolCallId: 'test-12',
        toolName: 'updateWorkflowSettings',
      });

      expect(result.success).toBe(true);
      expect(result.updates.complexity).toBe('S');
    });

    it('should update partial workflow settings - multi-agent chat toggle', async () => {
      const input = {
        includeMultiAgentChat: false,
      };

      const result = await workflowTools.updateWorkflowSettings.execute(input, {
        messages: [],
        toolCallId: 'test-13',
        toolName: 'updateWorkflowSettings',
      });

      expect(result.success).toBe(true);
      expect(result.updates.includeMultiAgentChat).toBe(false);
    });

    it('should update partial workflow settings - visibility only', async () => {
      const input = {
        visibility: 'PRIVATE' as const,
      };

      const result = await workflowTools.updateWorkflowSettings.execute(input, {
        messages: [],
        toolCallId: 'test-14',
        toolName: 'updateWorkflowSettings',
      });

      expect(result.success).toBe(true);
      expect(result.updates.visibility).toBe('PRIVATE');
    });

    it('should handle empty updates object', async () => {
      const input = {};

      const result = await workflowTools.updateWorkflowSettings.execute(input, {
        messages: [],
        toolCallId: 'test-15',
        toolName: 'updateWorkflowSettings',
      });

      expect(result.success).toBe(true);
      expect(result.updates).toEqual({});
    });
  });
});
