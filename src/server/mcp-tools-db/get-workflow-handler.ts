/**
 * MCP Tool: get_workflow
 * Returns complete workflow details including all stages, prompts, tags, and models
 */

import { z } from 'zod';
import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';
import { requireAuth, mcpError, mcpSuccess, type McpResponse } from './require-auth';
import type { Visibility } from '@prisma/client';

export const getWorkflowToolSchema = {
  workflow_id: z.string().describe('ID of the workflow to retrieve'),
};

export interface GetWorkflowInput {
  workflow_id: string;
}

interface WorkflowPrompt {
  id: string;
  name: string;
  description: string | null;
  content: string;
  visibility: Visibility;
  key: string | null;
}

interface WorkflowStage {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  order: number;
  withReview: boolean;
  includeMultiAgentChat: boolean;
  prompts: WorkflowPrompt[];
}

interface WorkflowResponse {
  id: string;
  name: string;
  description: string | null;
  complexity: string | null;
  visibility: Visibility;
  isActive: boolean;
  key: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  models: Array<{ name: string; slug: string; category: string }>;
  stages: WorkflowStage[];
}

export async function getWorkflowHandler(
  input: GetWorkflowInput,
  userId: string | null
): Promise<McpResponse> {
  try {
    const { workflow_id } = input;

    if (!workflow_id || workflow_id.trim() === '') {
      return mcpError('workflow_id is required');
    }

    const workflow = await withRetry(async () => {
      return prisma.workflow.findUnique({
        where: { id: workflow_id },
        include: {
          tags: { include: { tag: true } },
          models: { include: { model: true } },
          stages: {
            include: {
              miniPrompts: {
                include: { miniPrompt: true },
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      });
    });

    if (!workflow) {
      return mcpError('Workflow not found');
    }

    // Private workflows require authentication and ownership
    if (workflow.visibility === 'PRIVATE') {
      const auth = requireAuth(userId);
      if (!auth.authenticated) {
        return auth.response;
      }
      if (workflow.userId !== auth.userId) {
        return mcpError('Workflow not found or you don\'t have access');
      }
    }

    const response: WorkflowResponse = {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      complexity: workflow.complexity,
      visibility: workflow.visibility,
      isActive: workflow.isActive,
      key: workflow.key,
      createdAt: workflow.createdAt.toISOString(),
      updatedAt: workflow.updatedAt.toISOString(),
      tags: workflow.tags.map((wt) => wt.tag.name),
      models: workflow.models.map((wm) => ({
        name: wm.model.name,
        slug: wm.model.slug,
        category: wm.model.category,
      })),
      stages: workflow.stages.map((stage) => ({
        id: stage.id,
        name: stage.name,
        description: stage.description,
        color: stage.color,
        order: stage.order,
        withReview: stage.withReview,
        includeMultiAgentChat: stage.includeMultiAgentChat,
        prompts: stage.miniPrompts.map((smp) => ({
          id: smp.miniPrompt.id,
          name: smp.miniPrompt.name,
          description: smp.miniPrompt.description,
          content: smp.miniPrompt.content,
          visibility: smp.miniPrompt.visibility,
          key: smp.miniPrompt.key,
        })),
      })),
    };

    return mcpSuccess(response);
  } catch (error) {
    console.error('[MCP] Error in get_workflow:', error);
    return mcpError('Failed to retrieve workflow. Please try again.');
  }
}
