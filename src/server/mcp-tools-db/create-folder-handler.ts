/**
 * MCP Tool: create_folder
 * Creates a new folder for organizing workflows and prompts (requires auth)
 */

import { z } from 'zod';
import { requireAuth, mcpError, mcpSuccess, type McpResponse } from './require-auth';
import * as folderService from '@/server/folders/folder-service';

export const createFolderToolSchema = {
  name: z.string().min(1).max(100).describe('Folder name'),
  description: z.string().max(500).optional().describe('Folder description'),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).optional().default('PRIVATE').describe('Visibility setting'),
  key: z.string().max(100).optional().describe('Custom folder key (auto-generated from name if not provided)'),
};

export interface CreateFolderInput {
  name: string;
  description?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  key?: string;
}

interface CreateFolderResponse {
  id: string;
  name: string;
  key: string | null;
  visibility: string;
  description: string | null;
}

export async function createFolderHandler(
  input: CreateFolderInput,
  userId: string | null
): Promise<McpResponse> {
  try {
    const auth = requireAuth(userId);
    if (!auth.authenticated) {
      return auth.response;
    }

    const { name, description, visibility = 'PRIVATE', key } = input;

    if (!name || name.trim() === '') {
      return mcpError('name is required');
    }

    const result = await folderService.createFolder(
      {
        name: name.trim(),
        description: description?.trim() || null,
        visibility,
        key: key?.trim(),
      },
      auth.userId
    );

    if (!result.success || !result.data) {
      return mcpError(result.error || 'Failed to create folder');
    }

    const response: CreateFolderResponse = {
      id: result.data.id,
      name: result.data.name,
      key: result.data.key,
      visibility: result.data.visibility,
      description: result.data.description,
    };

    return mcpSuccess({
      message: 'Folder created successfully',
      folder: response,
    });
  } catch (error) {
    console.error('[MCP] Error in create_folder:', error);
    return mcpError('Failed to create folder. Please try again.');
  }
}
