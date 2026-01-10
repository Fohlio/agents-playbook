/**
 * MCP Tool: add_prompt
 * Creates a new mini-prompt with optional tags (requires auth)
 */

import { z } from 'zod';
import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';
import { requireAuth, mcpError, mcpSuccess, type McpResponse } from './require-auth';
import { findOrCreateTags } from './workflow-utils';
import { generateUniqueKey } from '@/shared/lib/generate-key';
import { triggerMiniPromptEmbedding } from '@/features/mini-prompts/lib/embedding-service';
import type { Visibility } from '@prisma/client';

export const addPromptToolSchema = {
  name: z.string().min(1).max(255).describe('Name of the prompt'),
  content: z.string().min(1).describe('Content of the prompt (markdown supported)'),
  description: z.string().max(1000).optional().describe('Short description of the prompt'),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional().default('PRIVATE').describe('Visibility setting'),
  tags: z.array(z.string()).optional().describe('Array of tag names to associate with the prompt'),
};

export interface AddPromptInput {
  name: string;
  content: string;
  description?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  tags?: string[];
}

interface AddPromptResponse {
  id: string;
  key: string;
  name: string;
  visibility: Visibility;
  createdAt: string;
}

export async function addPromptHandler(
  input: AddPromptInput,
  userId: string | null
): Promise<McpResponse> {
  try {
    const auth = requireAuth(userId);
    if (!auth.authenticated) {
      return auth.response;
    }

    const { name, content, description, visibility = 'PRIVATE', tags = [] } = input;

    if (!name || name.trim() === '') {
      return mcpError('name is required');
    }

    if (!content || content.trim() === '') {
      return mcpError('content is required');
    }

    const promptKey = generateUniqueKey(name);

    const createdPrompt = await withRetry(async () => {
      return prisma.$transaction(async (tx) => {
        const miniPrompt = await tx.miniPrompt.create({
          data: {
            name: name.trim(),
            content,
            description: description?.trim() || null,
            visibility,
            userId: auth.userId,
            key: promptKey,
            isActive: true,
            isSystemMiniPrompt: false,
            position: 0,
          },
        });

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

        return miniPrompt;
      });
    });

    triggerMiniPromptEmbedding(createdPrompt.id);

    const response: AddPromptResponse = {
      id: createdPrompt.id,
      key: createdPrompt.key || promptKey,
      name: createdPrompt.name,
      visibility: createdPrompt.visibility,
      createdAt: createdPrompt.createdAt.toISOString(),
    };

    return mcpSuccess({
      message: 'Prompt created successfully',
      prompt: response,
    });
  } catch (error) {
    console.error('[MCP] Error in add_prompt:', error);
    return mcpError('Failed to create prompt. Please try again.');
  }
}
