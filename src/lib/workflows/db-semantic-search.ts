import OpenAI from 'openai';
import { prisma } from '@/lib/db/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  complexity: string;
  similarity: number;
  source: 'system' | 'user';
}

export class DBSemanticSearch {
  /**
   * Search workflows in database using semantic similarity
   */
  async searchWorkflows(
    query: string,
    limit: number = 5,
    userId?: string
  ): Promise<SearchResult[]> {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[DBSemanticSearch] OpenAI API key not available, falling back to text search');
      return this.fallbackTextSearch(query, limit, userId);
    }

    try {
      // Generate query embedding
      const queryEmbedding = await this.generateQueryEmbedding(query);
      if (!queryEmbedding) {
        return this.fallbackTextSearch(query, limit, userId);
      }

      // Get workflows from DB
      const workflows = await this.getWorkflows(userId);

      // Load embeddings for workflows
      const embeddings = await prisma.workflowEmbedding.findMany({
        where: {
          workflowId: { in: workflows.map(w => w.id) }
        }
      });

      // Calculate similarities
      const results = embeddings.map(emb => {
        const workflow = workflows.find(w => w.id === emb.workflowId);
        if (!workflow) return null;

        const similarity = this.cosineSimilarity(
          queryEmbedding,
          emb.embedding as number[]
        );

        return {
          id: workflow.id,
          title: workflow.name,
          description: workflow.description || '',
          category: 'custom',
          tags: ['workflow'],
          complexity: 'custom',
          similarity,
          source: workflow.isSystemWorkflow ? ('system' as const) : ('user' as const)
        };
      }).filter((r): r is SearchResult => r !== null);

      // Sort by similarity and limit
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    } catch (error) {
      console.error('[DBSemanticSearch] Error in semantic search:', error);
      return this.fallbackTextSearch(query, limit, userId);
    }
  }

  /**
   * Get workflows based on user context
   */
  private async getWorkflows(userId?: string) {
    if (!userId) {
      // System workflows only
      return prisma.workflow.findMany({
        where: {
          isSystemWorkflow: true,
          isActive: true
        }
      });
    }

    // System + user workflows
    return prisma.workflow.findMany({
      where: {
        OR: [
          { isSystemWorkflow: true },
          { userId, isActive: true }
        ]
      }
    });
  }

  /**
   * Generate query embedding
   */
  private async generateQueryEmbedding(query: string): Promise<number[] | null> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query.toLowerCase(),
        encoding_format: 'float'
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('[DBSemanticSearch] Error generating query embedding:', error);
      return null;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      console.error('[DBSemanticSearch] Vector length mismatch');
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Fallback text search when embeddings unavailable
   */
  private async fallbackTextSearch(
    query: string,
    limit: number,
    userId?: string
  ): Promise<SearchResult[]> {
    const workflows = await prisma.workflow.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ],
        AND: userId
          ? {
              OR: [
                { isSystemWorkflow: true },
                { userId, isActive: true }
              ]
            }
          : {
              isSystemWorkflow: true,
              isActive: true
            }
      },
      take: limit
    });

    return workflows.map(w => ({
      id: w.id,
      title: w.name,
      description: w.description || '',
      category: 'custom',
      tags: ['workflow'],
      complexity: 'custom',
      similarity: 0.5, // Text match similarity
      source: w.isSystemWorkflow ? ('system' as const) : ('user' as const)
    }));
  }
}

export const dbSemanticSearch = new DBSemanticSearch();
