/**
 * Unit tests for edit_workflow MCP handler
 * Tests ownership verification, stage replacement, and transaction handling
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { editWorkflowHandler } from '@/server/mcp-tools-db/edit-workflow-handler';
import { prisma } from '@/server/db/client';

// Mock dependencies
jest.mock('@/server/db/client', () => ({
  prisma: {
    $transaction: jest.fn(),
    workflow: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    workflowStage: {
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    workflowTag: {
      deleteMany: jest.fn(),
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

describe('edit_workflow handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create mock existing workflow
  const createMockExistingWorkflow = (overrides: Record<string, unknown> = {}) => ({
    id: 'workflow-1',
    name: 'Original Workflow',
    description: 'Original description',
    userId: 'owner-123',
    isSystemWorkflow: false,
    ...overrides,
  });

  // Helper to create mock updated workflow
  const createMockUpdatedWorkflow = (overrides: Record<string, unknown> = {}) => ({
    id: 'workflow-1',
    name: 'Updated Workflow',
    description: 'Updated description',
    visibility: 'PRIVATE',
    complexity: 'M',
    isActive: true,
    updatedAt: new Date('2024-01-15'),
    ...overrides,
  });

  // Helper to setup simple transaction mock
  const setupSimpleTransactionMock = (updatedWorkflow: Record<string, unknown>) => {
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const tx = {
        workflow: {
          update: jest.fn().mockResolvedValue(updatedWorkflow),
        },
        workflowTag: {
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
          createMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        workflowStage: {
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
          create: jest.fn().mockResolvedValue({ id: 'stage-1' }),
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

    // Mock the stage count query for response
    (mockPrisma.workflowStage.count as jest.Mock).mockResolvedValue(0);
  };

  describe('Happy Path Tests', () => {
    it('should update single field (name)', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow({ name: 'New Name' });

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);
      setupSimpleTransactionMock(updatedWorkflow);

      const result = await editWorkflowHandler(
        { workflow_id: 'workflow-1', name: 'New Name' },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Workflow updated successfully');
      expect(data.workflow.name).toBe('New Name');
    });

    it('should update multiple metadata fields', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow({
        description: 'New desc',
        complexity: 'L',
        visibility: 'PUBLIC',
      });

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);
      setupSimpleTransactionMock(updatedWorkflow);

      const result = await editWorkflowHandler(
        {
          workflow_id: 'workflow-1',
          description: 'New desc',
          complexity: 'L',
          visibility: 'PUBLIC',
        },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Workflow updated successfully');
      expect(data.workflow.visibility).toBe('PUBLIC');
      expect(data.workflow.complexity).toBe('L');
    });

    it('should replace all stages when stages provided', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow();

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);

      let deleteManyCalledWith: unknown = null;
      let stageCreateCount = 0;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { update: jest.fn().mockResolvedValue(updatedWorkflow) },
          workflowTag: { deleteMany: jest.fn(), createMany: jest.fn() },
          workflowStage: {
            deleteMany: jest.fn().mockImplementation((args) => {
              deleteManyCalledWith = args;
              return { count: 2 };
            }),
            create: jest.fn().mockImplementation(() => {
              stageCreateCount++;
              return { id: `stage-${stageCreateCount}` };
            }),
            update: jest.fn(),
          },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await editWorkflowHandler(
        {
          workflow_id: 'workflow-1',
          stages: [{ name: 'New Stage', prompts: [] }],
        },
        'owner-123'
      );

      expect(deleteManyCalledWith).toEqual({ where: { workflowId: 'workflow-1' } });
      expect(stageCreateCount).toBe(1);
    });

    it('should replace tags when tags provided', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow();

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);

      let tagDeleteManyCalled = false;
      let tagCreateManyData: Array<{ workflowId: string; tagId: string }> = [];

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { update: jest.fn().mockResolvedValue(updatedWorkflow) },
          workflowTag: {
            deleteMany: jest.fn().mockImplementation(() => {
              tagDeleteManyCalled = true;
              return { count: 2 };
            }),
            createMany: jest.fn().mockImplementation((args) => {
              tagCreateManyData = args.data;
              return { count: args.data.length };
            }),
          },
          workflowStage: { deleteMany: jest.fn(), create: jest.fn(), update: jest.fn() },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: {
            findFirst: jest.fn().mockResolvedValue({ id: 'new-tag-id', name: 'new-only' }),
            create: jest.fn(),
          },
        };
        return fn(tx);
      });

      (mockPrisma.workflowStage.count as jest.Mock).mockResolvedValue(0);

      await editWorkflowHandler(
        { workflow_id: 'workflow-1', tags: ['new-only'] },
        'owner-123'
      );

      expect(tagDeleteManyCalled).toBe(true);
      expect(tagCreateManyData).toHaveLength(1);
    });

    it('should soft delete workflow via is_active=false', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow({ isActive: false });

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);
      setupSimpleTransactionMock(updatedWorkflow);

      const result = await editWorkflowHandler(
        { workflow_id: 'workflow-1', is_active: false },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.workflow.isActive).toBe(false);
    });

    it('should return correct stageCount when stages are replaced', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow();

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { update: jest.fn().mockResolvedValue(updatedWorkflow) },
          workflowTag: { deleteMany: jest.fn(), createMany: jest.fn() },
          workflowStage: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            create: jest.fn().mockResolvedValue({ id: 'stage-1' }),
            update: jest.fn(),
          },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      const result = await editWorkflowHandler(
        {
          workflow_id: 'workflow-1',
          stages: [{ name: 'S1' }, { name: 'S2' }, { name: 'S3' }],
        },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.workflow.stageCount).toBe(3);
    });

    it('should fetch current stageCount when stages not updated', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow();

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);
      setupSimpleTransactionMock(updatedWorkflow);
      (mockPrisma.workflowStage.count as jest.Mock).mockResolvedValue(5);

      const result = await editWorkflowHandler(
        { workflow_id: 'workflow-1', name: 'New' },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.workflow.stageCount).toBe(5);
    });
  });

  describe('Authentication Tests', () => {
    it('should return auth warning for unauthenticated request', async () => {
      const result = await editWorkflowHandler(
        { workflow_id: 'workflow-1', name: 'New' },
        null
      );

      expect(result.content[0].text).toContain('Authentication required');
    });
  });

  describe('Authorization Tests', () => {
    it('should allow owner to edit their workflow', async () => {
      const existingWorkflow = createMockExistingWorkflow({ userId: 'owner-123' });
      const updatedWorkflow = createMockUpdatedWorkflow();

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);
      setupSimpleTransactionMock(updatedWorkflow);

      const result = await editWorkflowHandler(
        { workflow_id: 'workflow-1', name: 'New' },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Workflow updated successfully');
    });

    it('should deny non-owner edit attempt', async () => {
      const existingWorkflow = createMockExistingWorkflow({ userId: 'owner-123' });
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);

      const result = await editWorkflowHandler(
        { workflow_id: 'workflow-1', name: 'Hack' },
        'other-user'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain("don't have permission");
    });

    it('should deny edit of system workflow', async () => {
      const existingWorkflow = createMockExistingWorkflow({
        userId: 'owner-123',
        isSystemWorkflow: true,
      });
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);

      const result = await editWorkflowHandler(
        { workflow_id: 'workflow-1', name: 'Modify' },
        'owner-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('System workflows cannot be modified');
    });
  });

  describe('Validation Tests', () => {
    it('should return error for non-existent workflow_id', async () => {
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await editWorkflowHandler(
        { workflow_id: 'non-existent', name: 'New' },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('Workflow not found');
    });

    it('should return error for empty workflow_id', async () => {
      const result = await editWorkflowHandler(
        { workflow_id: '', name: 'New' },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('workflow_id is required');
    });

    it('should return error for whitespace-only workflow_id', async () => {
      const result = await editWorkflowHandler(
        { workflow_id: '   ', name: 'New' },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('workflow_id is required');
    });

    it('should return error for invalid prompt reference in stages', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { update: jest.fn().mockResolvedValue(createMockUpdatedWorkflow()) },
          workflowTag: { deleteMany: jest.fn(), createMany: jest.fn() },
          workflowStage: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            create: jest.fn().mockResolvedValue({ id: 'stage-1' }),
            update: jest.fn(),
          },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: {
            findUnique: jest.fn().mockResolvedValue(null), // Prompt not found
            create: jest.fn(),
          },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      const result = await editWorkflowHandler(
        {
          workflow_id: 'workflow-1',
          stages: [{ name: 'S', prompts: [{ prompt_id: 'gone' }] }],
        },
        'owner-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('Prompt not found: gone');
    });

    it('should validate stage prompts when stages provided', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);

      const result = await editWorkflowHandler(
        {
          workflow_id: 'workflow-1',
          stages: [{ name: 'S', prompts: [{ name: 'P' }] }], // Missing content
        },
        'owner-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('either prompt_id or both name and content');
    });
  });

  describe('Edge Cases', () => {
    it('should allow update with no fields (only workflow_id)', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow();

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);
      setupSimpleTransactionMock(updatedWorkflow);

      const result = await editWorkflowHandler(
        { workflow_id: 'workflow-1' },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Workflow updated successfully');
    });

    it('should replace stages with empty array', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow();

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);

      let deleteManyCalledWith: unknown = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { update: jest.fn().mockResolvedValue(updatedWorkflow) },
          workflowTag: { deleteMany: jest.fn(), createMany: jest.fn() },
          workflowStage: {
            deleteMany: jest.fn().mockImplementation((args) => {
              deleteManyCalledWith = args;
              return { count: 5 };
            }),
            create: jest.fn(),
            update: jest.fn(),
          },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      const result = await editWorkflowHandler(
        { workflow_id: 'workflow-1', stages: [] },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(deleteManyCalledWith).toBeDefined();
      expect(data.workflow.stageCount).toBe(0);
    });

    it('should trim name when updating', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow();

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);

      let capturedUpdateData: Record<string, unknown> | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: {
            update: jest.fn().mockImplementation((args) => {
              capturedUpdateData = args.data;
              return updatedWorkflow;
            }),
          },
          workflowTag: { deleteMany: jest.fn(), createMany: jest.fn() },
          workflowStage: { deleteMany: jest.fn(), create: jest.fn(), update: jest.fn() },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      (mockPrisma.workflowStage.count as jest.Mock).mockResolvedValue(0);

      await editWorkflowHandler(
        { workflow_id: 'workflow-1', name: '  Trimmed Name  ' },
        'owner-123'
      );

      expect(capturedUpdateData).toBeDefined();
      expect(capturedUpdateData!.name).toBe('Trimmed Name');
    });

    it('should set description to null when empty string provided', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow({ description: null });

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);

      let capturedUpdateData: Record<string, unknown> | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: {
            update: jest.fn().mockImplementation((args) => {
              capturedUpdateData = args.data;
              return updatedWorkflow;
            }),
          },
          workflowTag: { deleteMany: jest.fn(), createMany: jest.fn() },
          workflowStage: { deleteMany: jest.fn(), create: jest.fn(), update: jest.fn() },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      (mockPrisma.workflowStage.count as jest.Mock).mockResolvedValue(0);

      await editWorkflowHandler(
        { workflow_id: 'workflow-1', description: '' },
        'owner-123'
      );

      expect(capturedUpdateData).toBeDefined();
      expect(capturedUpdateData!.description).toBeNull();
    });

    it('should recalculate stage order on replacement', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow();

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);

      const stageOrders: number[] = [];

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { update: jest.fn().mockResolvedValue(updatedWorkflow) },
          workflowTag: { deleteMany: jest.fn(), createMany: jest.fn() },
          workflowStage: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
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

      await editWorkflowHandler(
        {
          workflow_id: 'workflow-1',
          stages: [{ name: 'First' }, { name: 'Second' }, { name: 'Third' }],
        },
        'owner-123'
      );

      expect(stageOrders).toEqual([0, 1, 2]);
    });

    it('should format updatedAt as ISO string', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow({
        updatedAt: new Date('2024-01-15T10:30:00Z'),
      });

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);
      setupSimpleTransactionMock(updatedWorkflow);

      const result = await editWorkflowHandler(
        { workflow_id: 'workflow-1', name: 'New' },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.workflow.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('Embedding Trigger Tests', () => {
    it('should trigger workflow embedding when name changes', async () => {
      const { userWorkflowEmbeddings } = require('@/server/embeddings/user-workflow-embeddings');
      userWorkflowEmbeddings.syncWorkflowEmbedding.mockClear();

      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow();

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);
      setupSimpleTransactionMock(updatedWorkflow);

      await editWorkflowHandler(
        { workflow_id: 'workflow-1', name: 'New Name' },
        'owner-123'
      );

      expect(userWorkflowEmbeddings.syncWorkflowEmbedding).toHaveBeenCalledWith('workflow-1');
    });

    it('should trigger workflow embedding when description changes', async () => {
      const { userWorkflowEmbeddings } = require('@/server/embeddings/user-workflow-embeddings');
      userWorkflowEmbeddings.syncWorkflowEmbedding.mockClear();

      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow();

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);
      setupSimpleTransactionMock(updatedWorkflow);

      await editWorkflowHandler(
        { workflow_id: 'workflow-1', description: 'New desc' },
        'owner-123'
      );

      expect(userWorkflowEmbeddings.syncWorkflowEmbedding).toHaveBeenCalledWith('workflow-1');
    });

    it('should trigger workflow embedding when tags change', async () => {
      const { userWorkflowEmbeddings } = require('@/server/embeddings/user-workflow-embeddings');
      userWorkflowEmbeddings.syncWorkflowEmbedding.mockClear();

      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow();

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { update: jest.fn().mockResolvedValue(updatedWorkflow) },
          workflowTag: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          workflowStage: { deleteMany: jest.fn(), create: jest.fn(), update: jest.fn() },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: {
            findFirst: jest.fn().mockResolvedValue({ id: 'tag-1', name: 'new' }),
            create: jest.fn(),
          },
        };
        return fn(tx);
      });

      (mockPrisma.workflowStage.count as jest.Mock).mockResolvedValue(0);

      await editWorkflowHandler(
        { workflow_id: 'workflow-1', tags: ['new-tag'] },
        'owner-123'
      );

      expect(userWorkflowEmbeddings.syncWorkflowEmbedding).toHaveBeenCalledWith('workflow-1');
    });

    it('should NOT trigger workflow embedding when only visibility changes', async () => {
      const { userWorkflowEmbeddings } = require('@/server/embeddings/user-workflow-embeddings');
      userWorkflowEmbeddings.syncWorkflowEmbedding.mockClear();

      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow();

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);
      setupSimpleTransactionMock(updatedWorkflow);

      await editWorkflowHandler(
        { workflow_id: 'workflow-1', visibility: 'PUBLIC' },
        'owner-123'
      );

      expect(userWorkflowEmbeddings.syncWorkflowEmbedding).not.toHaveBeenCalled();
    });

    it('should trigger prompt embedding for inline prompts in stages', async () => {
      const { triggerMiniPromptEmbedding } = require('@/features/mini-prompts/lib/embedding-service');
      triggerMiniPromptEmbedding.mockClear();

      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow();

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          workflow: { update: jest.fn().mockResolvedValue(updatedWorkflow) },
          workflowTag: { deleteMany: jest.fn(), createMany: jest.fn() },
          workflowStage: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            create: jest.fn().mockResolvedValue({ id: 'stage-1' }),
            update: jest.fn(),
          },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: {
            findUnique: jest.fn(),
            create: jest.fn().mockResolvedValue({ id: 'new-prompt-id' }),
          },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await editWorkflowHandler(
        {
          workflow_id: 'workflow-1',
          stages: [{ name: 'S', prompts: [{ name: 'P', content: 'C' }] }],
        },
        'owner-123'
      );

      expect(triggerMiniPromptEmbedding).toHaveBeenCalledWith('new-prompt-id');
    });
  });

  describe('Transaction Tests', () => {
    it('should use transaction with timeout settings', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      const updatedWorkflow = createMockUpdatedWorkflow();

      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);

      let transactionOptions: Record<string, unknown> | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn, options) => {
        transactionOptions = options;
        const tx = {
          workflow: { update: jest.fn().mockResolvedValue(updatedWorkflow) },
          workflowTag: { deleteMany: jest.fn(), createMany: jest.fn() },
          workflowStage: { deleteMany: jest.fn(), create: jest.fn(), update: jest.fn() },
          stageMiniPrompt: { create: jest.fn() },
          miniPrompt: { findUnique: jest.fn(), create: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      (mockPrisma.workflowStage.count as jest.Mock).mockResolvedValue(0);

      await editWorkflowHandler(
        { workflow_id: 'workflow-1', name: 'New' },
        'owner-123'
      );

      expect(transactionOptions).toEqual({
        maxWait: 10000,
        timeout: 30000,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);
      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await editWorkflowHandler(
        { workflow_id: 'workflow-1', name: 'New' },
        'owner-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('Failed to update workflow');
    });

    it('should propagate prompt not found error message', async () => {
      const existingWorkflow = createMockExistingWorkflow();
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(existingWorkflow);
      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(
        new Error('Prompt not found: invalid-id')
      );

      const result = await editWorkflowHandler(
        { workflow_id: 'workflow-1', name: 'New' },
        'owner-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('Prompt not found: invalid-id');
    });
  });
});
