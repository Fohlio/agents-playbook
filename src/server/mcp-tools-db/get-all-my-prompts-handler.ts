/**
 * MCP Tool: get_all_my_prompts
 * Returns paginated list of user's prompts with metadata (requires auth)
 */

import { z } from 'zod';
import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';
import { requireAuth, mcpError, mcpSuccess, type McpResponse } from './require-auth';
import type { Visibility } from '@prisma/client';

export const getAllMyPromptsToolSchema = {
  page: z.number().optional().default(1).describe('Page number (default: 1)'),
  limit: z.number().optional().default(20).describe('Items per page (default: 20, max: 100)'),
  search: z.string().optional().describe('Search term to filter prompts by name or content'),
};

export interface GetAllMyPromptsInput {
  page?: number;
  limit?: number;
  search?: string;
}

interface PromptItem {
  id: string;
  name: string;
  description: string | null;
  content: string;
  visibility: Visibility;
  isActive: boolean;
  key: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface PaginatedPromptsResponse {
  prompts: PromptItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getAllMyPromptsHandler(
  input: GetAllMyPromptsInput,
  userId: string | null
): Promise<McpResponse> {
  try {
    const auth = requireAuth(userId);
    if (!auth.authenticated) {
      return auth.response;
    }

    const page = Math.max(1, input.page ?? 1);
    const limit = Math.min(100, Math.max(1, input.limit ?? 20));
    const search = input.search?.trim() || undefined;
    const skip = (page - 1) * limit;

    const whereClause = {
      userId: auth.userId,
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { content: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [prompts, total] = await withRetry(async () => {
      return Promise.all([
        prisma.miniPrompt.findMany({
          where: whereClause,
          include: { tags: { include: { tag: true } } },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.miniPrompt.count({ where: whereClause }),
      ]);
    });

    const response: PaginatedPromptsResponse = {
      prompts: prompts.map((prompt) => ({
        id: prompt.id,
        name: prompt.name,
        description: prompt.description,
        content: prompt.content,
        visibility: prompt.visibility,
        isActive: prompt.isActive,
        key: prompt.key,
        createdAt: prompt.createdAt.toISOString(),
        updatedAt: prompt.updatedAt.toISOString(),
        tags: prompt.tags.map((mpt) => mpt.tag.name),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    return mcpSuccess(response);
  } catch (error) {
    console.error('[MCP] Error in get_all_my_prompts:', error);
    return mcpError('Failed to retrieve prompts. Please try again.');
  }
}
