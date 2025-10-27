import { prisma } from '@/lib/db/client';

export interface Workflow {
  id: string;
  name: string;
  description?: string | null;
  yamlContent?: string | null;
  source: 'system' | 'user';
  isActive?: boolean;
  visibility?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class UnifiedWorkflowService {
  /**
   * Get workflows based on user context
   */
  async getWorkflows(userId?: string): Promise<Workflow[]> {
    if (!userId) {
      // Return only system workflows
      return this.getSystemWorkflows();
    }

    // Return system + user workflows
    return this.getWorkflowsWithUser(userId);
  }

  /**
   * Get system workflows from database
   */
  private async getSystemWorkflows(): Promise<Workflow[]> {
    const workflows = await prisma.workflow.findMany({
      where: {
        isSystemWorkflow: true,
        isActive: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    return workflows.map(w => ({
      ...w,
      source: 'system' as const
    }));
  }

  /**
   * Get system + user workflows from database
   */
  private async getWorkflowsWithUser(userId: string): Promise<Workflow[]> {
    const workflows = await prisma.workflow.findMany({
      where: {
        OR: [
          { isSystemWorkflow: true },
          { userId, isActive: true }
        ]
      },
      orderBy: { updatedAt: 'desc' }
    });

    return workflows.map(w => ({
      ...w,
      source: w.isSystemWorkflow ? ('system' as const) : ('user' as const)
    }));
  }

  /**
   * Get workflow by ID (checks both system and user workflows)
   */
  async getWorkflowById(
    id: string,
    userId?: string
  ): Promise<Workflow | null> {
    const workflow = await prisma.workflow.findFirst({
      where: { id }
    });

    if (!workflow) return null;

    // Check access control
    if (!workflow.isSystemWorkflow && workflow.userId !== userId) {
      return null; // No access
    }

    return {
      ...workflow,
      source: workflow.isSystemWorkflow ? 'system' : 'user'
    };
  }
}

export const unifiedWorkflowService = new UnifiedWorkflowService();
