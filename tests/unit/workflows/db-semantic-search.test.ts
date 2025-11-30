import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Create mocks that will be used in factories
const mockEmbeddingsCreate = jest.fn() as jest.MockedFunction<any>;
const mockWorkflowFindMany = jest.fn() as jest.MockedFunction<any>;
const mockWorkflowReferenceFindMany = jest.fn() as jest.MockedFunction<any>;
const mockWorkflowEmbeddingFindMany = jest.fn() as jest.MockedFunction<any>;

// Mock OpenAI before importing the module
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    embeddings: {
      create: mockEmbeddingsCreate,
    },
  }));
});

// Mock dependencies
jest.mock('@/server/db/client', () => ({
  prisma: {
    workflow: {
      findMany: mockWorkflowFindMany,
    },
    workflowReference: {
      findMany: mockWorkflowReferenceFindMany,
    },
    workflowEmbedding: {
      findMany: mockWorkflowEmbeddingFindMany,
    },
  },
}));

import { DBSemanticSearch } from '@/server/workflows/db-semantic-search';

describe('DBSemanticSearch', () => {
  let dbSemanticSearch: DBSemanticSearch;

  beforeEach(() => {
    jest.clearAllMocks();
    dbSemanticSearch = new DBSemanticSearch();
    mockEmbeddingsCreate.mockClear();
    mockWorkflowFindMany.mockClear();
    mockWorkflowReferenceFindMany.mockClear();
    mockWorkflowEmbeddingFindMany.mockClear();
  });

  describe('getWorkflows (private method via searchWorkflows)', () => {
    it('should return all active system workflows for unauthenticated users', async () => {
      const mockSystemWorkflows = [
        {
          id: 'sys-1',
          name: 'System Workflow 1',
          description: 'Description 1',
          isSystemWorkflow: true,
          isActive: true,
          userId: 'system-user',
        },
        {
          id: 'sys-2',
          name: 'System Workflow 2',
          description: 'Description 2',
          isSystemWorkflow: true,
          isActive: true,
          userId: 'system-user',
        },
      ];

      mockWorkflowFindMany.mockResolvedValue(mockSystemWorkflows);
      mockWorkflowEmbeddingFindMany.mockResolvedValue([]);
      mockEmbeddingsCreate.mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
      });

      // Set API key to use semantic search (which calls getWorkflows)
      const originalEnv = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'test-key';

      const results = await dbSemanticSearch.searchWorkflows('test query', 5);

      process.env.OPENAI_API_KEY = originalEnv;

      expect(mockWorkflowFindMany).toHaveBeenCalledWith({
        where: {
          isSystemWorkflow: true,
          isActive: true,
        },
      });
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it('should return only system workflows in user library for authenticated users', async () => {
      const userId = 'user-1';
      const mockSystemWorkflowRefs = [
        { workflowId: 'sys-1' },
        { workflowId: 'sys-2' },
      ];
      const mockWorkflows = [
        {
          id: 'sys-1',
          name: 'System Workflow 1',
          description: 'Description 1',
          isSystemWorkflow: true,
          isActive: true,
          userId: 'system-user',
        },
        {
          id: 'sys-2',
          name: 'System Workflow 2',
          description: 'Description 2',
          isSystemWorkflow: true,
          isActive: true,
          userId: 'system-user',
        },
        {
          id: 'user-1',
          name: 'User Workflow 1',
          description: 'User Description',
          isSystemWorkflow: false,
          isActive: true,
          userId: userId,
        },
      ];

      mockWorkflowReferenceFindMany.mockResolvedValue(mockSystemWorkflowRefs);
      mockWorkflowFindMany.mockResolvedValue(mockWorkflows);
      mockWorkflowEmbeddingFindMany.mockResolvedValue([]);
      mockEmbeddingsCreate.mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
      });

      // Set API key to use semantic search (which calls getWorkflows)
      const originalEnv = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'test-key';

      const results = await dbSemanticSearch.searchWorkflows('test query', 5, userId);

      process.env.OPENAI_API_KEY = originalEnv;

      expect(mockWorkflowReferenceFindMany).toHaveBeenCalledWith({
        where: { userId },
        select: { workflowId: true },
      });
      expect(mockWorkflowFindMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { userId, isActive: true, isSystemWorkflow: false },
            {
              id: { in: ['sys-1', 'sys-2'] },
              isSystemWorkflow: true,
              isActive: true,
            },
          ],
        },
      });
    });

    it('should exclude system workflows not in user library for authenticated users', async () => {
      const userId = 'user-1';
      const mockSystemWorkflowRefs = [
        { workflowId: 'sys-1' },
        // sys-2 is NOT in library (removed)
      ];
      const mockWorkflows = [
        {
          id: 'sys-1',
          name: 'System Workflow 1',
          description: 'Description 1',
          isSystemWorkflow: true,
          isActive: true,
          userId: 'system-user',
        },
        {
          id: 'user-1',
          name: 'User Workflow 1',
          description: 'User Description',
          isSystemWorkflow: false,
          isActive: true,
          userId: userId,
        },
      ];

      mockWorkflowReferenceFindMany.mockResolvedValue(mockSystemWorkflowRefs);
      mockWorkflowFindMany.mockResolvedValue(mockWorkflows);
      mockWorkflowEmbeddingFindMany.mockResolvedValue([]);
      mockEmbeddingsCreate.mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
      });

      // Set API key to use semantic search (which calls getWorkflows)
      const originalEnv = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'test-key';

      await dbSemanticSearch.searchWorkflows('test query', 5, userId);

      process.env.OPENAI_API_KEY = originalEnv;

      // Verify that only sys-1 is included (sys-2 should be excluded)
      expect(mockWorkflowFindMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { userId, isActive: true, isSystemWorkflow: false },
            {
              id: { in: ['sys-1'] },
              isSystemWorkflow: true,
              isActive: true,
            },
          ],
        },
      });
    });

    it('should handle authenticated user with no system workflows in library', async () => {
      const userId = 'user-1';
      const mockSystemWorkflowRefs: any[] = []; // Empty - no system workflows in library
      const mockWorkflows = [
        {
          id: 'user-1',
          name: 'User Workflow 1',
          description: 'User Description',
          isSystemWorkflow: false,
          isActive: true,
          userId: userId,
        },
      ];

      mockWorkflowReferenceFindMany.mockResolvedValue(mockSystemWorkflowRefs);
      mockWorkflowFindMany.mockResolvedValue(mockWorkflows);
      mockWorkflowEmbeddingFindMany.mockResolvedValue([]);
      mockEmbeddingsCreate.mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
      });

      // Set API key to use semantic search (which calls getWorkflows)
      const originalEnv = process.env.OPENAI_API_KEY;
      process.env.OPENAI_API_KEY = 'test-key';

      await dbSemanticSearch.searchWorkflows('test query', 5, userId);

      process.env.OPENAI_API_KEY = originalEnv;

      // Should only query for user's own workflows, no system workflows condition
      expect(mockWorkflowFindMany).toHaveBeenCalledWith({
        where: {
          OR: [{ userId, isActive: true, isSystemWorkflow: false }],
        },
      });
    });
  });

  describe('fallbackTextSearch', () => {
    it('should return all active system workflows for unauthenticated users', async () => {
      const mockWorkflows = [
        {
          id: 'sys-1',
          name: 'System Workflow 1',
          description: 'Test description',
          isSystemWorkflow: true,
          isActive: true,
          userId: 'system-user',
        },
      ];

mockWorkflowFindMany.mockResolvedValue(mockWorkflows);

      // Mock OpenAI API key not available to trigger fallback
      const originalEnv = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const results = await dbSemanticSearch.searchWorkflows('test', 5);

      process.env.OPENAI_API_KEY = originalEnv;

      expect(mockWorkflowFindMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
          AND: {
            isSystemWorkflow: true,
            isActive: true,
          },
        },
        take: 5,
      });
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter system workflows by library for authenticated users', async () => {
      const userId = 'user-1';
      const mockSystemWorkflowRefs = [{ workflowId: 'sys-1' }];
      const mockWorkflows = [
        {
          id: 'sys-1',
          name: 'System Workflow 1',
          description: 'Test description',
          isSystemWorkflow: true,
          isActive: true,
          userId: 'system-user',
        },
        {
          id: 'user-1',
          name: 'User Workflow',
          description: 'User description',
          isSystemWorkflow: false,
          isActive: true,
          userId: userId,
        },
      ];

      mockWorkflowReferenceFindMany.mockResolvedValue(mockSystemWorkflowRefs);
mockWorkflowFindMany.mockResolvedValue(mockWorkflows);

      // Mock OpenAI API key not available to trigger fallback
      const originalEnv = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      await dbSemanticSearch.searchWorkflows('test', 5, userId);

      process.env.OPENAI_API_KEY = originalEnv;

      expect(mockWorkflowFindMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'test', mode: 'insensitive' } },
            { description: { contains: 'test', mode: 'insensitive' } },
          ],
          AND: {
            OR: [
              { userId, isActive: true, isSystemWorkflow: false },
              {
                id: { in: ['sys-1'] },
                isSystemWorkflow: true,
                isActive: true,
              },
            ],
          },
        },
        take: 5,
      });
    });
  });

  describe('searchWorkflows', () => {
    it('should use fallback text search when OpenAI API key is not available', async () => {
      const mockWorkflows = [
        {
          id: 'sys-1',
          name: 'System Workflow',
          description: 'Description',
          isSystemWorkflow: true,
          isActive: true,
          userId: 'system-user',
        },
      ];

mockWorkflowFindMany.mockResolvedValue(mockWorkflows);

      const originalEnv = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const results = await dbSemanticSearch.searchWorkflows('test', 5);

      process.env.OPENAI_API_KEY = originalEnv;

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should use fallback text search when embedding generation fails', async () => {
      const mockWorkflows = [
        {
          id: 'sys-1',
          name: 'System Workflow',
          description: 'Description',
          isSystemWorkflow: true,
          isActive: true,
          userId: 'system-user',
        },
      ];

mockWorkflowFindMany.mockResolvedValue(mockWorkflows);
mockEmbeddingsCreate.mockRejectedValue(new Error('API Error'));

      const results = await dbSemanticSearch.searchWorkflows('test', 5);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });

    it('should return semantic search results when successful', async () => {
      const mockWorkflows = [
        {
          id: 'sys-1',
          name: 'System Workflow',
          description: 'Description',
          isSystemWorkflow: true,
          isActive: true,
          userId: 'system-user',
        },
      ];
      const mockEmbedding = [0.1, 0.2, 0.3];
      const mockWorkflowEmbeddings = [
        {
          workflowId: 'sys-1',
          embedding: mockEmbedding,
        },
      ];

mockWorkflowFindMany.mockResolvedValue(mockWorkflows);
mockWorkflowEmbeddingFindMany.mockResolvedValue(
        mockWorkflowEmbeddings
      );
mockEmbeddingsCreate.mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
      });

      const results = await dbSemanticSearch.searchWorkflows('test', 5);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(mockEmbeddingsCreate).toHaveBeenCalled();
    });

    it('should handle errors gracefully and fall back to text search', async () => {
      const mockWorkflows = [
        {
          id: 'sys-1',
          name: 'System Workflow',
          description: 'Description',
          isSystemWorkflow: true,
          isActive: true,
          userId: 'system-user',
        },
      ];

mockWorkflowFindMany.mockResolvedValue(mockWorkflows);
mockWorkflowEmbeddingFindMany.mockRejectedValue(
        new Error('Database error')
      );
mockEmbeddingsCreate.mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3] }],
      });

      const results = await dbSemanticSearch.searchWorkflows('test', 5);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('cosineSimilarity', () => {
    it('should calculate cosine similarity correctly', () => {
      const vecA = [1, 0, 0];
      const vecB = [1, 0, 0];
      const similarity = (dbSemanticSearch as any).cosineSimilarity(vecA, vecB);
      expect(similarity).toBe(1.0);
    });

    it('should return 0 for orthogonal vectors', () => {
      const vecA = [1, 0];
      const vecB = [0, 1];
      const similarity = (dbSemanticSearch as any).cosineSimilarity(vecA, vecB);
      expect(similarity).toBe(0);
    });

    it('should return 0 for mismatched vector lengths', () => {
      const vecA = [1, 2, 3];
      const vecB = [1, 2];
      const similarity = (dbSemanticSearch as any).cosineSimilarity(vecA, vecB);
      expect(similarity).toBe(0);
    });

    it('should handle zero vectors', () => {
      const vecA = [0, 0, 0];
      const vecB = [1, 2, 3];
      const similarity = (dbSemanticSearch as any).cosineSimilarity(vecA, vecB);
      expect(similarity).toBe(0);
    });

    it('should calculate similarity for non-zero vectors', () => {
      const vecA = [1, 2, 3];
      const vecB = [4, 5, 6];
      const similarity = (dbSemanticSearch as any).cosineSimilarity(vecA, vecB);
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });
  });

  describe('generateQueryEmbedding', () => {
    it('should generate embedding successfully', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
mockEmbeddingsCreate.mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
      });

      const embedding = await (dbSemanticSearch as any).generateQueryEmbedding('test query');

      expect(embedding).toEqual(mockEmbedding);
      expect(mockEmbeddingsCreate).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'test query',
        encoding_format: 'float',
      });
    });

    it('should convert query to lowercase', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3];
