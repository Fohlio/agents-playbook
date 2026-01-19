/**
 * MCP Tool: get_by_folder
 * Gets folder contents by folder key with pagination
 */

import { z } from 'zod';
import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';
import { mcpError, mcpSuccess, type McpResponse } from './require-auth';

export const getByFolderToolSchema = {
  folder_key: z.string().describe('Unique folder key'),
  page: z.number().optional().default(1).describe('Page number (1-based)'),
  limit: z.number().optional().default(20).describe('Items per page (max 100)'),
};

export interface GetByFolderInput {
  folder_key: string;
  page?: number;
  limit?: number;
}

interface FolderItem {
  type: 'WORKFLOW' | 'MINI_PROMPT';
  id: string;
  name: string;
  description: string | null;
  content?: string; // Only for prompts
  position: number;
}

interface GetByFolderResponse {
  folder: {
    id: string;
    name: string;
    key: string | null;
    visibility: string;
  };
  items: FolderItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export async function getByFolderHandler(
  input: GetByFolderInput,
  userId: string | null
): Promise<McpResponse> {
  try {
    const { folder_key, page = 1, limit = 20 } = input;

    // Clamp limit to max 100
    const clampedLimit = Math.min(Math.max(1, limit), 100);
    const clampedPage = Math.max(1, page);

    // Find folder by key
    const folder = await withRetry(() =>
      prisma.folders.findUnique({
        where: { key: folder_key },
      })
    );

    if (!folder) {
      return mcpError(`Folder not found with key: ${folder_key}`);
    }

    // Check access for private folders
    if (folder.visibility === 'PRIVATE') {
      if (!userId || folder.user_id !== userId) {
        return mcpError('Access denied: This folder is private');
      }
    }

    // Check if folder is deleted
    if (folder.deleted_at) {
      return mcpError('Folder not found');
    }

    // Get folder items with pagination
    const skip = (clampedPage - 1) * clampedLimit;

    const [folderItems, total] = await Promise.all([
      withRetry(() =>
        prisma.folder_items.findMany({
          where: { folder_id: folder.id },
          orderBy: { position: 'asc' },
          skip,
          take: clampedLimit,
        })
      ),
      withRetry(() =>
        prisma.folder_items.count({
          where: { folder_id: folder.id },
        })
      ),
    ]);

    // Separate IDs by type
    const workflowIds = folderItems
      .filter((i) => i.target_type === 'WORKFLOW')
      .map((i) => i.target_id);

    const promptIds = folderItems
      .filter((i) => i.target_type === 'MINI_PROMPT')
      .map((i) => i.target_id);

    // Fetch actual items
    const [workflows, prompts] = await Promise.all([
      workflowIds.length > 0
        ? withRetry(() =>
            prisma.workflow.findMany({
              where: {
                id: { in: workflowIds },
                deletedAt: null,
              },
              select: {
                id: true,
                name: true,
                description: true,
              },
            })
          )
        : [],
      promptIds.length > 0
        ? withRetry(() =>
            prisma.miniPrompt.findMany({
              where: {
                id: { in: promptIds },
                deletedAt: null,
                // Exclude prompts that are part of workflows
                stageMiniPrompts: { none: {} },
              },
              select: {
                id: true,
                name: true,
                description: true,
                content: true,
              },
            })
          )
        : [],
    ]);

    // Build items array maintaining order
    const items: FolderItem[] = [];
    for (const fi of folderItems) {
      if (fi.target_type === 'WORKFLOW') {
        const w = workflows.find((wf) => wf.id === fi.target_id);
        if (w) {
          items.push({
            type: 'WORKFLOW',
            id: w.id,
            name: w.name,
            description: w.description,
            position: fi.position,
          });
        }
      } else {
        const p = prompts.find((pr) => pr.id === fi.target_id);
        if (p) {
          items.push({
            type: 'MINI_PROMPT',
            id: p.id,
            name: p.name,
            description: p.description,
            content: p.content,
            position: fi.position,
          });
        }
      }
    }

    const response: GetByFolderResponse = {
      folder: {
        id: folder.id,
        name: folder.name,
        key: folder.key,
        visibility: folder.visibility,
      },
      items,
      pagination: {
        page: clampedPage,
        limit: clampedLimit,
        total,
        hasMore: skip + clampedLimit < total,
      },
    };

    return mcpSuccess(response);
  } catch (error) {
    console.error('[MCP] Error in get_by_folder:', error);
    return mcpError('Failed to get folder contents. Please try again.');
  }
}
