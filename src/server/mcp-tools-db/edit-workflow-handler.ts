/**
 * MCP Tool: edit_workflow
 * Updates an existing workflow (requires auth + ownership)
 * If stages are provided, performs full replacement
 */

import { z } from 'zod';
import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';
import { requireAuth, mcpError, mcpSuccess, type McpResponse } from './require-auth';
import {
  stageSchema,
  validateStagePrompts,
  findOrCreateTags,
  type StageInput,
} from './workflow-utils';
import { generateUniqueKey } from '@/shared/lib/generate-key';
import { userWorkflowEmbeddings } from '@/server/embeddings/user-workflow-embeddings';
import { triggerMiniPromptEmbedding } from '@/features/mini-prompts/lib/embedding-service';
import type { Visibility, WorkflowComplexity } from '@prisma/client';

export const editWorkflowToolSchema = {
  workflow_id: z.string().describe('ID of the workflow to edit'),
  name: z.string().min(1).max(255).optional().describe('New name for the workflow'),
  description: z.string().optional().describe('New description for the workflow'),
  complexity: z.enum(['XS', 'S', 'M', 'L', 'XL']).optional().describe('New complexity level'),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional().describe('New visibility setting'),
  is_active: z.boolean().optional().describe('Whether the workflow is active (false for soft delete)'),
  tags: z.array(z.string()).optional().describe('New tags (replaces all existing tags)'),
  stages: z.array(stageSchema).optional().describe('New stages (replaces all existing stages)'),
};

export interface EditWorkflowInput {
  workflow_id: string;
  name?: string;
  description?: string;
  complexity?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  visibility?: 'PUBLIC' | 'PRIVATE';
  is_active?: boolean;
  tags?: string[];
  stages?: StageInput[];
}

interface EditWorkflowResponse {
  id: string;
  name: string;
  description: string | null;
  visibility: Visibility;
  complexity: WorkflowComplexity | null;
  isActive: boolean;
  stageCount: number;
  updatedAt: string;
}

