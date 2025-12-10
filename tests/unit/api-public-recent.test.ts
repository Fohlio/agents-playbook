import { describe, it, expect, beforeEach } from '@jest/globals';
import { prismaMock } from '@/server/db/__mocks__/client';
import { WorkflowComplexity, ModelCategory } from '@prisma/client';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      status: init?.status || 200,
      json: () => Promise.resolve(data),
    })),
  },
}));

jest.mock('@/server/db/client', () => ({
  prisma: prismaMock,
}));

// Import after mocks
import { GET } from '@/app/api/public/recent/route';

describe('GET /api/public/recent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockWorkflows = [
    {
      id: 'wf-1',
      name: 'Test Workflow 1',
      description: 'Description 1',
      complexity: WorkflowComplexity.M,
      visibility: 'PUBLIC',
      isActive: true,
      createdAt: new Date('2025-01-01'),
      user: { id: 'user-1', username: 'testuser' },
      stages: [{ id: 'stage-1' }],
      tags: [{ tag: { id: 'tag-1', name: 'Testing', color: '#blue' } }],
      models: [{ model: { id: 'model-1', name: 'Claude', slug: 'claude', category: ModelCategory.LLM } }],
      _count: { stages: 3, references: 10 },
    },
  ];

  const mockMiniPrompts = [
    {
      id: 'mp-1',
      name: 'Test Prompt 1',
      description: 'Prompt description',
      content: 'Prompt content here',
      visibility: 'PUBLIC',
      isActive: true,
      isAutomatic: false,
      isSystemMiniPrompt: false,
      createdAt: new Date('2025-01-01'),
      user: { id: 'user-1', username: 'testuser' },
      tags: [{ tag: { id: 'tag-1', name: 'Testing', color: '#blue' } }],
      models: [{ model: { id: 'model-1', name: 'Claude', slug: 'claude', category: ModelCategory.LLM } }],
      _count: { stageMiniPrompts: 5, references: 20 },
    },
  ];

  it('should return recent workflows and mini-prompts', async () => {
    prismaMock.workflow.findMany.mockResolvedValue(mockWorkflows as never);
    prismaMock.miniPrompt.findMany.mockResolvedValue(mockMiniPrompts as never);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.workflows).toBeDefined();
    expect(data.miniPrompts).toBeDefined();
    expect(data.workflows).toHaveLength(1);
    expect(data.miniPrompts).toHaveLength(1);
  });

  it('should only fetch public and active workflows', async () => {
    prismaMock.workflow.findMany.mockResolvedValue(mockWorkflows as never);
    prismaMock.miniPrompt.findMany.mockResolvedValue(mockMiniPrompts as never);

    await GET();

    expect(prismaMock.workflow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          visibility: 'PUBLIC',
          isActive: true,
        },
      })
    );
  });

  it('should only fetch public and active mini-prompts (excluding automatic)', async () => {
    prismaMock.workflow.findMany.mockResolvedValue(mockWorkflows as never);
    prismaMock.miniPrompt.findMany.mockResolvedValue(mockMiniPrompts as never);

    await GET();

    expect(prismaMock.miniPrompt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          visibility: 'PUBLIC',
          isActive: true,
          isAutomatic: false,
        },
      })
    );
  });

  it('should order by createdAt descending', async () => {
    prismaMock.workflow.findMany.mockResolvedValue(mockWorkflows as never);
    prismaMock.miniPrompt.findMany.mockResolvedValue(mockMiniPrompts as never);

    await GET();

    expect(prismaMock.workflow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    );
    expect(prismaMock.miniPrompt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      })
    );
  });

  it('should limit to 10 items each', async () => {
    prismaMock.workflow.findMany.mockResolvedValue(mockWorkflows as never);
    prismaMock.miniPrompt.findMany.mockResolvedValue(mockMiniPrompts as never);

    await GET();

    expect(prismaMock.workflow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
      })
    );
    expect(prismaMock.miniPrompt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 10,
      })
    );
  });

  it('should include user, stages, tags, and models for workflows', async () => {
    prismaMock.workflow.findMany.mockResolvedValue(mockWorkflows as never);
    prismaMock.miniPrompt.findMany.mockResolvedValue(mockMiniPrompts as never);

    await GET();

    expect(prismaMock.workflow.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          user: { select: { id: true, username: true } },
          stages: expect.any(Object),
          tags: expect.any(Object),
          models: expect.any(Object),
          _count: expect.any(Object),
        }),
      })
    );
  });

  it('should include user, tags, and models for mini-prompts', async () => {
    prismaMock.workflow.findMany.mockResolvedValue(mockWorkflows as never);
    prismaMock.miniPrompt.findMany.mockResolvedValue(mockMiniPrompts as never);

    await GET();

    expect(prismaMock.miniPrompt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          user: { select: { id: true, username: true } },
          tags: expect.any(Object),
          models: expect.any(Object),
          _count: expect.any(Object),
        }),
      })
    );
  });

  it('should return empty arrays when no items exist', async () => {
    prismaMock.workflow.findMany.mockResolvedValue([]);
    prismaMock.miniPrompt.findMany.mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.workflows).toHaveLength(0);
    expect(data.miniPrompts).toHaveLength(0);
  });

  it('should handle database errors gracefully', async () => {
    prismaMock.workflow.findMany.mockRejectedValue(new Error('Database error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to fetch recent items');
  });
});
