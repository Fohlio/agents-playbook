import { describe, it, expect, beforeEach } from '@jest/globals';
import { prismaMock } from '@/server/db/__mocks__/client';
import { ModelCategory } from '@prisma/client';

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
import { GET } from '@/app/api/models/route';

describe('GET /api/models', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockModels = [
    { id: '1', name: 'Claude', slug: 'claude', category: ModelCategory.LLM, createdAt: new Date() },
    { id: '2', name: 'GPT-5', slug: 'gpt-5', category: ModelCategory.LLM, createdAt: new Date() },
    { id: '3', name: 'Gemini', slug: 'gemini', category: ModelCategory.LLM, createdAt: new Date() },
    { id: '4', name: 'Midjourney', slug: 'midjourney', category: ModelCategory.IMAGE, createdAt: new Date() },
    { id: '5', name: 'DALL-E', slug: 'dall-e', category: ModelCategory.IMAGE, createdAt: new Date() },
  ];

  it('should return all models', async () => {
    prismaMock.model.findMany.mockResolvedValue(mockModels);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.models).toHaveLength(5);
    expect(prismaMock.model.findMany).toHaveBeenCalledWith({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  });

  it('should group models by category', async () => {
    prismaMock.model.findMany.mockResolvedValue(mockModels);

    const response = await GET();
    const data = await response.json();

    expect(data.byCategory).toBeDefined();
    expect(data.byCategory.LLM).toHaveLength(3);
    expect(data.byCategory.IMAGE).toHaveLength(2);
  });

  it('should return LLM models in correct category', async () => {
    prismaMock.model.findMany.mockResolvedValue(mockModels);

    const response = await GET();
    const data = await response.json();

    const llmNames = data.byCategory.LLM.map((m: { name: string }) => m.name);
    expect(llmNames).toContain('Claude');
    expect(llmNames).toContain('GPT-5');
    expect(llmNames).toContain('Gemini');
  });

  it('should return IMAGE models in correct category', async () => {
    prismaMock.model.findMany.mockResolvedValue(mockModels);

    const response = await GET();
    const data = await response.json();

    const imageNames = data.byCategory.IMAGE.map((m: { name: string }) => m.name);
    expect(imageNames).toContain('Midjourney');
    expect(imageNames).toContain('DALL-E');
  });

  it('should return empty arrays when no models exist', async () => {
    prismaMock.model.findMany.mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.models).toHaveLength(0);
    expect(data.byCategory.LLM).toHaveLength(0);
    expect(data.byCategory.IMAGE).toHaveLength(0);
  });

  it('should return models with correct structure', async () => {
    prismaMock.model.findMany.mockResolvedValue(mockModels);

    const response = await GET();
    const data = await response.json();

    const model = data.models[0];
    expect(model).toHaveProperty('id');
    expect(model).toHaveProperty('name');
    expect(model).toHaveProperty('slug');
    expect(model).toHaveProperty('category');
  });

  it('should order models by category first, then by name', async () => {
    const unorderedModels = [
      { id: '1', name: 'Midjourney', slug: 'midjourney', category: ModelCategory.IMAGE, createdAt: new Date() },
      { id: '2', name: 'Claude', slug: 'claude', category: ModelCategory.LLM, createdAt: new Date() },
    ];
    prismaMock.model.findMany.mockResolvedValue(unorderedModels);

    const response = await GET();
    const data = await response.json();

    // Verify the query uses correct ordering
    expect(prismaMock.model.findMany).toHaveBeenCalledWith({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
    expect(data.models).toHaveLength(2);
  });
});
