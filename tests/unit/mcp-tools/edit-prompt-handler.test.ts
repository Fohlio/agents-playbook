/**
 * Unit tests for edit_prompt MCP handler
 * Tests ownership verification, updates, and soft delete
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { editPromptHandler } from '@/server/mcp-tools-db/edit-prompt-handler';
import { prisma } from '@/server/db/client';

// Mock dependencies
jest.mock('@/server/db/client', () => ({
  prisma: {
    $transaction: jest.fn(),
    miniPrompt: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    miniPromptTag: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
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

jest.mock('@/features/mini-prompts/lib/embedding-service', () => ({
  triggerMiniPromptEmbedding: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('edit_prompt handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create mock existing prompt
  const createMockExistingPrompt = (overrides: Record<string, unknown> = {}) => ({
    id: 'prompt-1',
    userId: 'owner-123',
    isSystemMiniPrompt: false,
    content: 'Original content',
    ...overrides,
  });

  // Helper to create mock updated prompt
  const createMockUpdatedPrompt = (overrides: Record<string, unknown> = {}) => ({
    id: 'prompt-1',
    name: 'Updated Prompt',
    description: 'Updated description',
    visibility: 'PRIVATE',
    isActive: true,
    updatedAt: new Date('2024-01-15'),
    ...overrides,
  });

  // Helper to setup transaction mock
  const setupTransactionMock = (updatedPrompt: Record<string, unknown>) => {
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const tx = {
        miniPrompt: {
          update: jest.fn().mockResolvedValue(updatedPrompt),
        },
        miniPromptTag: {
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
          createMany: jest.fn().mockResolvedValue({ count: 0 }),
        },
        tag: {
          findFirst: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({ id: 'tag-1', name: 'test-tag' }),
        },
      };
      return fn(tx);
    });
  };

  describe('Happy Path Tests', () => {
    it('should update single field (name)', async () => {
      const existingPrompt = createMockExistingPrompt();
      const updatedPrompt = createMockUpdatedPrompt({ name: 'New Name' });

      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);
      setupTransactionMock(updatedPrompt);

      const result = await editPromptHandler(
        { prompt_id: 'prompt-1', name: 'New Name' },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Prompt updated successfully');
      expect(data.prompt.name).toBe('New Name');
    });

    it('should update multiple fields', async () => {
      const existingPrompt = createMockExistingPrompt();
      const updatedPrompt = createMockUpdatedPrompt({
        name: 'New Name',
        description: 'New desc',
        visibility: 'PUBLIC',
      });

      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);
      setupTransactionMock(updatedPrompt);

      const result = await editPromptHandler(
        {
          prompt_id: 'prompt-1',
          name: 'New Name',
          description: 'New desc',
          visibility: 'PUBLIC',
        },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Prompt updated successfully');
      expect(data.prompt.visibility).toBe('PUBLIC');
    });

    it('should update content and trigger embedding regeneration', async () => {
      const { triggerMiniPromptEmbedding } = require('@/features/mini-prompts/lib/embedding-service');

      const existingPrompt = createMockExistingPrompt({ content: 'Old content' });
      const updatedPrompt = createMockUpdatedPrompt();

      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);
      setupTransactionMock(updatedPrompt);

      await editPromptHandler(
        { prompt_id: 'prompt-1', content: 'New content' },
        'owner-123'
      );

      expect(triggerMiniPromptEmbedding).toHaveBeenCalledWith('prompt-1');
    });

    it('should replace tags completely', async () => {
      const existingPrompt = createMockExistingPrompt();
      const updatedPrompt = createMockUpdatedPrompt();

      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);

      let deleteManyCalled = false;
      let createManyData: Array<{ miniPromptId: string; tagId: string }> = [];

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          miniPrompt: {
            update: jest.fn().mockResolvedValue(updatedPrompt),
          },
          miniPromptTag: {
            deleteMany: jest.fn().mockImplementation(() => {
              deleteManyCalled = true;
              return { count: 2 };
            }),
            createMany: jest.fn().mockImplementation((args) => {
              createManyData = args.data;
              return { count: args.data.length };
            }),
          },
          tag: {
            findFirst: jest.fn().mockResolvedValue({ id: 'new-tag-id', name: 'new-tag' }),
            create: jest.fn(),
          },
        };
        return fn(tx);
      });

      await editPromptHandler(
        { prompt_id: 'prompt-1', tags: ['new-tag'] },
        'owner-123'
      );

      expect(deleteManyCalled).toBe(true);
      expect(createManyData).toHaveLength(1);
    });

    it('should clear all tags when given empty array', async () => {
      const existingPrompt = createMockExistingPrompt();
      const updatedPrompt = createMockUpdatedPrompt();

      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);

      let deleteManyCalled = false;
      let createManyCalled = false;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          miniPrompt: {
            update: jest.fn().mockResolvedValue(updatedPrompt),
          },
          miniPromptTag: {
            deleteMany: jest.fn().mockImplementation(() => {
              deleteManyCalled = true;
              return { count: 2 };
            }),
            createMany: jest.fn().mockImplementation(() => {
              createManyCalled = true;
              return { count: 0 };
            }),
          },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await editPromptHandler(
        { prompt_id: 'prompt-1', tags: [] },
        'owner-123'
      );

      expect(deleteManyCalled).toBe(true);
      expect(createManyCalled).toBe(false); // Should not create when empty
    });

    it('should soft delete via is_active=false', async () => {
      const existingPrompt = createMockExistingPrompt();
      const updatedPrompt = createMockUpdatedPrompt({ isActive: false });

      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);
      setupTransactionMock(updatedPrompt);

      const result = await editPromptHandler(
        { prompt_id: 'prompt-1', is_active: false },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.prompt.isActive).toBe(false);
    });

    it('should restore soft-deleted prompt', async () => {
      const existingPrompt = createMockExistingPrompt();
      const updatedPrompt = createMockUpdatedPrompt({ isActive: true });

      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);
      setupTransactionMock(updatedPrompt);

      const result = await editPromptHandler(
        { prompt_id: 'prompt-1', is_active: true },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.prompt.isActive).toBe(true);
    });
  });

  describe('Authentication Tests', () => {
    it('should return auth warning for unauthenticated request', async () => {
      const result = await editPromptHandler(
        { prompt_id: 'prompt-1', name: 'New' },
        null
      );

      expect(result.content[0].text).toContain('Authentication required');
    });
  });

  describe('Authorization Tests', () => {
    it('should allow owner to edit their prompt', async () => {
      const existingPrompt = createMockExistingPrompt({ userId: 'owner-123' });
      const updatedPrompt = createMockUpdatedPrompt();

      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);
      setupTransactionMock(updatedPrompt);

      const result = await editPromptHandler(
        { prompt_id: 'prompt-1', name: 'New' },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Prompt updated successfully');
    });

    it('should deny non-owner edit attempt', async () => {
      const existingPrompt = createMockExistingPrompt({ userId: 'owner-123' });
      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);

      const result = await editPromptHandler(
        { prompt_id: 'prompt-1', name: 'Hack' },
        'other-user'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain("don't have permission");
    });

    it('should deny edit of system prompt', async () => {
      const existingPrompt = createMockExistingPrompt({
        userId: 'owner-123',
        isSystemMiniPrompt: true,
      });
      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);

      const result = await editPromptHandler(
        { prompt_id: 'prompt-1', name: 'Modify' },
        'owner-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('System prompts cannot be modified');
    });
  });

  describe('Validation Tests', () => {
    it('should return error for non-existent prompt_id', async () => {
      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await editPromptHandler(
        { prompt_id: 'non-existent', name: 'New' },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('Prompt not found');
    });

    it('should return error for empty prompt_id', async () => {
      const result = await editPromptHandler(
        { prompt_id: '', name: 'New' },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('prompt_id is required');
    });

    it('should return error for whitespace-only prompt_id', async () => {
      const result = await editPromptHandler(
        { prompt_id: '   ', name: 'New' },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('prompt_id is required');
    });
  });

  describe('Edge Cases', () => {
    it('should allow update with no changes (only prompt_id)', async () => {
      const existingPrompt = createMockExistingPrompt();
      const updatedPrompt = createMockUpdatedPrompt();

      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);
      setupTransactionMock(updatedPrompt);

      const result = await editPromptHandler(
        { prompt_id: 'prompt-1' },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Prompt updated successfully');
    });

    it('should trim name when updating', async () => {
      const existingPrompt = createMockExistingPrompt();
      const updatedPrompt = createMockUpdatedPrompt({ name: 'Trimmed Name' });

      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);

      let capturedUpdateData: Record<string, unknown> | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          miniPrompt: {
            update: jest.fn().mockImplementation((args) => {
              capturedUpdateData = args.data;
              return updatedPrompt;
            }),
          },
          miniPromptTag: { deleteMany: jest.fn(), createMany: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await editPromptHandler(
        { prompt_id: 'prompt-1', name: '  Trimmed Name  ' },
        'owner-123'
      );

      expect(capturedUpdateData).toBeDefined();
      expect(capturedUpdateData!.name).toBe('Trimmed Name');
    });

    it('should set description to null when empty string provided', async () => {
      const existingPrompt = createMockExistingPrompt();
      const updatedPrompt = createMockUpdatedPrompt({ description: null });

      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);

      let capturedUpdateData: Record<string, unknown> | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          miniPrompt: {
            update: jest.fn().mockImplementation((args) => {
              capturedUpdateData = args.data;
              return updatedPrompt;
            }),
          },
          miniPromptTag: { deleteMany: jest.fn(), createMany: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await editPromptHandler(
        { prompt_id: 'prompt-1', description: '' },
        'owner-123'
      );

      expect(capturedUpdateData).toBeDefined();
      expect(capturedUpdateData!.description).toBeNull();
    });

    it('should trigger embedding when description changes', async () => {
      const { triggerMiniPromptEmbedding } = require('@/features/mini-prompts/lib/embedding-service');
      triggerMiniPromptEmbedding.mockClear();

      const existingPrompt = createMockExistingPrompt();
      const updatedPrompt = createMockUpdatedPrompt();

      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);
      setupTransactionMock(updatedPrompt);

      await editPromptHandler(
        { prompt_id: 'prompt-1', description: 'New description' },
        'owner-123'
      );

      expect(triggerMiniPromptEmbedding).toHaveBeenCalledWith('prompt-1');
    });

    it('should trigger embedding when tags change', async () => {
      const { triggerMiniPromptEmbedding } = require('@/features/mini-prompts/lib/embedding-service');
      triggerMiniPromptEmbedding.mockClear();

      const existingPrompt = createMockExistingPrompt();
      const updatedPrompt = createMockUpdatedPrompt();

      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          miniPrompt: { update: jest.fn().mockResolvedValue(updatedPrompt) },
          miniPromptTag: {
            deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          tag: {
            findFirst: jest.fn().mockResolvedValue({ id: 'tag-1', name: 'new' }),
            create: jest.fn(),
          },
        };
        return fn(tx);
      });

      await editPromptHandler(
        { prompt_id: 'prompt-1', tags: ['new-tag'] },
        'owner-123'
      );

      expect(triggerMiniPromptEmbedding).toHaveBeenCalledWith('prompt-1');
    });

    it('should NOT trigger embedding when only name changes', async () => {
      const { triggerMiniPromptEmbedding } = require('@/features/mini-prompts/lib/embedding-service');
      triggerMiniPromptEmbedding.mockClear();

      const existingPrompt = createMockExistingPrompt();
      const updatedPrompt = createMockUpdatedPrompt();

      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);
      setupTransactionMock(updatedPrompt);

      await editPromptHandler(
        { prompt_id: 'prompt-1', name: 'New Name' },
        'owner-123'
      );

      // Name change alone should not trigger embedding
      expect(triggerMiniPromptEmbedding).not.toHaveBeenCalled();
    });

    it('should format updatedAt as ISO string', async () => {
      const existingPrompt = createMockExistingPrompt();
      const updatedPrompt = createMockUpdatedPrompt({
        updatedAt: new Date('2024-01-15T10:30:00Z'),
      });

      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);
      setupTransactionMock(updatedPrompt);

      const result = await editPromptHandler(
        { prompt_id: 'prompt-1', name: 'New' },
        'owner-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.prompt.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const existingPrompt = createMockExistingPrompt();
      (mockPrisma.miniPrompt.findUnique as jest.Mock).mockResolvedValue(existingPrompt);
      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await editPromptHandler(
        { prompt_id: 'prompt-1', name: 'New' },
        'owner-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('Failed to update prompt');
    });
  });
});
