/**
 * Unit tests for get_all_my_prompts MCP handler
 * Tests pagination, search, and user filtering
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getAllMyPromptsHandler } from '@/server/mcp-tools-db/get-all-my-prompts-handler';
import { prisma } from '@/server/db/client';

// Mock dependencies
jest.mock('@/server/db/client', () => ({
  prisma: {
    miniPrompt: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@/server/db/retry', () => ({
  withRetry: jest.fn((fn: () => Promise<unknown>) => fn()),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('get_all_my_prompts handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create mock prompt data
  const createMockPrompt = (id: string, name: string, overrides: Record<string, unknown> = {}) => ({
    id,
    name,
    description: `Description for ${name}`,
    content: `Content for ${name}`,
    visibility: 'PRIVATE',
    isActive: true,
    key: `${name.toLowerCase().replace(/\s+/g, '-')}`,
    userId: 'user-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    tags: [{ tag: { id: 'tag-1', name: 'development' } }],
    ...overrides,
  });

  const createMockPrompts = (count: number, userId = 'user-123') => {
    return Array.from({ length: count }, (_, i) =>
      createMockPrompt(`prompt-${i + 1}`, `Prompt ${i + 1}`, { userId })
    );
  };

  describe('Happy Path Tests', () => {
    it('should return first page with default limit (20)', async () => {
      const mockPrompts = createMockPrompts(5);
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue(mockPrompts);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(5);

      const result = await getAllMyPromptsHandler({}, 'user-123');
      const data = JSON.parse(result.content[0].text);

      expect(data.prompts).toHaveLength(5);
      expect(data.total).toBe(5);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
      expect(data.totalPages).toBe(1);
    });

    it('should return empty array when user has no prompts', async () => {
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(0);

      const result = await getAllMyPromptsHandler({}, 'user-123');
      const data = JSON.parse(result.content[0].text);

      expect(data.prompts).toEqual([]);
      expect(data.total).toBe(0);
      expect(data.page).toBe(1);
      expect(data.totalPages).toBe(0);
    });

    it('should handle custom page and limit correctly', async () => {
      const mockPrompts = createMockPrompts(10);
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue(mockPrompts);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(25);

      const result = await getAllMyPromptsHandler({ page: 2, limit: 10 }, 'user-123');
      const data = JSON.parse(result.content[0].text);

      expect(data.page).toBe(2);
      expect(data.limit).toBe(10);
      expect(data.total).toBe(25);
      expect(data.totalPages).toBe(3);
    });

    it('should return prompts with all required fields', async () => {
      const mockPrompts = [createMockPrompt('prompt-1', 'Test Prompt')];
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue(mockPrompts);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllMyPromptsHandler({}, 'user-123');
      const data = JSON.parse(result.content[0].text);
      const prompt = data.prompts[0];

      expect(prompt).toHaveProperty('id');
      expect(prompt).toHaveProperty('name');
      expect(prompt).toHaveProperty('description');
      expect(prompt).toHaveProperty('content');
      expect(prompt).toHaveProperty('visibility');
      expect(prompt).toHaveProperty('isActive');
      expect(prompt).toHaveProperty('key');
      expect(prompt).toHaveProperty('createdAt');
      expect(prompt).toHaveProperty('updatedAt');
      expect(prompt).toHaveProperty('tags');
    });

    it('should include tags in response', async () => {
      const mockPrompts = [createMockPrompt('prompt-1', 'Test Prompt', {
        tags: [
          { tag: { id: 'tag-1', name: 'dev' } },
          { tag: { id: 'tag-2', name: 'api' } },
        ],
      })];
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue(mockPrompts);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllMyPromptsHandler({}, 'user-123');
      const data = JSON.parse(result.content[0].text);

      expect(data.prompts[0].tags).toContain('dev');
      expect(data.prompts[0].tags).toContain('api');
    });
  });

  describe('Search Tests', () => {
    it('should filter prompts by name search', async () => {
      const mockPrompts = [createMockPrompt('prompt-1', 'Testing Guide')];
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue(mockPrompts);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllMyPromptsHandler({ search: 'testing' }, 'user-123');
      const data = JSON.parse(result.content[0].text);

      expect(data.prompts).toHaveLength(1);
      expect(data.prompts[0].name).toBe('Testing Guide');

      // Verify the where clause was constructed correctly
      expect(mockPrisma.miniPrompt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.anything() }),
            ]),
          }),
        })
      );
    });

    it('should return empty array when search has no matches', async () => {
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(0);

      const result = await getAllMyPromptsHandler({ search: 'xyznonexistent123' }, 'user-123');
      const data = JSON.parse(result.content[0].text);

      expect(data.prompts).toEqual([]);
      expect(data.total).toBe(0);
    });

    it('should handle search with whitespace correctly', async () => {
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(0);

      await getAllMyPromptsHandler({ search: '  testing  ' }, 'user-123');

      // Verify search term is trimmed
      expect(mockPrisma.miniPrompt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { name: { contains: 'testing', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should handle empty search string (no filter)', async () => {
      const mockPrompts = createMockPrompts(3);
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue(mockPrompts);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(3);

      await getAllMyPromptsHandler({ search: '' }, 'user-123');

      // Verify no OR clause when search is empty
      expect(mockPrisma.miniPrompt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            OR: expect.anything(),
          }),
        })
      );
    });

    it('should search across name, content, and description', async () => {
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(0);

      await getAllMyPromptsHandler({ search: 'implement API' }, 'user-123');

      expect(mockPrisma.miniPrompt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'implement API', mode: 'insensitive' } },
              { content: { contains: 'implement API', mode: 'insensitive' } },
              { description: { contains: 'implement API', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });
  });

  describe('Authentication Tests', () => {
    it('should return auth warning for unauthenticated request', async () => {
      const result = await getAllMyPromptsHandler({}, null);

      expect(result.content[0].text).toContain('Authentication required');
    });

    it('should return prompts for authenticated user', async () => {
      const mockPrompts = createMockPrompts(2);
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue(mockPrompts);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(2);

      const result = await getAllMyPromptsHandler({}, 'user-123');
      const data = JSON.parse(result.content[0].text);

      expect(data.prompts).toHaveLength(2);
    });

    it('should only return prompts owned by the authenticated user', async () => {
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(0);

      await getAllMyPromptsHandler({}, 'user-123');

      expect(mockPrisma.miniPrompt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-123',
          }),
        })
      );
    });
  });

  describe('Validation Tests', () => {
    it('should default page to 1 when page is less than 1', async () => {
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(0);

      const result = await getAllMyPromptsHandler({ page: 0 }, 'user-123');
      const data = JSON.parse(result.content[0].text);

      expect(data.page).toBe(1);
    });

    it('should handle negative page number by defaulting to 1', async () => {
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(0);

      const result = await getAllMyPromptsHandler({ page: -5 }, 'user-123');
      const data = JSON.parse(result.content[0].text);

      expect(data.page).toBe(1);
    });

    it('should cap limit at 100 when exceeded', async () => {
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(0);

      const result = await getAllMyPromptsHandler({ limit: 500 }, 'user-123');
      const data = JSON.parse(result.content[0].text);

      expect(data.limit).toBe(100);
    });

    it('should default limit to 1 when 0 or negative', async () => {
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(0);

      const result = await getAllMyPromptsHandler({ limit: 0 }, 'user-123');
      const data = JSON.parse(result.content[0].text);

      expect(data.limit).toBe(1);
    });

    it('should handle negative limit by defaulting to 1', async () => {
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(0);

      const result = await getAllMyPromptsHandler({ limit: -10 }, 'user-123');
      const data = JSON.parse(result.content[0].text);

      expect(data.limit).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array for page beyond total pages', async () => {
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(5);

      const result = await getAllMyPromptsHandler({ page: 999 }, 'user-123');
      const data = JSON.parse(result.content[0].text);

      expect(data.prompts).toEqual([]);
      expect(data.page).toBe(999);
    });

    it('should only return isActive=true prompts', async () => {
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(0);

      await getAllMyPromptsHandler({}, 'user-123');

      expect(mockPrisma.miniPrompt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should order prompts by createdAt descending', async () => {
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(0);

      await getAllMyPromptsHandler({}, 'user-123');

      expect(mockPrisma.miniPrompt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should format dates as ISO strings', async () => {
      const mockPrompts = [createMockPrompt('prompt-1', 'Test')];
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue(mockPrompts);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(1);

      const result = await getAllMyPromptsHandler({}, 'user-123');
      const data = JSON.parse(result.content[0].text);

      expect(data.prompts[0].createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(data.prompts[0].updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('should calculate skip correctly for pagination', async () => {
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.miniPrompt.count as jest.Mock).mockResolvedValue(100);

      await getAllMyPromptsHandler({ page: 3, limit: 10 }, 'user-123');

      expect(mockPrisma.miniPrompt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (3-1) * 10
          take: 10,
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (mockPrisma.miniPrompt.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getAllMyPromptsHandler({}, 'user-123');

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('Failed to retrieve prompts');
    });
  });
});
