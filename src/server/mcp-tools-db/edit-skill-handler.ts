/**
 * MCP Tool: edit_skill
 * Updates an existing skill (requires auth + ownership)
 */

import { z } from 'zod';
import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';
import { requireAuth, mcpError, mcpSuccess, type McpResponse } from './require-auth';
import { findOrCreateTags } from './workflow-utils';
import { triggerSkillEmbedding } from '@/server/skills/skill-embedding-service';
import type { Visibility } from '@prisma/client';

export const editSkillToolSchema = {
  skill_id: z.string().describe('ID of the skill to edit'),
  name: z.string().min(1).max(255).optional().describe('New name for the skill'),
  content: z.string().min(1).optional().describe('New content for the skill'),
  description: z.string().max(1000).optional().describe('New description for the skill'),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional().describe('New visibility setting'),
  is_active: z.boolean().optional().describe('Whether the skill is active (false for soft delete)'),
  tags: z.array(z.string()).optional().describe('New tags (replaces all existing tags)'),
};

export interface EditSkillInput {
  skill_id: string;
  name?: string;
  content?: string;
  description?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  is_active?: boolean;
  tags?: string[];
}

interface EditSkillResponse {
  id: string;
  name: string;
  description: string | null;
  visibility: Visibility;
  isActive: boolean;
  updatedAt: string;
}

export async function editSkillHandler(
  input: EditSkillInput,
  userId: string | null
): Promise<McpResponse> {
  try {
    const auth = requireAuth(userId);
    if (!auth.authenticated) {
      return auth.response;
    }

    const { skill_id, name, content, description, visibility, is_active, tags } = input;

    if (!skill_id || skill_id.trim() === '') {
      return mcpError('skill_id is required');
    }

    const existingSkill = await withRetry(async () => {
      return prisma.skill.findUnique({
        where: { id: skill_id },
        select: { id: true, userId: true, isSystemSkill: true, content: true },
      });
    });

    if (!existingSkill) {
      return mcpError('Skill not found');
    }

    if (existingSkill.userId !== auth.userId) {
      return mcpError('Skill not found or you don\'t have permission to edit');
    }

    if (existingSkill.isSystemSkill) {
      return mcpError('System skills cannot be modified');
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

    const contentChanged = content !== undefined && content !== existingSkill.content;

    const updatedSkill = await withRetry(async () => {
      return prisma.$transaction(async (tx) => {
        const skill = await tx.skill.update({
          where: { id: skill_id },
          data: updateData,
        });

        if (tags !== undefined) {
          await tx.skillTag.deleteMany({ where: { skillId: skill_id } });

          if (tags.length > 0) {
            const tagIds = await findOrCreateTags(tx, tags, auth.userId);
            if (tagIds.length > 0) {
              await tx.skillTag.createMany({
                data: tagIds.map((tagId) => ({
                  skillId: skill.id,
                  tagId,
                })),
              });
            }
          }
        }

        return skill;
      });
    });

    if (contentChanged || tags !== undefined || description !== undefined) {
      triggerSkillEmbedding(updatedSkill.id);
    }

    const response: EditSkillResponse = {
      id: updatedSkill.id,
      name: updatedSkill.name,
      description: updatedSkill.description,
      visibility: updatedSkill.visibility,
      isActive: updatedSkill.isActive,
      updatedAt: updatedSkill.updatedAt.toISOString(),
    };

    return mcpSuccess({
      message: 'Skill updated successfully',
      skill: response,
    });
  } catch (error) {
    console.error('[MCP] Error in edit_skill:', error);
    return mcpError('Failed to update skill. Please try again.');
  }
}
