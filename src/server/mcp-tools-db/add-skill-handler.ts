/**
 * MCP Tool: add_skill
 * Creates a new skill with optional tags (requires auth)
 */

import { z } from 'zod';
import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';
import { requireAuth, mcpError, mcpSuccess, type McpResponse } from './require-auth';
import { findOrCreateTags } from './workflow-utils';
import { findOrCreateFolder } from './folder-utils';
import { generateUniqueKey } from '@/shared/lib/generate-key';
import { triggerSkillEmbedding } from '@/server/skills/skill-embedding-service';
import type { Visibility } from '@prisma/client';

export const addSkillToolSchema = {
  name: z.string().min(1).max(255).describe('Name of the skill'),
  content: z.string().min(1).describe('Content of the skill (markdown supported)'),
  description: z.string().max(1000).optional().describe('Short description of the skill'),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional().default('PRIVATE').describe('Visibility setting'),
  tags: z.array(z.string()).optional().describe('Array of tag names to associate with the skill'),
  folder_id: z.string().optional().describe('Existing folder ID to add skill to'),
  folder: z.string().optional().describe('Folder name - uses existing or creates new folder lazily'),
};

export interface AddSkillInput {
  name: string;
  content: string;
  description?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  tags?: string[];
  folder_id?: string;
  folder?: string;
}

interface AddSkillResponse {
  id: string;
  key: string;
  name: string;
  visibility: Visibility;
  createdAt: string;
  folder?: {
    id: string;
    key: string;
    name: string;
    created: boolean;
  };
}

export async function addSkillHandler(
  input: AddSkillInput,
  userId: string | null
): Promise<McpResponse> {
  try {
    const auth = requireAuth(userId);
    if (!auth.authenticated) {
      return auth.response;
    }

    const { name, content, description, visibility = 'PRIVATE', tags = [], folder_id, folder } = input;

    if (!name || name.trim() === '') {
      return mcpError('name is required');
    }

    if (!content || content.trim() === '') {
      return mcpError('content is required');
    }

    const skillKey = generateUniqueKey(name);

    const createdSkill = await withRetry(async () => {
      return prisma.$transaction(async (tx) => {
        const skill = await tx.skill.create({
          data: {
            name: name.trim(),
            content,
            description: description?.trim() || null,
            visibility,
            userId: auth.userId,
            key: skillKey,
            isActive: true,
            isSystemSkill: false,
            position: 0,
          },
        });

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

        return skill;
      });
    });

    triggerSkillEmbedding(createdSkill.id);

    // Handle folder assignment (folder_id takes precedence over folder name)
    let folderInfo: AddSkillResponse['folder'] | undefined;

    if (folder_id || folder) {
      try {
        const folderResult = await findOrCreateFolder({
          userId: auth.userId,
          folderId: folder_id,
          folderName: folder,
          targetType: 'SKILL',
          targetId: createdSkill.id,
        });

        if (folderResult) {
          folderInfo = folderResult;
        }
      } catch (folderError) {
        console.error('[MCP] Failed to add skill to folder:', folderError);
        // Don't fail the whole operation if folder addition fails
      }
    }

    const response: AddSkillResponse = {
      id: createdSkill.id,
      key: createdSkill.key || skillKey,
      name: createdSkill.name,
      visibility: createdSkill.visibility,
      createdAt: createdSkill.createdAt.toISOString(),
      folder: folderInfo,
    };

    return mcpSuccess({
      message: folderInfo
        ? folderInfo.created
          ? `Skill created and added to new folder "${folderInfo.name}"`
          : `Skill created and added to folder "${folderInfo.name}"`
        : 'Skill created successfully',
      skill: response,
    });
  } catch (error) {
    console.error('[MCP] Error in add_skill:', error);
    return mcpError('Failed to create skill. Please try again.');
  }
}
