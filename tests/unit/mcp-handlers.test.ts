import { describe, it, expect, beforeEach } from '@jest/globals';
import { selectWorkflowHandler } from '@/lib/mcp-tools-db/select-workflow';
import { getNextStepHandler } from '@/lib/mcp-tools-db/get-next-step';
import { prisma } from '@/lib/db/client';
import { tokenAuth } from '@/lib/auth/token-auth';
import { unifiedWorkflowService } from '@/lib/workflows/unified-workflow-service';

// Mock dependencies
jest.mock('@/lib/db/client', () => ({
  prisma: {
    workflow: {
      findUnique: jest.fn(),
      findFirst: jest.fn()
    },
    miniPrompt: {
      findFirst: jest.fn()
    }
  }
}));

jest.mock('@/lib/auth/token-auth', () => ({
  tokenAuth: {
    validateToken: jest.fn()
  }
}));

jest.mock('@/lib/workflows/unified-workflow-service', () => ({
  unifiedWorkflowService: {
    getWorkflowById: jest.fn()
  }
}));

describe('MCP Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('selectWorkflowHandler', () => {
    it('should return workflow with execution plan for authenticated user', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test description',
        source: 'user',
        includeMultiAgentChat: false,
        stages: [
          {
            id: 'stage-1',
            name: 'Stage 1',
            order: 0,
            withReview: false,
            miniPrompts: [
              {
                order: 0,
                miniPromptId: 'prompt-1',
                miniPrompt: {
                  id: 'prompt-1',
                  name: 'Test Prompt',
                  description: 'Test description',
                  content: 'Test content'
                }
              }
            ]
          }
        ]
      };

      (tokenAuth.validateToken as jest.Mock).mockResolvedValue({ valid: true, userId: 'user-1' });
      (unifiedWorkflowService.getWorkflowById as jest.Mock).mockResolvedValue(mockWorkflow);
      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await selectWorkflowHandler({
        workflow_id: 'workflow-1',
        user_token: 'valid-token'
      });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Test Workflow');
      expect(result.content[0].text).toContain('Execution Plan');
    });

    it('should return workflow without user token for system workflows', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        description: 'Test description',
        source: 'system',
        includeMultiAgentChat: false,
        stages: [
          {
            id: 'stage-1',
            name: 'Stage 1',
            order: 0,
            withReview: false,
            miniPrompts: [
              {
                order: 0,
                miniPromptId: 'prompt-1',
                miniPrompt: {
                  id: 'prompt-1',
                  name: 'Test Prompt',
                  description: null,
                  content: 'Test content'
                }
              }
            ]
          }
        ]
      };

      (unifiedWorkflowService.getWorkflowById as jest.Mock).mockResolvedValue(mockWorkflow);
      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await selectWorkflowHandler({
        workflow_id: 'workflow-1'
      });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('[SYSTEM WORKFLOW]');
      expect(result.content[0].text).toContain('Test Workflow');
    });

    it('should return error for invalid token', async () => {
      (tokenAuth.validateToken as jest.Mock).mockResolvedValue({
        valid: false,
        error: 'Invalid token'
      });

      const result = await selectWorkflowHandler({
        workflow_id: 'workflow-1',
        user_token: 'invalid-token'
      });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Authentication failed');
    });

    it('should return error for non-existent workflow', async () => {
      (unifiedWorkflowService.getWorkflowById as jest.Mock).mockResolvedValue(null);
      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await selectWorkflowHandler({
        workflow_id: 'non-existent'
      });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('not found');
    });
  });

  describe('getNextStepHandler', () => {
    it('should return correct step with content', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        includeMultiAgentChat: false,
        stages: [
          {
            id: 'stage-1',
            name: 'Stage 1',
            order: 0,
            withReview: false,
            miniPrompts: [
              {
                order: 0,
                miniPromptId: 'prompt-1',
                miniPrompt: {
                  id: 'prompt-1',
                  name: 'Test Prompt',
                  description: 'Test description',
                  content: 'Test content'
                }
              }
            ]
          }
        ]
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getNextStepHandler({
        workflow_id: 'workflow-1',
        current_step: 0
      });

      expect(result.content[0].type).toBe('text');
      const text = result.content[0].text;
      expect(text).toContain('Step 1/1');
      expect(text).toContain('**Stage:** Stage 1');
      expect(text).toContain('**Type:** Mini-prompt');
      expect(text).toContain('Test Prompt');
      expect(text).toContain('Test content');
    });

    it('should include auto-prompt type indicators', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        includeMultiAgentChat: false, // Deprecated - now per-stage
        stages: [
          {
            id: 'stage-1',
            name: 'Stage 1',
            order: 0,
            withReview: false,
            includeMultiAgentChat: true, // Per-stage setting
            miniPrompts: [
              {
                order: 0,
                miniPromptId: 'prompt-1',
                miniPrompt: {
                  id: 'prompt-1',
                  name: 'Test Prompt',
                  description: null,
                  content: 'Test content'
                }
              }
            ]
          }
        ]
      };

      const mockMultiAgentChat = {
        id: 'multi-agent-chat-id',
        name: 'Internal Agents Chat',
        description: 'Multi-agent chat',
        content: 'Multi-agent chat content'
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);
      (prisma.miniPrompt.findFirst as jest.Mock).mockResolvedValue(mockMultiAgentChat);

      // Get the second step (Internal Agents Chat)
      const result = await getNextStepHandler({
        workflow_id: 'workflow-1',
        current_step: 1
      });

      expect(result.content[0].type).toBe('text');
      const text = result.content[0].text;
      expect(text).toContain('🤖');
      expect(text).toContain('[AUTO]');
      expect(text).toContain('Auto-attached prompt');
    });

    it('should return error for invalid step index', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        includeMultiAgentChat: false,
        stages: [
          {
            id: 'stage-1',
            name: 'Stage 1',
            order: 0,
            withReview: false,
            miniPrompts: [
              {
                order: 0,
                miniPromptId: 'prompt-1',
                miniPrompt: {
                  id: 'prompt-1',
                  name: 'Test Prompt',
                  description: null,
                  content: 'Test content'
                }
              }
            ]
          }
        ]
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getNextStepHandler({
        workflow_id: 'workflow-1',
        current_step: 999
      });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Step 999 not found');
    });

    it('should include available context when provided', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        includeMultiAgentChat: false,
        stages: [
          {
            id: 'stage-1',
            name: 'Stage 1',
            order: 0,
            withReview: false,
            miniPrompts: [
              {
                order: 0,
                miniPromptId: 'prompt-1',
                miniPrompt: {
                  id: 'prompt-1',
                  name: 'Test Prompt',
                  description: null,
                  content: 'Test content'
                }
              }
            ]
          }
        ]
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getNextStepHandler({
        workflow_id: 'workflow-1',
        current_step: 0,
        available_context: ['context1', 'context2']
      });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('**Available Context:** context1, context2');
    });

    it('should return error for non-existent workflow', async () => {
      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getNextStepHandler({
        workflow_id: 'non-existent',
        current_step: 0
      });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('not found');
    });

    it('should validate token when provided', async () => {
      (tokenAuth.validateToken as jest.Mock).mockResolvedValue({
        valid: false,
        error: 'Invalid token'
      });

      const result = await getNextStepHandler({
        workflow_id: 'workflow-1',
        current_step: 0,
        user_token: 'invalid-token'
      });

      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('Authentication failed');
    });
  });
});
