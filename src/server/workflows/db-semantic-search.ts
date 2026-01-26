import OpenAI from 'openai';
import { prisma } from '@/server/db/client';

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

export interface SkillSearchResult {
  id: string;
  name: string;
  description: string;
  tags: string[];
  similarity: number;
  source: 'system' | 'user';
  attachmentCount: number;
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
      const workflowsById = new Map(workflows.map((w) => [w.id, w]));

      // Load embeddings for workflows
      const embeddings = await prisma.workflowEmbedding.findMany({
        where: {
          workflowId: { in: workflows.map((w) => w.id) }
        }
      });

      // Calculate similarities
      const results = embeddings.map((emb: typeof embeddings[0]) => {
        const workflow = workflowsById.get(emb.workflowId);
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
        .sort((a: SearchResult, b: SearchResult) => b.similarity - a.similarity)
        .slice(0, limit);

    } catch (error) {
      console.error('[DBSemanticSearch] Error in semantic search:', error);
      return this.fallbackTextSearch(query, limit, userId);
    }
  }

  /**
   * Get workflows based on user context
   * - No userId (unauthenticated): Returns ALL active system workflows
   * - With userId (authenticated): Returns only system workflows in user's library + user's own active workflows
   */
  private async getWorkflows(userId?: string) {
    if (!userId) {
      // Unauthenticated: Return ALL active system workflows
      return prisma.workflow.findMany({
        where: {
          isSystemWorkflow: true,
          isActive: true
        }
      });
    }

    // Get system workflows that are in user's library (have a WorkflowReference)
    const systemWorkflowReferences = await prisma.workflowReference.findMany({
      where: { userId },
      select: { workflowId: true }
    });
    const systemWorkflowIds = systemWorkflowReferences.map((ref: { workflowId: string }) => ref.workflowId);

    // Build OR conditions
    const orConditions: Array<Record<string, unknown>> = [
      // User's own active workflows
      { userId, isActive: true, isSystemWorkflow: false }
    ];

    // Only add system workflows condition if user has any in their library
    if (systemWorkflowIds.length > 0) {
      orConditions.push({
        id: { in: systemWorkflowIds },
        isSystemWorkflow: true,
        isActive: true
      });
    }

    // Get system workflows in user's library + user's own active workflows
    return prisma.workflow.findMany({
      where: {
        OR: orConditions
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
   * Search skills in database using semantic similarity
   */
  async searchSkills(
    query: string,
    limit: number = 10,
    userId?: string
  ): Promise<SkillSearchResult[]> {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[DBSemanticSearch] OpenAI API key not available, falling back to text search for skills');
      return this.fallbackSkillTextSearch(query, limit, userId);
    }

    try {
      const queryEmbedding = await this.generateQueryEmbedding(query);
      if (!queryEmbedding) {
        return this.fallbackSkillTextSearch(query, limit, userId);
      }

      const skills = await this.getSkillsForAuth(userId);
      const skillsById = new Map(skills.map((s) => [s.id, s]));

      const embeddings = await prisma.skillEmbedding.findMany({
        where: {
          skillId: { in: skills.map((s) => s.id) }
        }
      });

      const results = embeddings.map((emb: typeof embeddings[0]) => {
        const skill = skillsById.get(emb.skillId);
        if (!skill) return null;

        const similarity = this.cosineSimilarity(
          queryEmbedding,
          emb.embedding as number[]
        );

        return {
          id: skill.id,
          name: skill.name,
          description: skill.description || '',
          tags: skill.tags?.map((st: { tag: { name: string } }) => st.tag.name) || [],
          similarity,
          source: skill.isSystemSkill ? ('system' as const) : ('user' as const),
          attachmentCount: skill._count?.attachments || 0,
        };
      }).filter((r): r is SkillSearchResult => r !== null);

      return results
        .sort((a: SkillSearchResult, b: SkillSearchResult) => b.similarity - a.similarity)
        .slice(0, limit);

    } catch (error) {
      console.error('[DBSemanticSearch] Error in skill semantic search:', error);
      return this.fallbackSkillTextSearch(query, limit, userId);
    }
  }

  /** Shared skill include for search queries */
  private static readonly skillSearchInclude = {
    tags: { include: { tag: { select: { name: true } } } },
    _count: { select: { attachments: true } },
  } as const;

  /**
   * Build auth-aware where clause for skill queries.
   * - No userId: active public system skills only
   * - With userId: user's own + referenced + public system skills
   */
  private async buildSkillAuthFilter(userId?: string): Promise<Record<string, unknown>> {
    if (!userId) {
      return {
        isSystemSkill: true,
        isActive: true,
        deletedAt: null,
        visibility: 'PUBLIC',
      };
    }

    const skillReferences = await prisma.skillReference.findMany({
      where: { userId },
      select: { skillId: true },
    });
    const referencedSkillIds = skillReferences.map((ref: { skillId: string }) => ref.skillId);

    const orConditions: Array<Record<string, unknown>> = [
      { userId, isActive: true, deletedAt: null },
      { isSystemSkill: true, isActive: true, deletedAt: null, visibility: 'PUBLIC' },
    ];

    if (referencedSkillIds.length > 0) {
      orConditions.push({
        id: { in: referencedSkillIds },
        isActive: true,
        deletedAt: null,
      });
    }

    return { OR: orConditions };
  }

  /**
   * Get skills based on user context for semantic search
   */
  private async getSkillsForAuth(userId?: string) {
    const filter = await this.buildSkillAuthFilter(userId);
    return prisma.skill.findMany({
      where: filter,
      include: DBSemanticSearch.skillSearchInclude,
    });
  }

  /**
   * Fallback text search for skills when embeddings unavailable
   */
  private async fallbackSkillTextSearch(
    query: string,
    limit: number,
    userId?: string
  ): Promise<SkillSearchResult[]> {
    const authFilter = await this.buildSkillAuthFilter(userId);

    const skills = await prisma.skill.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } },
        ],
        AND: authFilter,
      },
      include: DBSemanticSearch.skillSearchInclude,
      take: limit,
    });

    return skills.map((s: typeof skills[0]) => ({
      id: s.id,
      name: s.name,
      description: s.description || '',
      tags: s.tags?.map((st: { tag: { name: string } }) => st.tag.name) || [],
      similarity: 0.5,
      source: s.isSystemSkill ? ('system' as const) : ('user' as const),
      attachmentCount: s._count?.attachments || 0,
    }));
  }

  /**
   * Fallback text search when embeddings unavailable
   * - No userId (unauthenticated): Returns ALL active system workflows matching query
   * - With userId (authenticated): Returns only system workflows in user's library + user's own active workflows matching query
   */
  private async fallbackTextSearch(
    query: string,
    limit: number,
    userId?: string
  ): Promise<SearchResult[]> {
    let workflowFilter: Record<string, unknown> | undefined;

    if (userId) {
      // Get system workflows that are in user's library (have a WorkflowReference)
      const systemWorkflowReferences = await prisma.workflowReference.findMany({
        where: { userId },
        select: { workflowId: true }
      });
      const systemWorkflowIds = systemWorkflowReferences.map((ref: { workflowId: string }) => ref.workflowId);

      // Build OR conditions
      const orConditions: Array<Record<string, unknown>> = [
        // User's own active workflows
        { userId, isActive: true, isSystemWorkflow: false }
      ];

      // Only add system workflows condition if user has any in their library
      if (systemWorkflowIds.length > 0) {
        orConditions.push({
          id: { in: systemWorkflowIds },
          isSystemWorkflow: true,
          isActive: true
        });
      }

      workflowFilter = {
        OR: orConditions
      };
    } else {
      // Unauthenticated: Return ALL active system workflows
      workflowFilter = {
        isSystemWorkflow: true,
        isActive: true
      };
    }

    const workflows = await prisma.workflow.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ],
        AND: workflowFilter
      },
      take: limit
    });

    return workflows.map((w: typeof workflows[0]) => ({
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
