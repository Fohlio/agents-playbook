import OpenAI from 'openai';
import { prisma } from '@/lib/db/client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export class UserWorkflowEmbeddings {
  /**
   * Create searchable text from workflow
   */
  private createSearchableText(workflow: {
    name: string;
    description?: string | null;
  }): string {
    const parts = [
      workflow.name,
      workflow.description || ''
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
          description: true
        }
      });

      if (!workflow) {
        console.warn(`[Embeddings] Workflow not found: ${workflowId}`);
        return null;
      }

      const searchText = this.createSearchableText(workflow);

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
      select: { name: true, description: true }
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