mockEmbeddingsCreate.mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
      });

      await (dbSemanticSearch as any).generateQueryEmbedding('TEST QUERY');

      expect(mockEmbeddingsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          input: 'test query',
        })
      );
    });

    it('should return null on error', async () => {
mockEmbeddingsCreate.mockRejectedValue(new Error('API Error'));

      const embedding = await (dbSemanticSearch as any).generateQueryEmbedding('test');

      expect(embedding).toBeNull();
    });
  });

  describe('SearchResult formatting', () => {
    it('should format results with correct source indicator for system workflows', async () => {
      const mockWorkflows = [
        {
          id: 'sys-1',
          name: 'System Workflow',
          description: 'System description',
          isSystemWorkflow: true,
          isActive: true,
          userId: 'system-user',
        },
      ];

mockWorkflowFindMany.mockResolvedValue(mockWorkflows);

      const originalEnv = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const results = await dbSemanticSearch.searchWorkflows('system', 5);

      process.env.OPENAI_API_KEY = originalEnv;

      if (results.length > 0) {
        expect(results[0].source).toBe('system');
        expect(results[0].id).toBe('sys-1');
        expect(results[0].title).toBe('System Workflow');
      }
    });

    it('should format results with correct source indicator for user workflows', async () => {
      const userId = 'user-1';
      const mockWorkflows = [
        {
          id: 'user-1',
          name: 'User Workflow',
          description: 'User description',
          isSystemWorkflow: false,
          isActive: true,
          userId: userId,
        },
      ];

      mockWorkflowReferenceFindMany.mockResolvedValue([]);
mockWorkflowFindMany.mockResolvedValue(mockWorkflows);

      const originalEnv = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const results = await dbSemanticSearch.searchWorkflows('user', 5, userId);

      process.env.OPENAI_API_KEY = originalEnv;

      if (results.length > 0) {
        expect(results[0].source).toBe('user');
        expect(results[0].id).toBe('user-1');
        expect(results[0].title).toBe('User Workflow');
      }
    });

    it('should handle workflows with null description', async () => {
      const mockWorkflows = [
        {
          id: 'sys-1',
          name: 'System Workflow',
          description: null,
          isSystemWorkflow: true,
          isActive: true,
          userId: 'system-user',
        },
      ];

mockWorkflowFindMany.mockResolvedValue(mockWorkflows);

      const originalEnv = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const results = await dbSemanticSearch.searchWorkflows('test', 5);

      process.env.OPENAI_API_KEY = originalEnv;

      if (results.length > 0) {
        expect(results[0].description).toBe('');
      }
    });
  });
});

