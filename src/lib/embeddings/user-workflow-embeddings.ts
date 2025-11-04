import OpenAI from 'openai';
import { prisma } from '@/lib/db/client';

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: process.env.NODE_ENV === 'test' || typeof window !== 'undefined'
  });
}

export class UserWorkflowEmbeddings {
  /**
   * Create searchable text from workflow (includes name, description, and tags)
   * Name is included multiple times to emphasize it for better search relevance
   */
  private createSearchableText(workflow: {
    name: string;
    description?: string | null;
    tags?: Array<{ tag: { name: string } }>;
  }): string {
    const tagNames = workflow.tags?.map(wt => wt.tag.name) || [];
    const parts = [
      workflow.name, // Include name first for emphasis
      workflow.name, // Repeat name for better relevance in embeddings
      workflow.description || '',
      ...tagNames,
      workflow.name // Include name again at the end
    ];
    return parts.filter(Boolean).join(' ').toLowerCase();
  }

  /**
   * Generate embedding for workflow
   */
  async generateEmbedding(workflowId: string): Promise<number[] | null> {
    try {
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        select: {
          name: true,
          description: true,
          tags: {
            include: {
              tag: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      if (!workflow) {
        console.warn(`[Embeddings] Workflow not found: ${workflowId}`);
        return null;
      }

      const searchText = this.createSearchableText(workflow);

      const openai = getOpenAIClient();
      if (!openai) {
        console.warn('[Embeddings] OpenAI API key not configured, skipping embedding generation');
        return null;
      }

      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: searchText,
        encoding_format: 'float'
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('[Embeddings] Error generating embedding:', error);
      return null;
    }
  }

  /**
   * Store or update embedding in database
   */
  async storeEmbedding(
    workflowId: string,
    embedding: number[]
  ): Promise<void> {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: {
        name: true,
        description: true,
        tags: {
          include: {
            tag: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const searchText = this.createSearchableText(workflow);

    await prisma.workflowEmbedding.upsert({
      where: { workflowId },
      create: {
        workflowId,
        embedding: JSON.parse(JSON.stringify(embedding)),
        searchText
      },
      update: {
        embedding: JSON.parse(JSON.stringify(embedding)),
        searchText
      }
    });
  }

  /**
   * Get embedding from database
   */
  async getEmbedding(workflowId: string): Promise<number[] | null> {
    const record = await prisma.workflowEmbedding.findUnique({
      where: { workflowId }
    });

    return record ? (record.embedding as number[]) : null;
  }

  /**
   * Generate embedding on workflow create/update
   */
  async syncWorkflowEmbedding(workflowId: string): Promise<void> {
    try {
      const embedding = await this.generateEmbedding(workflowId);
      if (embedding) {
        await this.storeEmbedding(workflowId, embedding);
        console.log(`[Embeddings] Synced embedding for workflow: ${workflowId}`);
      }
    } catch (error) {
      console.error(`[Embeddings] Failed to sync embedding for ${workflowId}:`, error);
      // Don't throw - embedding generation should not block workflow creation
    }
  }
}

export const userWorkflowEmbeddings = new UserWorkflowEmbeddings();
