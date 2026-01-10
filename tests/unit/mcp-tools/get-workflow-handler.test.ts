/**
 * Unit tests for get_workflow MCP handler
 * Tests workflow retrieval with visibility and access control
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getWorkflowHandler } from '@/server/mcp-tools-db/get-workflow-handler';
import { prisma } from '@/server/db/client';

// Mock dependencies
jest.mock('@/server/db/client', () => ({
  prisma: {
    workflow: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('@/server/db/retry', () => ({
  withRetry: jest.fn((fn: () => Promise<unknown>) => fn()),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('get_workflow handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to create mock workflow data
  const createMockWorkflow = (overrides: Record<string, unknown> = {}) => ({
    id: 'workflow-1',
    name: 'Test Workflow',
    description: 'Test description',
    complexity: 'M',
    visibility: 'PUBLIC',
    isActive: true,
    key: 'test-workflow',
    userId: 'owner-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
    tags: [
      { tag: { id: 'tag-1', name: 'development' } },
      { tag: { id: 'tag-2', name: 'testing' } },
    ],
    models: [
      { model: { name: 'Claude', slug: 'claude-3', category: 'chat' } },
    ],
    stages: [
      {
        id: 'stage-1',
        name: 'Stage 1',
        description: 'First stage',
        color: '#64748b',
        order: 0,
        withReview: true,
        includeMultiAgentChat: false,
        miniPrompts: [
          {
            order: 0,
            miniPrompt: {
              id: 'prompt-1',
              name: 'Prompt 1',
              description: 'First prompt',
              content: 'Do something',
              visibility: 'PUBLIC',
              key: 'prompt-1',
            },
          },
        ],
      },
    ],
    ...overrides,
  });

  describe('Happy Path Tests', () => {
    it('should return PUBLIC workflow without authentication', async () => {
      const mockWorkflow = createMockWorkflow({ visibility: 'PUBLIC' });
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, null);

      expect(result.content[0].type).toBe('text');
      const data = JSON.parse(result.content[0].text);
      expect(data.id).toBe('workflow-1');
      expect(data.name).toBe('Test Workflow');
    });

    it('should return PUBLIC workflow for authenticated user (non-owner)', async () => {
      const mockWorkflow = createMockWorkflow({ visibility: 'PUBLIC', userId: 'owner-123' });
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, 'other-user');

      expect(result.content[0].type).toBe('text');
      const data = JSON.parse(result.content[0].text);
      expect(data.id).toBe('workflow-1');
    });

    it('should return PRIVATE workflow for authenticated owner', async () => {
      const mockWorkflow = createMockWorkflow({ visibility: 'PRIVATE', userId: 'owner-123' });
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, 'owner-123');

      expect(result.content[0].type).toBe('text');
      const data = JSON.parse(result.content[0].text);
      expect(data.id).toBe('workflow-1');
      expect(data.visibility).toBe('PRIVATE');
    });

    it('should return all stages ordered correctly', async () => {
      const mockWorkflow = createMockWorkflow({
        stages: [
          { id: 'stage-0', name: 'First', order: 0, miniPrompts: [], withReview: true, includeMultiAgentChat: false },
          { id: 'stage-1', name: 'Second', order: 1, miniPrompts: [], withReview: true, includeMultiAgentChat: false },
          { id: 'stage-2', name: 'Third', order: 2, miniPrompts: [], withReview: true, includeMultiAgentChat: false },
        ],
      });
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, null);
      const data = JSON.parse(result.content[0].text);

      expect(data.stages).toHaveLength(3);
      expect(data.stages[0].name).toBe('First');
      expect(data.stages[1].name).toBe('Second');
      expect(data.stages[2].name).toBe('Third');
    });

    it('should include all prompts within stages', async () => {
      const mockWorkflow = createMockWorkflow();
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, null);
      const data = JSON.parse(result.content[0].text);

      expect(data.stages[0].prompts).toHaveLength(1);
      expect(data.stages[0].prompts[0].name).toBe('Prompt 1');
      expect(data.stages[0].prompts[0].content).toBe('Do something');
    });

    it('should include associated tags', async () => {
      const mockWorkflow = createMockWorkflow();
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, null);
      const data = JSON.parse(result.content[0].text);

      expect(data.tags).toContain('development');
      expect(data.tags).toContain('testing');
    });

    it('should include model associations', async () => {
      const mockWorkflow = createMockWorkflow();
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, null);
      const data = JSON.parse(result.content[0].text);

      expect(data.models).toHaveLength(1);
      expect(data.models[0].name).toBe('Claude');
      expect(data.models[0].slug).toBe('claude-3');
    });
  });

  describe('Authentication Tests', () => {
    it('should not require auth for PUBLIC workflows', async () => {
      const mockWorkflow = createMockWorkflow({ visibility: 'PUBLIC' });
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, null);
      const data = JSON.parse(result.content[0].text);

      expect(data.id).toBe('workflow-1');
    });

    it('should require auth for PRIVATE workflows', async () => {
      const mockWorkflow = createMockWorkflow({ visibility: 'PRIVATE' });
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, null);

      expect(result.content[0].text).toContain('Authentication required');
    });
  });

  describe('Authorization Tests', () => {
    it('should allow owner to access their PRIVATE workflow', async () => {
      const mockWorkflow = createMockWorkflow({ visibility: 'PRIVATE', userId: 'owner-123' });
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, 'owner-123');
      const data = JSON.parse(result.content[0].text);

      expect(data.id).toBe('workflow-1');
    });

    it('should deny non-owner access to PRIVATE workflow', async () => {
      const mockWorkflow = createMockWorkflow({ visibility: 'PRIVATE', userId: 'owner-123' });
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, 'other-user');

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain("don't have access");
    });
  });

  describe('Validation Tests', () => {
    it('should return error for empty workflow_id', async () => {
      const result = await getWorkflowHandler({ workflow_id: '' }, null);

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('workflow_id is required');
    });

    it('should return error for whitespace-only workflow_id', async () => {
      const result = await getWorkflowHandler({ workflow_id: '   ' }, null);

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('workflow_id is required');
    });
  });

  describe('Edge Cases', () => {
    it('should return error for non-existent workflow_id', async () => {
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getWorkflowHandler({ workflow_id: 'non-existent' }, null);

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('Workflow not found');
    });

    it('should handle workflow with no stages', async () => {
      const mockWorkflow = createMockWorkflow({ stages: [] });
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, null);
      const data = JSON.parse(result.content[0].text);

      expect(data.stages).toEqual([]);
    });

    it('should handle workflow with no tags', async () => {
      const mockWorkflow = createMockWorkflow({ tags: [] });
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, null);
      const data = JSON.parse(result.content[0].text);

      expect(data.tags).toEqual([]);
    });

    it('should handle workflow with no models', async () => {
      const mockWorkflow = createMockWorkflow({ models: [] });
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, null);
      const data = JSON.parse(result.content[0].text);

      expect(data.models).toEqual([]);
    });

    it('should preserve special characters in workflow content', async () => {
      const mockWorkflow = createMockWorkflow({
        description: '# Title\n```js\ncode\n```\n emoji',
        stages: [{
          id: 'stage-1',
          name: 'Stage with <special> chars',
          order: 0,
          miniPrompts: [],
          withReview: true,
          includeMultiAgentChat: false,
        }],
      });
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, null);
      const data = JSON.parse(result.content[0].text);

      expect(data.description).toContain('```js');
      expect(data.stages[0].name).toContain('<special>');
    });

    it('should format dates as ISO strings', async () => {
      const mockWorkflow = createMockWorkflow();
      (mockPrisma.workflow.findUnique as jest.Mock).mockResolvedValue(mockWorkflow);

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, null);
      const data = JSON.parse(result.content[0].text);

      expect(data.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(data.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (mockPrisma.workflow.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getWorkflowHandler({ workflow_id: 'workflow-1' }, null);

      expect(result.content[0].text).toContain('Error:');
      expect(result.content[0].text).toContain('Failed to retrieve workflow');
    });
  });
});
