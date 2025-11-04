import { z } from 'zod';
import { prisma } from '@/lib/db/client';

export const getUserWorkflowsToolSchema = {
  search: z.string().optional().describe('Optional search term to filter workflows by name or description')
};

export async function getUserWorkflowsHandler({ search, userId }: { search?: string; userId?: string }) {
  try {
    console.log(`[MCP] Getting active workflows from user library${search ? ` with search: ${search}` : ''}`);

    if (!userId) {
      return {
        content: [{
          type: "text" as const,
          text: 'Authentication required. Please provide userId to access your library workflows.'
        }],
      };
    }

    // Get owned active workflows
    const ownedWorkflows = await prisma.workflow.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        _count: {
          select: { stages: true }
        },
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    // Get referenced active workflows
    const referencedWorkflows = await prisma.workflowReference.findMany({
      where: {
        userId,
        workflow: { isActive: true }
      },
      include: {
        workflow: {
          include: {
            _count: {
              select: { stages: true }
            },
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });

    // Combine and deduplicate
    const allWorkflows = [
      ...ownedWorkflows,
      ...referencedWorkflows.map(ref => ref.workflow),
    ];

    let workflows = Array.from(
      new Map(allWorkflows.map((w) => [w.id, w])).values()
    ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      workflows = workflows.filter(w =>
        w.name.toLowerCase().includes(searchLower) ||
        (w.description && w.description.toLowerCase().includes(searchLower))
      );
    }

    // Limit results
    workflows = workflows.slice(0, 20);

    if (workflows.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: `No active workflows found in your library${search ? ` matching "${search}"` : ''}. Create workflows in your library and mark them as active.`
        }],
      };
    }

    // Format results in a user-friendly way
    const formattedResults = workflows.map((workflow, index: number) => {
      const stagesCount = workflow._count.stages;
      const description = workflow.description
        ? workflow.description.slice(0, 100) + (workflow.description.length > 100 ? '...' : '')
        : 'No description';

      return `${index + 1}. **${workflow.name}**
   📋 ${description}
   👤 @${workflow.user.username} | 🔄 ${stagesCount} stages | 👁️ ${workflow.visibility}
   🆔 ID: ${workflow.id}`;
    });

    return {
      content: [{
        type: "text" as const,
        text: `Found ${workflows.length} active workflows in your library${search ? ` matching "${search}"` : ''}:\n\n${formattedResults.join('\n\n')}\n\n**Note:**\nThese are your custom database workflows. Use the workflow ID to access stages and details through the API.`
      }],
    };
  } catch (error) {
    console.error('[MCP] Error in get_user_workflows:', error);
    return {
      content: [{ type: "text" as const, text: 'Error: Failed to fetch workflows. Please try again.' }],
    };
  }
}
