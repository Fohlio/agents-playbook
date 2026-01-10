/**
 * Unit tests for add_workflow MCP handler
 * Tests workflow creation with stages, prompts, and transaction handling
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { addWorkflowHandler } from '@/server/mcp-tools-db/add-workflow-handler';
import { prisma } from '@/server/db/client';

// Mock dependencies
jest.mock('@/server/db/client', () => ({
  prisma: {
    $transaction: jest.fn(),
    workflow: {
      create: jest.fn(),
    },
    workflowStage: {
      create: jest.fn(),
      update: jest.fn(),
    },
    workflowTag: {
      createMany: jest.fn(),
    },
    stageMiniPrompt: {
      create: jest.fn(),
    },
    miniPrompt: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    tag: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/server/db/retry', () => ({
  withRetry: jest.fn((fn: () => Promise<unknown>) => fn()),
}));

jest.mock('@/shared/lib/generate-key', () => ({
  generateUniqueKey: jest.fn((name: string) => `${name.toLowerCase().replace(/\s+/g, '-')}-abc123`),
}));

jest.mock('@/server/embeddings/user-workflow-embeddings', () => ({
  userWorkflowEmbeddings: {
    syncWorkflowEmbedding: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@/features/mini-prompts/lib/embedding-service', () => ({
  triggerMiniPromptEmbedding: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('add_workflow handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create mock workflow result
  const createMockWorkflowResult = (overrides: Record<string, unknown> = {}) => ({
    id: 'workflow-1',
    name: 'Test Workflow',
    description: null,
    complexity: null,
    visibility: 'PRIVATE',
    key: 'test-workflow-abc123',
    isActive: true,
    isSystemWorkflow: false,
    userId: 'user-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  });

  // Helper to setup simple transaction mock (no stages)
  const setupSimpleTransactionMock = (workflowResult: Record<string, unknown>) => {
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const tx = {
        workflow: {
          create: jest.fn().mockResolvedValue(workflowResult),
        },
        workflowTag: {
          createMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        workflowStage: {
          create: jest.fn(),
          update: jest.fn(),
        },
        stageMiniPrompt: {
          create: jest.fn(),
        },
        miniPrompt: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
        tag: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 'tag-1', name: 'test' }),
        },
      };
      return fn(tx);
    });
  };

  describe('Happy Path Tests', () => {
    it('should create workflow with name only', async () => {
      const workflowResult = createMockWorkflowResult();
      setupSimpleTransactionMock(workflowResult);

      const result = await addWorkflowHandler(
        { name: 'Simple Workflow' },
        'user-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Workflow created successfully');
      expect(data.workflow.id).toBe('workflow-1');
      expect(data.workflow.name).toBe('Test Workflow');
    });

    it('should create workflow with all metadata', async () => {
      const workflowResult = createMockWorkflowResult({
        description: 'Full description',
        complexity: 'M',
        visibility: 'PUBLIC',
      });
      setupSimpleTransactionMock(workflowResult);

      const result = await addWorkflowHandler(
        {
          name: 'Full Workflow',
          description: 'Full description',
          complexity: 'M',
          visibility: 'PUBLIC',
          tags: ['dev'],
        },
        'user-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Workflow created successfully');
      expect(data.workflow.visibility).toBe('PUBLIC');
      expect(data.workflow.complexity).toBe('M');
    });

    it('should create workflow with stages containing inline prompts', async () => {
      const workflowResult = createMockWorkflowResult();

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: {
            create: jest.fn().mockResolvedValue(workflowResult),
          },
          workflowTag: { createMany: jest.fn() },
          workflowStage: {
            create: jest.fn().mockResolvedValue({ id: 'stage-1' }),
            update: jest.fn(),
          },
          stageMiniPrompt: {
            create: jest.fn(),
          },
          miniPrompt: {
            findUnique: jest.fn(),
            create: jest.fn().mockResolvedValue({ id: 'prompt-1' }),
          },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      const result = await addWorkflowHandler(
        {
          name: 'WF with Stages',
          stages: [{
            name: 'Stage 1',
            prompts: [{ name: 'P1', content: 'Content 1' }],
          }],
        },
        'user-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Workflow created successfully');
      expect(data.workflow.stageCount).toBe(1);
    });

    it('should create workflow with stages referencing existing prompts', async () => {
      const workflowResult = createMockWorkflowResult();
      const existingPrompt = { id: 'existing-prompt-id' };

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: {
            create: jest.fn().mockResolvedValue(workflowResult),
          },
          workflowTag: { createMany: jest.fn() },
          workflowStage: {
            create: jest.fn().mockResolvedValue({ id: 'stage-1' }),
            update: jest.fn(),
          },
          stageMiniPrompt: {
            create: jest.fn(),
          },
          miniPrompt: {
            findUnique: jest.fn().mockResolvedValue(existingPrompt),
            create: jest.fn(),
          },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      const result = await addWorkflowHandler(
        {
          name: 'WF with Ref',
          stages: [{
            name: 'Stage 1',
            prompts: [{ prompt_id: 'existing-prompt-id' }],
          }],
        },
        'user-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Workflow created successfully');
    });

    it('should create stages with correct order', async () => {
      const workflowResult = createMockWorkflowResult();
      const stageOrders: number[] = [];

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { create: jest.fn().mockResolvedValue(workflowResult) },
          workflowTag: { createMany: jest.fn() },
          workflowStage: {
            create: jest.fn().mockImplementation((args) => {
              stageOrders.push(args.data.order);
              return { id: `stage-${args.data.order}` };
            }),
            update: jest.fn(),
          },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addWorkflowHandler(
        {
          name: 'WF',
          stages: [
            { name: 'First' },
            { name: 'Second' },
            { name: 'Third' },
          ],
        },
        'user-123'
      );

      expect(stageOrders).toEqual([0, 1, 2]);
    });

    it('should apply default values correctly', async () => {
      let capturedWorkflowData: Record<string, unknown> | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: {
            create: jest.fn().mockImplementation((args) => {
              capturedWorkflowData = args.data;
              return createMockWorkflowResult();
            }),
          },
          workflowTag: { createMany: jest.fn() },
          workflowStage: { create: jest.fn(), update: jest.fn() },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addWorkflowHandler({ name: 'WF' }, 'user-123');

      expect(capturedWorkflowData).toBeDefined();
      expect(capturedWorkflowData!.visibility).toBe('PRIVATE');
      expect(capturedWorkflowData!.isActive).toBe(true);
      expect(capturedWorkflowData!.isSystemWorkflow).toBe(false);
    });

    it('should return unique key for created workflow', async () => {
      const workflowResult = createMockWorkflowResult({ key: 'my-workflow-abc123' });
      setupSimpleTransactionMock(workflowResult);

      const result = await addWorkflowHandler(
        { name: 'My Workflow' },
        'user-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.workflow.key).toBe('my-workflow-abc123');
    });
  });

  describe('Stage Default Values', () => {
    it('should default stage withReview to true', async () => {
      const workflowResult = createMockWorkflowResult();
      let capturedStageData: Record<string, unknown> | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { create: jest.fn().mockResolvedValue(workflowResult) },
          workflowTag: { createMany: jest.fn() },
          workflowStage: {
            create: jest.fn().mockImplementation((args) => {
              capturedStageData = args.data;
              return { id: 'stage-1' };
            }),
            update: jest.fn(),
          },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addWorkflowHandler(
        { name: 'WF', stages: [{ name: 'S' }] },
        'user-123'
      );

      expect(capturedStageData).toBeDefined();
      expect(capturedStageData!.withReview).toBe(true);
    });

    it('should default stage includeMultiAgentChat to false', async () => {
      const workflowResult = createMockWorkflowResult();
      let capturedStageData: Record<string, unknown> | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { create: jest.fn().mockResolvedValue(workflowResult) },
          workflowTag: { createMany: jest.fn() },
          workflowStage: {
            create: jest.fn().mockImplementation((args) => {
              capturedStageData = args.data;
              return { id: 'stage-1' };
            }),
            update: jest.fn(),
          },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addWorkflowHandler(
        { name: 'WF', stages: [{ name: 'S' }] },
        'user-123'
      );

      expect(capturedStageData).toBeDefined();
      expect(capturedStageData!.includeMultiAgentChat).toBe(false);
    });

    it('should apply default color to stages', async () => {
      const workflowResult = createMockWorkflowResult();
      let capturedStageData: Record<string, unknown> | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { create: jest.fn().mockResolvedValue(workflowResult) },
          workflowTag: { createMany: jest.fn() },
          workflowStage: {
            create: jest.fn().mockImplementation((args) => {
              capturedStageData = args.data;
              return { id: 'stage-1' };
            }),
            update: jest.fn(),
          },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addWorkflowHandler(
        { name: 'WF', stages: [{ name: 'S' }] },
        'user-123'
      );

      expect(capturedStageData).toBeDefined();
      expect(capturedStageData!.color).toBe('#64748b');
    });
  });

  describe('Authentication Tests', () => {
    it('should return auth warning for unauthenticated request', async () => {
      const result = await addWorkflowHandler(
        { name: 'WF' },
        null
      );

      expect(result.content[0].text).toContain('Authentication required');
    });

    it('should create workflow with correct userId', async () => {
      let capturedUserId: string | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: {
            create: jest.fn().mockImplementation((args) => {
              capturedUserId = args.data.userId;
              return createMockWorkflowResult();
            }),
          },
          workflowTag: { createMany: jest.fn() },
          workflowStage: { create: jest.fn(), update: jest.fn() },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addWorkflowHandler({ name: 'WF' }, 'user-123');

      expect(capturedUserId).toBe('user-123');
    });
  });

  describe('Validation Tests', () => {
    it('should return error for empty name', async () => {
      const result = await addWorkflowHandler(
        { name: '' },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('name is required');
    });

    it('should return error for whitespace-only name', async () => {
      const result = await addWorkflowHandler(
        { name: '   ' },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('name is required');
    });

    it('should return error for stage missing name', async () => {
      const result = await addWorkflowHandler(
        {
          name: 'WF',
          stages: [{ description: 'No name' } as unknown as { name: string }],
        },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('Stage 1: name is required');
    });

    it('should return error for inline prompt missing content', async () => {
      const result = await addWorkflowHandler(
        {
          name: 'WF',
          stages: [{
            name: 'S',
            prompts: [{ name: 'P' }],
          }],
        },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('either prompt_id or both name and content are required');
    });

    it('should return error for reference to non-existent prompt', async () => {
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { create: jest.fn().mockResolvedValue(createMockWorkflowResult()) },
          workflowTag: { createMany: jest.fn() },
          workflowStage: { create: jest.fn().mockResolvedValue({ id: 'stage-1' }), update: jest.fn() },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: {
            findUnique: jest.fn().mockResolvedValue(null), // Prompt not found
            create: jest.fn(),
          },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      const result = await addWorkflowHandler(
        {
          name: 'WF',
          stages: [{
            name: 'S',
            prompts: [{ prompt_id: 'non-existent' }],
          }],
        },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('Prompt not found: non-existent');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty stages array', async () => {
      const workflowResult = createMockWorkflowResult();
      setupSimpleTransactionMock(workflowResult);

      const result = await addWorkflowHandler(
        { name: 'WF', stages: [] },
        'user-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.workflow.stageCount).toBe(0);
    });

    it('should handle stage with empty prompts array', async () => {
      const workflowResult = createMockWorkflowResult();

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { create: jest.fn().mockResolvedValue(workflowResult) },
          workflowTag: { createMany: jest.fn() },
          workflowStage: { create: jest.fn().mockResolvedValue({ id: 'stage-1' }), update: jest.fn() },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      const result = await addWorkflowHandler(
        { name: 'WF', stages: [{ name: 'S', prompts: [] }] },
        'user-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Workflow created successfully');
    });

    it('should handle stage with both inline and reference prompts', async () => {
      const workflowResult = createMockWorkflowResult();
      const promptOrders: number[] = [];

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { create: jest.fn().mockResolvedValue(workflowResult) },
          workflowTag: { createMany: jest.fn() },
          workflowStage: { create: jest.fn().mockResolvedValue({ id: 'stage-1' }), update: jest.fn() },
          stageMiniPrompt: {
            create: jest.fn().mockImplementation((args) => {
              promptOrders.push(args.data.order);
            }),
          },
          miniPrompt: {
            findUnique: jest.fn().mockResolvedValue({ id: 'existing-id' }),
            create: jest.fn().mockResolvedValue({ id: 'new-id' }),
          },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addWorkflowHandler(
        {
          name: 'WF',
          stages: [{
            name: 'S',
            prompts: [
              { prompt_id: 'existing' },
              { name: 'New', content: 'Inline' },
            ],
          }],
        },
        'user-123'
      );

      expect(promptOrders).toEqual([0, 1]); // Correct order maintained
    });

    it('should trim workflow name', async () => {
      let capturedName: string | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: {
            create: jest.fn().mockImplementation((args) => {
              capturedName = args.data.name;
              return createMockWorkflowResult();
            }),
          },
          workflowTag: { createMany: jest.fn() },
          workflowStage: { create: jest.fn(), update: jest.fn() },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addWorkflowHandler({ name: '  Trimmed Name  ' }, 'user-123');

      expect(capturedName).toBe('Trimmed Name');
    });
  });

  describe('Embedding Trigger Tests', () => {
    it('should trigger workflow embedding after successful creation', async () => {
      const { userWorkflowEmbeddings } = require('@/server/embeddings/user-workflow-embeddings');
      userWorkflowEmbeddings.syncWorkflowEmbedding.mockClear();

      const workflowResult = createMockWorkflowResult();
      setupSimpleTransactionMock(workflowResult);

      await addWorkflowHandler({ name: 'WF' }, 'user-123');

      expect(userWorkflowEmbeddings.syncWorkflowEmbedding).toHaveBeenCalledWith('workflow-1');
    });

    it('should trigger prompt embedding for inline prompts', async () => {
      const { triggerMiniPromptEmbedding } = require('@/features/mini-prompts/lib/embedding-service');
      triggerMiniPromptEmbedding.mockClear();

      const workflowResult = createMockWorkflowResult();

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { create: jest.fn().mockResolvedValue(workflowResult) },
          workflowTag: { createMany: jest.fn() },
          workflowStage: { create: jest.fn().mockResolvedValue({ id: 'stage-1' }), update: jest.fn() },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: {
            findUnique: jest.fn(),
            create: jest.fn().mockResolvedValue({ id: 'new-prompt-id' }),
          },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addWorkflowHandler(
        {
          name: 'WF',
          stages: [{ name: 'S', prompts: [{ name: 'P', content: 'C' }] }],
        },
        'user-123'
      );

      expect(triggerMiniPromptEmbedding).toHaveBeenCalledWith('new-prompt-id');
    });
  });

  describe('Transaction Tests', () => {
    it('should use transaction with timeout settings', async () => {
      const workflowResult = createMockWorkflowResult();
      let transactionOptions: Record<string, unknown> | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn, options) => {
        transactionOptions = options;
        const tx = {
          workflow: { create: jest.fn().mockResolvedValue(workflowResult) },
          workflowTag: { createMany: jest.fn() },
          workflowStage: { create: jest.fn(), update: jest.fn() },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addWorkflowHandler({ name: 'WF' }, 'user-123');

      expect(transactionOptions).toEqual({
        maxWait: 10000,
        timeout: 30000,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await addWorkflowHandler(
        { name: 'WF' },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('Failed to create workflow');
    });

    it('should propagate prompt not found error message', async () => {
      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(
        new Error('Prompt not found: invalid-id')
      );

      const result = await addWorkflowHandler(
        { name: 'WF' },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('Prompt not found: invalid-id');
    });
  });
});
