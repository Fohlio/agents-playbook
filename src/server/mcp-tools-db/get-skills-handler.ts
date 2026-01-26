/**
 * MCP Tool: get_skills
 * Returns skills based on auth context with optional search/semantic filtering
 */

import { z } from 'zod';
import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';
import { dbSemanticSearch } from '@/server/workflows/db-semantic-search';
import type { McpResponse } from './require-auth';

export const getSkillsToolSchema = {
  search: z.string().optional().describe('Optional text search filter on skill name, description, or content'),
  task_description: z.string().optional().describe('Description of the task to find relevant skills using semantic search'),
};

export interface GetSkillsInput {
  search?: string;
  task_description?: string;
}

/** Shared skill include for list queries */
const skillListInclude = {
  tags: { include: { tag: { select: { name: true } } } },
  _count: { select: { attachments: true, stageSkills: true } },
} as const;

interface SkillListItem {
  id: string;
  name: string;
  description: string | null;
  content: string;
  isSystemSkill: boolean;
  tags: Array<{ tag: { name: string } }>;
  _count: { attachments: number; stageSkills: number };
}

/** Format a skill for the list response */
function formatSkillItem(skill: SkillListItem, index: number, showSource: boolean): string {
  const tags = skill.tags?.map((st) => st.tag.name) || [];
  const sourceIndicator = showSource ? (skill.isSystemSkill ? '[SYSTEM] ' : '[USER] ') : '';
  const tagsStr = tags.length > 0 ? ` | Tags: ${tags.join(', ')}` : '';
  const attachStr = skill._count.attachments > 0 ? ` | Attachments: ${skill._count.attachments}` : '';
  const previewText = skill.description || skill.content;
  const preview = previewText.slice(0, 100) + (previewText.length > 100 ? '...' : '');

  return `${index + 1}. ${sourceIndicator}**${skill.name}**\n   ${preview}${tagsStr}${attachStr}\n   ID: ${skill.id}`;
}

export async function getSkillsHandler(
  input: GetSkillsInput,
  userId: string | null
): Promise<McpResponse> {
  try {
    const { search, task_description } = input;

    // Semantic search path
    if (task_description) {
      return handleSemanticSearch(task_description, userId);
    }

    // Text filter path
    return handleTextSearch(search, userId);
  } catch (error) {
    console.error('[MCP] Error in get_skills:', error);
    return {
      content: [{ type: "text", text: 'Error: Failed to fetch skills. Please try again.' }],
    };
  }
}

async function handleSemanticSearch(taskDescription: string, userId: string | null): Promise<McpResponse> {
  const results = await dbSemanticSearch.searchSkills(
    taskDescription,
    10,
    userId || undefined
  );

  if (results.length === 0) {
    const hint = userId
      ? 'Try creating a new skill or adjusting your search.'
      : 'Try different search terms or authenticate to see your skills.';
    return {
      content: [{
        type: "text",
        text: `No relevant skills found for "${taskDescription}". ${hint}`,
      }],
    };
  }

  const formattedResults = results.map((skill, index) => {
    const sourceIndicator = skill.source === 'system' ? '[SYSTEM]' : '[USER]';
    const similarity = Math.round(skill.similarity * 100);
    const tagsStr = skill.tags.length > 0 ? ` | Tags: ${skill.tags.join(', ')}` : '';
    const attachStr = skill.attachmentCount > 0 ? ` | Attachments: ${skill.attachmentCount}` : '';

    return `${index + 1}. ${sourceIndicator} **${skill.name}** (${similarity}% match)\n   ${skill.description || 'No description'}${tagsStr}${attachStr}\n   ID: ${skill.id}`;
  });

  return {
    content: [{
      type: "text",
      text: `Found ${results.length} skills matching "${taskDescription}":\n\n${formattedResults.join('\n\n')}\n\n**Next Steps:**\nUse \`get_selected_skill\` with a skill ID to view full content and details.`,
    }],
  };
}

async function handleTextSearch(search: string | undefined, userId: string | null): Promise<McpResponse> {
  const baseFilter = await buildAuthFilter(userId);

  const whereClause: Record<string, unknown> = { ...baseFilter };
  if (search) {
    // Use AND to combine auth filter's OR with search filter's OR
    whereClause.AND = [
      {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      },
    ];
  }

  const skills = await withRetry(() =>
    prisma.skill.findMany({
      where: whereClause,
      include: skillListInclude,
      orderBy: [{ createdAt: 'desc' }],
      take: 20,
    })
  );

  if (skills.length === 0) {
    const searchHint = search ? ` matching "${search}"` : '';
    const actionHint = userId
      ? 'Try a different search term or create a new skill with `add_skill`.'
      : 'Try a different search term or authenticate to access your library.';
    return {
      content: [{
        type: "text",
        text: `No active skills found${searchHint}. ${actionHint}`,
      }],
    };
  }

  const showSource = !!userId;
  const formattedResults = skills.map((skill, index) => formatSkillItem(skill, index, showSource));

  const searchLabel = search ? ` matching "${search}"` : '';
  const tipLine = !userId ? '\n\n**Tip:** Authenticate to access your personal skills.' : '';

  return {
    content: [{
      type: "text",
      text: `Found ${skills.length} skills${searchLabel}:\n\n${formattedResults.join('\n\n')}\n\n**Next Steps:**\nUse \`get_selected_skill\` with a skill ID to view full content and details.${tipLine}`,
    }],
  };
}

/**
 * Build Prisma where clause based on auth context.
 * Unauthenticated: public system skills only.
 * Authenticated: user's own + referenced + public system skills (single query with OR).
 */
async function buildAuthFilter(userId: string | null): Promise<Record<string, unknown>> {
  if (!userId) {
    return {
      isSystemSkill: true,
      isActive: true,
      deletedAt: null,
      visibility: 'PUBLIC',
    };
  }

  const references = await prisma.skillReference.findMany({
    where: { userId },
    select: { skillId: true },
  });
  const referencedIds = references.map((r) => r.skillId);

  const orConditions: Array<Record<string, unknown>> = [
    { userId },
    { isSystemSkill: true, visibility: 'PUBLIC' },
  ];

  if (referencedIds.length > 0) {
    orConditions.push({ id: { in: referencedIds } });
  }

  return {
    isActive: true,
    deletedAt: null,
    OR: orConditions,
  };
}
