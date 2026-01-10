/**
 * Unit tests for add_prompt MCP handler
 * Tests prompt creation with validation and transaction handling
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { addPromptHandler } from '@/server/mcp-tools-db/add-prompt-handler';
import { prisma } from '@/server/db/client';

// Mock dependencies
jest.mock('@/server/db/client', () => ({
  prisma: {
    $transaction: jest.fn(),
    miniPrompt: {
      create: jest.fn(),
    },
    miniPromptTag: {
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

jest.mock('@/shared/lib/generate-key', () => ({
  generateUniqueKey: jest.fn((name: string) => `${name.toLowerCase().replace(/\s+/g, '-')}-abc123`),
}));

jest.mock('@/features/mini-prompts/lib/embedding-service', () => ({
  triggerMiniPromptEmbedding: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('add_prompt handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to setup successful transaction mock
  const setupTransactionMock = (createdPrompt: Record<string, unknown>) => {
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const tx = {
        miniPrompt: {
          create: jest.fn().mockResolvedValue(createdPrompt),
        },
        miniPromptTag: {
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
    it('should create prompt with required fields only', async () => {
      const createdPrompt = {
        id: 'prompt-1',
        name: 'My Prompt',
        content: 'Prompt content here',
        description: null,
        visibility: 'PRIVATE',
        key: 'my-prompt-abc123',
        isActive: true,
        userId: 'user-123',
        createdAt: new Date('2024-01-01'),
      };
      setupTransactionMock(createdPrompt);

      const result = await addPromptHandler(
        { name: 'My Prompt', content: 'Prompt content here' },
        'user-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Prompt created successfully');
      expect(data.prompt.id).toBe('prompt-1');
      expect(data.prompt.name).toBe('My Prompt');
      expect(data.prompt.visibility).toBe('PRIVATE');
    });

    it('should create prompt with all optional fields', async () => {
      const createdPrompt = {
        id: 'prompt-1',
        name: 'Full Prompt',
        content: 'Content here',
        description: 'Description here',
        visibility: 'PUBLIC',
        key: 'full-prompt-abc123',
        isActive: true,
        userId: 'user-123',
        createdAt: new Date('2024-01-01'),
      };

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          miniPrompt: {
            create: jest.fn().mockResolvedValue(createdPrompt),
          },
          miniPromptTag: {
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          tag: {
            findFirst: jest.fn().mockResolvedValue({ id: 'tag-1', name: 'dev' }),
            create: jest.fn(),
          },
        };
        return fn(tx);
      });

      const result = await addPromptHandler(
        {
          name: 'Full Prompt',
          content: 'Content here',
          description: 'Description here',
          visibility: 'PUBLIC',
          tags: ['dev', 'api'],
        },
        'user-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Prompt created successfully');
      expect(data.prompt.visibility).toBe('PUBLIC');
    });

    it('should return unique key for created prompt', async () => {
      const createdPrompt = {
        id: 'prompt-1',
        name: 'Test',
        content: 'Content',
        visibility: 'PRIVATE',
        key: 'test-abc123',
        isActive: true,
        userId: 'user-123',
        createdAt: new Date('2024-01-01'),
      };
      setupTransactionMock(createdPrompt);

      const result = await addPromptHandler(
        { name: 'Test', content: 'Content' },
        'user-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.prompt.key).toBe('test-abc123');
    });

    it('should default visibility to PRIVATE when not specified', async () => {
      let capturedCreateData: Record<string, unknown> | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          miniPrompt: {
            create: jest.fn().mockImplementation((args) => {
              capturedCreateData = args.data;
              return {
                id: 'prompt-1',
                name: 'Test',
                content: 'Content',
                visibility: 'PRIVATE',
                key: 'test-abc123',
                isActive: true,
                userId: 'user-123',
                createdAt: new Date(),
              };
            }),
          },
          miniPromptTag: { createMany: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addPromptHandler({ name: 'Test', content: 'Content' }, 'user-123');

      expect(capturedCreateData).toBeDefined();
      expect(capturedCreateData!.visibility).toBe('PRIVATE');
    });

    it('should set isActive to true for new prompts', async () => {
      let capturedCreateData: Record<string, unknown> | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          miniPrompt: {
            create: jest.fn().mockImplementation((args) => {
              capturedCreateData = args.data;
              return {
                id: 'prompt-1',
                name: 'Test',
                content: 'Content',
                visibility: 'PRIVATE',
                key: 'test-abc123',
                isActive: true,
                userId: 'user-123',
                createdAt: new Date(),
              };
            }),
          },
          miniPromptTag: { createMany: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addPromptHandler({ name: 'Test', content: 'Content' }, 'user-123');

      expect(capturedCreateData).toBeDefined();
      expect(capturedCreateData!.isActive).toBe(true);
    });

    it('should set isSystemMiniPrompt to false for user-created prompts', async () => {
      let capturedCreateData: Record<string, unknown> | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          miniPrompt: {
            create: jest.fn().mockImplementation((args) => {
              capturedCreateData = args.data;
              return {
                id: 'prompt-1',
                name: 'Test',
                content: 'Content',
                visibility: 'PRIVATE',
                key: 'test-abc123',
                isActive: true,
                userId: 'user-123',
                createdAt: new Date(),
              };
            }),
          },
          miniPromptTag: { createMany: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addPromptHandler({ name: 'Test', content: 'Content' }, 'user-123');

      expect(capturedCreateData).toBeDefined();
      expect(capturedCreateData!.isSystemMiniPrompt).toBe(false);
    });
  });

  describe('Tag Handling Tests', () => {
    it('should create new tags if they do not exist', async () => {
      let tagCreateCalled = false;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          miniPrompt: {
            create: jest.fn().mockResolvedValue({
              id: 'prompt-1',
              name: 'Test',
              content: 'Content',
              visibility: 'PRIVATE',
              key: 'test-abc123',
              isActive: true,
              userId: 'user-123',
              createdAt: new Date(),
            }),
          },
          miniPromptTag: { createMany: jest.fn() },
          tag: {
            findFirst: jest.fn().mockResolvedValue(null), // Tag doesn't exist
            create: jest.fn().mockImplementation(() => {
              tagCreateCalled = true;
              return { id: 'new-tag', name: 'brand-new-tag' };
            }),
          },
        };
        return fn(tx);
      });

      await addPromptHandler(
        { name: 'Test', content: 'Content', tags: ['brand-new-tag'] },
        'user-123'
      );

      expect(tagCreateCalled).toBe(true);
    });

    it('should reuse existing tags (case-insensitive)', async () => {
      let tagCreateCalled = false;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          miniPrompt: {
            create: jest.fn().mockResolvedValue({
              id: 'prompt-1',
              name: 'Test',
              content: 'Content',
              visibility: 'PRIVATE',
              key: 'test-abc123',
              isActive: true,
              userId: 'user-123',
              createdAt: new Date(),
            }),
          },
          miniPromptTag: { createMany: jest.fn() },
          tag: {
            findFirst: jest.fn().mockResolvedValue({ id: 'existing-tag', name: 'development' }),
            create: jest.fn().mockImplementation(() => {
              tagCreateCalled = true;
              return { id: 'new-tag', name: 'development' };
            }),
          },
        };
        return fn(tx);
      });

      await addPromptHandler(
        { name: 'Test', content: 'Content', tags: ['Development'] },
        'user-123'
      );

      expect(tagCreateCalled).toBe(false);
    });

    it('should handle empty tags array without error', async () => {
      const createdPrompt = {
        id: 'prompt-1',
        name: 'Test',
        content: 'Content',
        visibility: 'PRIVATE',
        key: 'test-abc123',
        isActive: true,
        userId: 'user-123',
        createdAt: new Date(),
      };
      setupTransactionMock(createdPrompt);

      const result = await addPromptHandler(
        { name: 'Test', content: 'Content', tags: [] },
        'user-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Prompt created successfully');
    });
  });

  describe('Authentication Tests', () => {
    it('should return auth warning for unauthenticated request', async () => {
      const result = await addPromptHandler(
        { name: 'Test', content: 'Content' },
        null
      );

      expect(result.content[0].text).toContain('Authentication required');
    });

    it('should create prompt with correct userId', async () => {
      let capturedUserId: string | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          miniPrompt: {
            create: jest.fn().mockImplementation((args) => {
              capturedUserId = args.data.userId;
              return {
                id: 'prompt-1',
                name: 'Test',
                content: 'Content',
                visibility: 'PRIVATE',
                key: 'test-abc123',
                isActive: true,
                userId: 'user-123',
                createdAt: new Date(),
              };
            }),
          },
          miniPromptTag: { createMany: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addPromptHandler({ name: 'Test', content: 'Content' }, 'user-123');

      expect(capturedUserId).toBe('user-123');
    });
  });

  describe('Validation Tests', () => {
    it('should return error for empty name', async () => {
      const result = await addPromptHandler(
        { name: '', content: 'Content' },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('name is required');
    });

    it('should return error for whitespace-only name', async () => {
      const result = await addPromptHandler(
        { name: '   ', content: 'Content' },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('name is required');
    });

    it('should return error for empty content', async () => {
      const result = await addPromptHandler(
        { name: 'Test', content: '' },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('content is required');
    });

    it('should return error for whitespace-only content', async () => {
      const result = await addPromptHandler(
        { name: 'Test', content: '   ' },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('content is required');
    });
  });

  describe('Edge Cases', () => {
    it('should trim name when creating prompt', async () => {
      let capturedName: string | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          miniPrompt: {
            create: jest.fn().mockImplementation((args) => {
              capturedName = args.data.name;
              return {
                id: 'prompt-1',
                name: 'Test',
                content: 'Content',
                visibility: 'PRIVATE',
                key: 'test-abc123',
                isActive: true,
                userId: 'user-123',
                createdAt: new Date(),
              };
            }),
          },
          miniPromptTag: { createMany: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addPromptHandler(
        { name: '  My Prompt  ', content: 'Content' },
        'user-123'
      );

      expect(capturedName).toBe('My Prompt');
    });

    it('should trim description when provided', async () => {
      let capturedDescription: string | null = null;

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          miniPrompt: {
            create: jest.fn().mockImplementation((args) => {
              capturedDescription = args.data.description;
              return {
                id: 'prompt-1',
                name: 'Test',
                content: 'Content',
                description: 'Trimmed desc',
                visibility: 'PRIVATE',
                key: 'test-abc123',
                isActive: true,
                userId: 'user-123',
                createdAt: new Date(),
              };
            }),
          },
          miniPromptTag: { createMany: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addPromptHandler(
        { name: 'Test', content: 'Content', description: '  My description  ' },
        'user-123'
      );

      expect(capturedDescription).toBe('My description');
    });

    it('should preserve special characters in content', async () => {
      let capturedContent: string | null = null;
      const specialContent = '# Title\n```js\ncode\n```\n emoji';

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
        const tx = {
          miniPrompt: {
            create: jest.fn().mockImplementation((args) => {
              capturedContent = args.data.content;
              return {
                id: 'prompt-1',
                name: 'Test',
                content: specialContent,
                visibility: 'PRIVATE',
                key: 'test-abc123',
                isActive: true,
                userId: 'user-123',
                createdAt: new Date(),
              };
            }),
          },
          miniPromptTag: { createMany: jest.fn() },
          tag: { findFirst: jest.fn(), create: jest.fn() },
        };
        return fn(tx);
      });

      await addPromptHandler(
        { name: 'Test', content: specialContent },
        'user-123'
      );

      expect(capturedContent).toBe(specialContent);
    });

    it('should handle name with special characters', async () => {
      const createdPrompt = {
        id: 'prompt-1',
        name: 'Prompt <script>alert(1)</script>',
        content: 'Content',
        visibility: 'PRIVATE',
        key: 'prompt-alert-abc123',
        isActive: true,
        userId: 'user-123',
        createdAt: new Date(),
      };
      setupTransactionMock(createdPrompt);

      const result = await addPromptHandler(
        { name: 'Prompt <script>alert(1)</script>', content: 'Content' },
        'user-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.message).toBe('Prompt created successfully');
      expect(data.prompt.name).toContain('<script>');
    });

    it('should return formatted createdAt date', async () => {
      const createdPrompt = {
        id: 'prompt-1',
        name: 'Test',
        content: 'Content',
        visibility: 'PRIVATE',
        key: 'test-abc123',
        isActive: true,
        userId: 'user-123',
        createdAt: new Date('2024-01-15T10:30:00Z'),
      };
      setupTransactionMock(createdPrompt);

      const result = await addPromptHandler(
        { name: 'Test', content: 'Content' },
        'user-123'
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.prompt.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('Embedding Trigger Tests', () => {
    it('should trigger embedding generation after successful creation', async () => {
      const { triggerMiniPromptEmbedding } = require('@/features/mini-prompts/lib/embedding-service');

      const createdPrompt = {
        id: 'prompt-1',
        name: 'Test',
        content: 'Content',
        visibility: 'PRIVATE',
        key: 'test-abc123',
        isActive: true,
        userId: 'user-123',
        createdAt: new Date(),
      };
      setupTransactionMock(createdPrompt);

      await addPromptHandler({ name: 'Test', content: 'Content' }, 'user-123');

      expect(triggerMiniPromptEmbedding).toHaveBeenCalledWith('prompt-1');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await addPromptHandler(
        { name: 'Test', content: 'Content' },
        'user-123'
      );

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('Failed to create prompt');
    });
  });
});
