import { describe, it, expect, beforeEach } from '@jest/globals';
import { ExecutionPlanBuilder } from '@/lib/mcp-tools-db/execution-plan-builder';
import { prisma } from '@/lib/db/client';

// Mock Prisma
jest.mock('@/lib/db/client', () => ({
  prisma: {
    workflow: {
      findUnique: jest.fn()
    },
    miniPrompt: {
      findFirst: jest.fn()
    }
  }
}));

describe('ExecutionPlanBuilder', () => {
  let builder: ExecutionPlanBuilder;

  beforeEach(() => {
    builder = new ExecutionPlanBuilder();
    jest.clearAllMocks();
  });

  describe('buildExecutionPlan', () => {
    it('should return null if workflow not found', async () => {
      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await builder.buildExecutionPlan('non-existent-id');

      expect(result).toBeNull();
    });

    it('should build execution plan without auto-prompts when settings are false', async () => {
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

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);

      const result = await builder.buildExecutionPlan('workflow-1');

      expect(result).not.toBeNull();
      expect(result!.totalSteps).toBe(1);
      expect(result!.items).toHaveLength(1);
      expect(result!.items[0].type).toBe('mini-prompt');
      expect(result!.items[0].name).toBe('Test Prompt');
    });

    it('should include Memory Board when withReview is true', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        includeMultiAgentChat: false,
        stages: [
          {
            id: 'stage-1',
            name: 'Stage 1',
            order: 0,
            withReview: true,
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

      const mockMemoryBoard = {
        id: 'memory-board-id',
        name: 'Handoff Memory Board',
        description: 'Memory board description',
        content: 'Memory board content'
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);
      (prisma.miniPrompt.findFirst as jest.Mock).mockImplementation((args: any) => {
        if (args.where.name === 'Handoff Memory Board') {
          return Promise.resolve(mockMemoryBoard as any);
        }
        return Promise.resolve(null);
      });

      const result = await builder.buildExecutionPlan('workflow-1');

      expect(result).not.toBeNull();
      expect(result!.totalSteps).toBe(2); // 1 mini-prompt + 1 memory board
      expect(result!.items).toHaveLength(2);
      expect(result!.items[1].type).toBe('auto-prompt');
      expect(result!.items[1].autoPromptType).toBe('memory-board');
      expect(result!.items[1].name).toBe('Handoff Memory Board');
    });

    it('should include Internal Agents Chat when includeMultiAgentChat is true', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        includeMultiAgentChat: true,
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

      const mockMultiAgentChat = {
        id: 'multi-agent-chat-id',
        name: 'Internal Agents Chat',
        description: 'Multi-agent chat description',
        content: 'Multi-agent chat content'
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);
      (prisma.miniPrompt.findFirst as jest.Mock).mockImplementation((args: any) => {
        if (args.where.name === 'Internal Agents Chat') {
          return Promise.resolve(mockMultiAgentChat as any);
        }
        return Promise.resolve(null);
      });

      const result = await builder.buildExecutionPlan('workflow-1');

      expect(result).not.toBeNull();
      expect(result!.totalSteps).toBe(2); // 1 mini-prompt + 1 multi-agent chat
      expect(result!.items).toHaveLength(2);
      expect(result!.items[1].type).toBe('auto-prompt');
      expect(result!.items[1].autoPromptType).toBe('multi-agent-chat');
      expect(result!.items[1].name).toBe('Internal Agents Chat');
    });

    it('should include both auto-prompts when both settings are true', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        includeMultiAgentChat: true,
        stages: [
          {
            id: 'stage-1',
            name: 'Stage 1',
            order: 0,
            withReview: true,
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

      const mockMemoryBoard = {
        id: 'memory-board-id',
        name: 'Handoff Memory Board',
        description: 'Memory board description',
        content: 'Memory board content'
      };

      const mockMultiAgentChat = {
        id: 'multi-agent-chat-id',
        name: 'Internal Agents Chat',
        description: 'Multi-agent chat description',
        content: 'Multi-agent chat content'
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);
      (prisma.miniPrompt.findFirst as jest.Mock).mockImplementation((args: any) => {
        if (args.where.name === 'Handoff Memory Board') {
          return Promise.resolve(mockMemoryBoard as any);
        }
        if (args.where.name === 'Internal Agents Chat') {
          return Promise.resolve(mockMultiAgentChat as any);
        }
        return Promise.resolve(null);
      });

      const result = await builder.buildExecutionPlan('workflow-1');

      expect(result).not.toBeNull();
      expect(result!.totalSteps).toBe(3); // 1 mini-prompt + 1 multi-agent chat + 1 memory board
      expect(result!.items).toHaveLength(3);

      // Verify order: mini-prompt, then multi-agent chat, then memory board
      expect(result!.items[0].type).toBe('mini-prompt');
      expect(result!.items[1].type).toBe('auto-prompt');
      expect(result!.items[1].autoPromptType).toBe('multi-agent-chat');
      expect(result!.items[2].type).toBe('auto-prompt');
      expect(result!.items[2].autoPromptType).toBe('memory-board');
    });

    it('should handle multiple stages correctly', async () => {
      const mockWorkflow = {
        id: 'workflow-1',
        name: 'Test Workflow',
        includeMultiAgentChat: false,
        stages: [
          {
            id: 'stage-1',
            name: 'Stage 1',
            order: 0,
            withReview: true,
            miniPrompts: [
              {
                order: 0,
                miniPromptId: 'prompt-1',
                miniPrompt: {
                  id: 'prompt-1',
                  name: 'Prompt 1',
                  description: null,
                  content: 'Content 1'
                }
              }
            ]
          },
          {
            id: 'stage-2',
            name: 'Stage 2',
            order: 1,
            withReview: true,
            miniPrompts: [
              {
                order: 0,
                miniPromptId: 'prompt-2',
                miniPrompt: {
                  id: 'prompt-2',
                  name: 'Prompt 2',
                  description: null,
                  content: 'Content 2'
                }
              }
            ]
          }
        ]
      };

      const mockMemoryBoard = {
        id: 'memory-board-id',
        name: 'Handoff Memory Board',
        description: null,
        content: 'Memory board content'
      };

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);
      (prisma.miniPrompt.findFirst as jest.Mock).mockResolvedValue(mockMemoryBoard as any);

      const result = await builder.buildExecutionPlan('workflow-1');

      expect(result).not.toBeNull();
      expect(result!.totalSteps).toBe(4); // (1 prompt + 1 memory board) * 2 stages
      expect(result!.items).toHaveLength(4);

      // Verify stage indices
      expect(result!.items[0].stageIndex).toBe(0);
      expect(result!.items[1].stageIndex).toBe(0);
      expect(result!.items[2].stageIndex).toBe(1);
      expect(result!.items[3].stageIndex).toBe(1);
    });
  });

  describe('formatExecutionPlan', () => {
    it('should format execution plan with markdown', () => {
      const plan = {
        workflowId: 'workflow-1',
        workflowName: 'Test Workflow',
        includeMultiAgentChat: true,
        totalSteps: 2,
        items: [
          {
            index: 0,
            type: 'mini-prompt' as const,
            stageIndex: 0,
            stageName: 'Stage 1',
            name: 'Test Prompt',
            description: 'Test description'
          },
          {
            index: 1,
            type: 'auto-prompt' as const,
            stageIndex: 0,
            stageName: 'Stage 1',
            name: 'Internal Agents Chat',
            description: 'Multi-agent coordination',
            isAutoAttached: true,
            autoPromptType: 'multi-agent-chat' as const
          }
        ]
      };

      const formatted = builder.formatExecutionPlan(plan);

      expect(formatted).toContain('# Execution Plan: Test Workflow');
      expect(formatted).toContain('**Total Steps:** 2');
      expect(formatted).toContain('**Multi-Agent Chat:** Enabled');
      expect(formatted).toContain('## Stage 1: Stage 1');
      expect(formatted).toContain('### 1. Test Prompt');
      expect(formatted).toContain('### 2. 🤖 Internal Agents Chat [AUTO]');
    });
  });

  describe('getStep', () => {
    it('should return specific step by index', async () => {
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

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);

      const step = await builder.getStep('workflow-1', 0);

      expect(step).not.toBeNull();
      expect(step!.name).toBe('Test Prompt');
      expect(step!.index).toBe(0);
    });

    it('should return null for invalid step index', async () => {
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

      (prisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow as any);

      const step = await builder.getStep('workflow-1', 999);

      expect(step).toBeNull();
    });
  });
});
