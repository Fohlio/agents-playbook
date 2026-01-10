/**
 * Shared utilities for workflow MCP handlers
 */

import { z } from 'zod';
import type { Prisma } from '@prisma/client';

// Shared stage prompt schema
export const stagePromptSchema = z.object({
  prompt_id: z.string().optional().describe('ID of existing prompt to reference'),
  name: z.string().optional().describe('Name for inline prompt (required if creating new)'),
  content: z.string().optional().describe('Content for inline prompt (required if creating new)'),
  description: z.string().optional().describe('Description for inline prompt'),
});

// Shared stage schema
export const stageSchema = z.object({
  name: z.string().min(1).describe('Name of the stage'),
  description: z.string().optional().describe('Description of the stage'),
  color: z.string().optional().describe('Color for the stage (hex format)'),
  with_review: z.boolean().optional().default(true).describe('Whether to include review step'),
  include_multi_agent_chat: z.boolean().optional().default(false).describe('Whether to include multi-agent chat'),
  prompts: z.array(stagePromptSchema).optional().describe('Prompts in this stage'),
});

// Shared input types
export interface StagePromptInput {
  prompt_id?: string;
  name?: string;
  content?: string;
  description?: string;
}

export interface StageInput {
  name: string;
  description?: string;
  color?: string;
  with_review?: boolean;
  include_multi_agent_chat?: boolean;
  prompts?: StagePromptInput[];
}

/**
 * Validate stage prompts - returns error message if invalid, null if valid
 */
export function validateStagePrompts(stages: StageInput[] | undefined): string | null {
  if (!stages) return null;

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    if (!stage.name || stage.name.trim() === '') {
      return `Stage ${i + 1}: name is required`;
    }

    if (stage.prompts) {
      for (let j = 0; j < stage.prompts.length; j++) {
        const prompt = stage.prompts[j];
        if (!prompt.prompt_id && (!prompt.name || !prompt.content)) {
          return `Stage ${i + 1}, Prompt ${j + 1}: either prompt_id or both name and content are required`;
        }
      }
    }
  }

  return null;
}

/**
 * Find or create tags and return their IDs
 */
export async function findOrCreateTags(
  tx: Prisma.TransactionClient,
  tags: string[],
  userId: string
): Promise<string[]> {
  const uniqueTags = [...new Set(tags.map((t) => t.toLowerCase()))];
  const tagIds: string[] = [];

  for (const tagName of uniqueTags) {
    if (!tagName.trim()) continue;

    let tag = await tx.tag.findFirst({
      where: { name: { equals: tagName.trim(), mode: 'insensitive' } },
    });

    if (!tag) {
      tag = await tx.tag.create({
        data: {
          name: tagName.trim(),
          color: null,
          isActive: true,
          createdBy: userId,
        },
      });
    }

    tagIds.push(tag.id);
  }

  return tagIds;
}
