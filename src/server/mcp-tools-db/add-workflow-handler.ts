/**
 * MCP Tool: add_workflow
 * Creates a new workflow with optional stages and prompts (requires auth)
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

export const addWorkflowToolSchema = {
  name: z.string().min(1).max(255).describe('Name of the workflow'),
  description: z.string().optional().describe('Description of the workflow'),
  complexity: z.enum(['XS', 'S', 'M', 'L', 'XL']).optional().describe('Complexity level'),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional().default('PRIVATE').describe('Visibility setting'),
  tags: z.array(z.string()).optional().describe('Array of tag names'),
  stages: z.array(stageSchema).optional().describe('Stages with prompts'),
};

export interface AddWorkflowInput {
  name: string;
  description?: string;
  complexity?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  visibility?: 'PUBLIC' | 'PRIVATE';
  tags?: string[];
  stages?: StageInput[];
}

interface AddWorkflowResponse {
  id: string;
  key: string;
  name: string;
  visibility: Visibility;
  complexity: WorkflowComplexity | null;
  stageCount: number;
  createdAt: string;
}

export async function addWorkflowHandler(
  input: AddWorkflowInput,
  userId: string | null
): Promise<McpResponse> {
  try {
    const auth = requireAuth(userId);
    if (!auth.authenticated) {
      return auth.response;
    }

    const { name, description, complexity, visibility = 'PRIVATE', tags = [], stages = [] } = input;

    if (!name || name.trim() === '') {
      return mcpError('name is required');
    }

    const stageValidationError = validateStagePrompts(stages);
    if (stageValidationError) {
      return mcpError(stageValidationError);
    }

    const workflowKey = generateUniqueKey(name);
    const createdMiniPromptIds: string[] = [];

    const createdWorkflow = await withRetry(async () => {
      return prisma.$transaction(async (tx) => {
        const workflow = await tx.workflow.create({
          data: {
            name: name.trim(),
            description: description?.trim() || null,
            complexity: complexity || null,
            visibility,
            userId: auth.userId,
            key: workflowKey,
            isActive: true,
            isSystemWorkflow: false,
            includeMultiAgentChat: false,
            position: 0,
          },
        });

        if (tags.length > 0) {
          const tagIds = await findOrCreateTags(tx, tags, auth.userId);
          if (tagIds.length > 0) {
            await tx.workflowTag.createMany({
              data: tagIds.map((tagId) => ({ workflowId: workflow.id, tagId })),
            });
          }
        }

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

        return workflow;
      }, {
        maxWait: 10000,
        timeout: 30000,
      });
    });

    userWorkflowEmbeddings.syncWorkflowEmbedding(createdWorkflow.id).catch((error) => {
      console.error('[MCP] Failed to generate workflow embedding:', error);
    });

    for (const miniPromptId of createdMiniPromptIds) {
      triggerMiniPromptEmbedding(miniPromptId);
    }

    const response: AddWorkflowResponse = {
      id: createdWorkflow.id,
      key: createdWorkflow.key || workflowKey,
      name: createdWorkflow.name,
      visibility: createdWorkflow.visibility,
      complexity: createdWorkflow.complexity,
      stageCount: stages.length,
      createdAt: createdWorkflow.createdAt.toISOString(),
    };

    return mcpSuccess({
      message: 'Workflow created successfully',
      workflow: response,
    });
  } catch (error) {
    console.error('[MCP] Error in add_workflow:', error);

    if (error instanceof Error && error.message.startsWith('Prompt not found:')) {
      return mcpError(error.message);
    }

    return mcpError('Failed to create workflow. Please try again.');
  }
}
