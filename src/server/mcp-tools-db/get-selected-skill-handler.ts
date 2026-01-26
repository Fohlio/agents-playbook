/**
 * MCP Tool: get_selected_skill
 * Returns complete details and content for a specific skill
 */

import { z } from 'zod';
import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';
import { mcpError, type McpResponse } from './require-auth';

export const getSelectedSkillToolSchema = {
  skill_id: z.string().optional().describe('ID of the skill (UUID). Use this OR key, not both.'),
  key: z.string().optional().describe('Unique key of a skill. Use this OR skill_id, not both.'),
};

export interface GetSelectedSkillInput {
  skill_id?: string;
  key?: string;
}

const skillInclude = {
  user: { select: { id: true, username: true } },
  attachments: {
    select: {
      id: true,
      fileName: true,
      fileSize: true,
      mimeType: true,
      blobUrl: true,
    },
  },
  tags: { include: { tag: { select: { name: true } } } },
  _count: { select: { stageSkills: true, references: true } },
} as const;

export async function getSelectedSkillHandler(
  input: GetSelectedSkillInput,
  userId: string | null
): Promise<McpResponse> {
  try {
    const { skill_id, key } = input;

    if (!skill_id && !key) {
      return mcpError('Please provide either a skill_id (UUID) or a key to retrieve a skill.');
    }

    const whereClause = key ? { key } : { id: skill_id! };

    const skill = await withRetry(() =>
      prisma.skill.findUnique({
        where: whereClause,
        include: skillInclude,
      })
    );

    if (!skill) {
      const lookupType = key ? `key "${key}"` : `ID "${skill_id}"`;
      return mcpError(`Skill not found with ${lookupType}. Use \`get_skills\` to see available skills.`);
    }

    if (skill.deletedAt) {
      return mcpError('This skill has been deleted.');
    }

    if (!skill.isActive) {
      return mcpError('This skill is inactive.');
    }

    if (skill.visibility === 'PRIVATE' && skill.userId !== userId) {
      return mcpError('Skill not found or you don\'t have permission to view it.');
    }

    // Format metadata
    const tags = skill.tags?.map((st: { tag: { name: string } }) => st.tag.name) || [];
    const visibilityBadge = skill.visibility === 'PUBLIC' ? 'Public' : 'Private';
    const systemBadge = skill.isSystemSkill ? 'System' : 'User';

    let response = `## ${skill.name}\n\n`;
    response += `**Visibility:** ${visibilityBadge}\n`;
    response += `**Type:** ${systemBadge}\n`;
    response += `**Author:** @${skill.user.username}\n`;

    if (skill.key) {
      response += `**Key:** \`${skill.key}\`\n`;
    }

    if (skill.description) {
      response += `**Description:** ${skill.description}\n`;
    }

    if (tags.length > 0) {
      response += `**Tags:** ${tags.join(', ')}\n`;
    }

    response += `**Used in Workflows:** ${skill._count.stageSkills}\n`;
    response += `**In Libraries:** ${skill._count.references}\n`;
    response += `**Created:** ${skill.createdAt.toLocaleDateString()}\n`;
    response += `**Updated:** ${skill.updatedAt.toLocaleDateString()}\n`;

    // Attachments
    if (skill.attachments.length > 0) {
      response += `\n### Attachments (${skill.attachments.length})\n\n`;
      for (const att of skill.attachments) {
        const sizeKB = Math.round(att.fileSize / 1024);
        response += `- **${att.fileName}** (${att.mimeType}, ${sizeKB}KB)\n  URL: ${att.blobUrl}\n`;
      }
    }

    // Content
    response += `\n---\n\n${skill.content}\n`;
    response += `\n---\n\n**Important:** Follow all the steps and instructions outlined above.\n`;

    return {
      content: [{
        type: "text",
        text: response,
      }],
    };
  } catch (error) {
    console.error('[MCP] Error in get_selected_skill:', error);
    const identifier = input.key || input.skill_id || 'unknown';
    return mcpError(`Failed to retrieve skill "${identifier}". Please try again.`);
  }
}
