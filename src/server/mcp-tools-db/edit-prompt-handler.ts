/**
 * MCP Tool: edit_prompt
 * Updates an existing mini-prompt (requires auth + ownership)
 */

import { z } from 'zod';
import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';
import { requireAuth, mcpError, mcpSuccess, type McpResponse } from './require-auth';
import { findOrCreateTags } from './workflow-utils';
import { triggerMiniPromptEmbedding } from '@/features/mini-prompts/lib/embedding-service';
import type { Visibility } from '@prisma/client';

export const editPromptToolSchema = {
  prompt_id: z.string().describe('ID of the prompt to edit'),
  name: z.string().min(1).max(255).optional().describe('New name for the prompt'),
  content: z.string().min(1).optional().describe('New content for the prompt'),
  description: z.string().max(1000).optional().describe('New description for the prompt'),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional().describe('New visibility setting'),
  is_active: z.boolean().optional().describe('Whether the prompt is active (false for soft delete)'),
  tags: z.array(z.string()).optional().describe('New tags (replaces all existing tags)'),
};

export interface EditPromptInput {
  prompt_id: string;
  name?: string;
  content?: string;
  description?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  is_active?: boolean;
  tags?: string[];
}

interface EditPromptResponse {
  id: string;
  name: string;
  description: string | null;
  visibility: Visibility;
  isActive: boolean;
  updatedAt: string;
}

export async function editPromptHandler(
  input: EditPromptInput,
  userId: string | null
): Promise<McpResponse> {
  try {
    const auth = requireAuth(userId);
    if (!auth.authenticated) {
      return auth.response;
    }

    const { prompt_id, name, content, description, visibility, is_active, tags } = input;

    if (!prompt_id || prompt_id.trim() === '') {
      return mcpError('prompt_id is required');
    }

    const existingPrompt = await withRetry(async () => {
      return prisma.miniPrompt.findUnique({
        where: { id: prompt_id },
        select: { id: true, userId: true, isSystemMiniPrompt: true, content: true },
      });
    });

    if (!existingPrompt) {
      return mcpError('Prompt not found');
    }

    if (existingPrompt.userId !== auth.userId) {
      return mcpError('Prompt not found or you don\'t have permission to edit');
    }

    if (existingPrompt.isSystemMiniPrompt) {
      return mcpError('System prompts cannot be modified');
    }

    const updateData: {
      name?: string;
      content?: string;
      description?: string | null;
      visibility?: Visibility;
      isActive?: boolean;
    } = {};

    if (name !== undefined) updateData.name = name.trim();
    if (content !== undefined) updateData.content = content;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (is_active !== undefined) updateData.isActive = is_active;

    const contentChanged = content !== undefined && content !== existingPrompt.content;

    const updatedPrompt = await withRetry(async () => {
      return prisma.$transaction(async (tx) => {
        const miniPrompt = await tx.miniPrompt.update({
          where: { id: prompt_id },
          data: updateData,
        });

        if (tags !== undefined) {
          await tx.miniPromptTag.deleteMany({ where: { miniPromptId: prompt_id } });

          if (tags.length > 0) {
            const tagIds = await findOrCreateTags(tx, tags, auth.userId);
            if (tagIds.length > 0) {
              await tx.miniPromptTag.createMany({
                data: tagIds.map((tagId) => ({
                  miniPromptId: miniPrompt.id,
                  tagId,
                })),
              });
            }
          }
        }

        return miniPrompt;
      });
    });

    if (contentChanged || tags !== undefined || description !== undefined) {
      triggerMiniPromptEmbedding(updatedPrompt.id);
    }

    const response: EditPromptResponse = {
      id: updatedPrompt.id,
      name: updatedPrompt.name,
      description: updatedPrompt.description,
      visibility: updatedPrompt.visibility,
      isActive: updatedPrompt.isActive,
      updatedAt: updatedPrompt.updatedAt.toISOString(),
    };

    return mcpSuccess({
      message: 'Prompt updated successfully',
      prompt: response,
    });
  } catch (error) {
    console.error('[MCP] Error in edit_prompt:', error);
    return mcpError('Failed to update prompt. Please try again.');
  }
}