export async function editWorkflowHandler(
  input: EditWorkflowInput,
  userId: string | null
): Promise<McpResponse> {
  try {
    const auth = requireAuth(userId);
    if (!auth.authenticated) {
      return auth.response;
    }

    const { workflow_id, name, description, complexity, visibility, is_active, tags, stages } = input;

    if (!workflow_id || workflow_id.trim() === '') {
      return mcpError('workflow_id is required');
    }

    const existingWorkflow = await withRetry(async () => {
      return prisma.workflow.findUnique({
        where: { id: workflow_id },
        select: { id: true, userId: true, isSystemWorkflow: true, name: true, description: true },
      });
    });

    if (!existingWorkflow) {
      return mcpError('Workflow not found');
    }

    if (existingWorkflow.userId !== auth.userId) {
      return mcpError('Workflow not found or you don\'t have permission to edit');
    }

    if (existingWorkflow.isSystemWorkflow) {
      return mcpError('System workflows cannot be modified');
    }

    if (stages) {
      const stageValidationError = validateStagePrompts(stages);
      if (stageValidationError) {
        return mcpError(stageValidationError);
      }
    }

    const createdMiniPromptIds: string[] = [];

    const updateData: {
      name?: string;
      description?: string | null;
      complexity?: WorkflowComplexity | null;
      visibility?: Visibility;
      isActive?: boolean;
    } = {};

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (complexity !== undefined) updateData.complexity = complexity;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (is_active !== undefined) updateData.isActive = is_active;

    const needsEmbeddingUpdate = name !== undefined || description !== undefined || tags !== undefined;

    const updatedWorkflow = await withRetry(async () => {
      return prisma.$transaction(async (tx) => {
        const workflow = await tx.workflow.update({
          where: { id: workflow_id },
          data: updateData,
        });

        if (tags !== undefined) {
          await tx.workflowTag.deleteMany({ where: { workflowId: workflow_id } });

          if (tags.length > 0) {
            const tagIds = await findOrCreateTags(tx, tags, auth.userId);
            if (tagIds.length > 0) {
              await tx.workflowTag.createMany({
                data: tagIds.map((tagId) => ({ workflowId: workflow.id, tagId })),
              });
            }
          }
        }

        if (stages !== undefined) {
          await tx.workflowStage.deleteMany({ where: { workflowId: workflow_id } });

          for (let stageIndex = 0; stageIndex < stages.length; stageIndex++) {
            const stageInput = stages[stageIndex];

            const stage = await tx.workflowStage.create({
              data: {
                workflowId: workflow.id,
                name: stageInput.name.trim(),
                description: stageInput.description?.trim() || null,
                color: stageInput.color || '#64748b',
                order: stageIndex,
                withReview: stageInput.with_review ?? true,
                includeMultiAgentChat: stageInput.include_multi_agent_chat ?? false,
              },
            });

            if (stageInput.prompts && stageInput.prompts.length > 0) {
              const itemOrder: string[] = [];

              for (let promptIndex = 0; promptIndex < stageInput.prompts.length; promptIndex++) {
                const promptInput = stageInput.prompts[promptIndex];
                let miniPromptId: string;

                if (promptInput.prompt_id) {
                  const existingPrompt = await tx.miniPrompt.findUnique({
                    where: { id: promptInput.prompt_id },
                    select: { id: true },
                  });
                  if (!existingPrompt) {
                    throw new Error(`Prompt not found: ${promptInput.prompt_id}`);
                  }
                  miniPromptId = existingPrompt.id;
                } else {
                  const promptKey = generateUniqueKey(promptInput.name!);
                  const createdPrompt = await tx.miniPrompt.create({
                    data: {
                      name: promptInput.name!.trim(),
                      content: promptInput.content!,
                      description: promptInput.description?.trim() || null,
                      visibility: 'PRIVATE',
                      userId: auth.userId,
                      key: promptKey,
                      isActive: true,
                      isSystemMiniPrompt: false,
                      position: 0,
                    },
                  });
                  miniPromptId = createdPrompt.id;
                  createdMiniPromptIds.push(miniPromptId);
                }

                await tx.stageMiniPrompt.create({
                  data: { stageId: stage.id, miniPromptId, order: promptIndex },
                });

                itemOrder.push(miniPromptId);
              }

              if (itemOrder.length > 0) {
                await tx.workflowStage.update({
                  where: { id: stage.id },
                  data: { itemOrder },
                });
              }
            }
          }
        }

        return workflow;
      }, {
        maxWait: 10000,
        timeout: 30000,
      });
    });

    const stageCount = stages !== undefined
      ? stages.length
      : await prisma.workflowStage.count({ where: { workflowId: workflow_id } });

    if (needsEmbeddingUpdate) {
      userWorkflowEmbeddings.syncWorkflowEmbedding(updatedWorkflow.id).catch((error) => {
        console.error('[MCP] Failed to regenerate workflow embedding:', error);
      });
    }

    for (const miniPromptId of createdMiniPromptIds) {
      triggerMiniPromptEmbedding(miniPromptId);
    }

    const response: EditWorkflowResponse = {
      id: updatedWorkflow.id,
      name: updatedWorkflow.name,
      description: updatedWorkflow.description,
      visibility: updatedWorkflow.visibility,
      complexity: updatedWorkflow.complexity,
      isActive: updatedWorkflow.isActive,
      stageCount,
      updatedAt: updatedWorkflow.updatedAt.toISOString(),
    };

    return mcpSuccess({
      message: 'Workflow updated successfully',
      workflow: response,
    });
  } catch (error) {
    console.error('[MCP] Error in edit_workflow:', error);

    if (error instanceof Error && error.message.startsWith('Prompt not found:')) {
      return mcpError(error.message);
    }

    return mcpError('Failed to update workflow. Please try again.');
  }
}
