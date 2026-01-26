/**
 * MCP Folder Utilities
 * Shared folder handling logic for MCP tools
 */

import { prisma } from '@/server/db/client';
import { generateFolderKey } from '@/server/folders/folder-service';
import { randomUUID } from 'crypto';

export interface FolderResult {
  id: string;
  key: string;
  name: string;
  created: boolean;
}

export interface FindOrCreateFolderInput {
  userId: string;
  folderId?: string;
  folderName?: string;
  targetType: 'WORKFLOW' | 'MINI_PROMPT' | 'SKILL';
  targetId: string;
}

/**
 * Find or create a folder and add an item to it
 *
 * Logic:
 * - If folderId provided: use existing folder (must exist and belong to user)
 * - If folderName provided: find by name or create new folder
 * - Returns folder info with `created: true` if folder was created
 */
export async function findOrCreateFolder(
  input: FindOrCreateFolderInput
): Promise<FolderResult | null> {
  const { userId, folderId, folderName, targetType, targetId } = input;

  let folder: { id: string; key: string | null; name: string } | null = null;
  let created = false;

  // Priority 1: Use folder_id if provided
  if (folderId) {
    folder = await prisma.folders.findFirst({
      where: {
        id: folderId,
        user_id: userId,
        is_active: true,
        deleted_at: null,
      },
      select: { id: true, key: true, name: true },
    });

    if (!folder) {
      return null; // Folder not found or doesn't belong to user
    }
  }
  // Priority 2: Find or create by folder name
  else if (folderName) {
    const trimmedName = folderName.trim();
    if (!trimmedName) {
      return null;
    }

    // Try to find existing folder by name
    folder = await prisma.folders.findFirst({
      where: {
        user_id: userId,
        name: trimmedName,
        is_active: true,
        deleted_at: null,
      },
      select: { id: true, key: true, name: true },
    });

    // Create new folder if not found
    if (!folder) {
      const key = await generateFolderKey(trimmedName, userId);

      // Get max position for user's folders
      const maxPosition = await prisma.folders.aggregate({
        where: { user_id: userId },
        _max: { position: true },
      });
      const newPosition = (maxPosition._max.position ?? -1) + 1;

      const newFolder = await prisma.folders.create({
        data: {
          id: randomUUID(),
          user_id: userId,
          name: trimmedName,
          key,
          visibility: 'PRIVATE',
          position: newPosition,
          is_active: true,
          updated_at: new Date(),
        },
        select: { id: true, key: true, name: true },
      });

      folder = newFolder;
      created = true;
    }
  }

  if (!folder) {
    return null;
  }

  // Add item to folder
  const maxPosition = await prisma.folder_items.aggregate({
    where: { folder_id: folder.id },
    _max: { position: true },
  });
  const itemPosition = (maxPosition._max.position ?? -1) + 1;

  await prisma.folder_items.create({
    data: {
      id: randomUUID(),
      folder_id: folder.id,
      target_type: targetType,
      target_id: targetId,
      position: itemPosition,
    },
  });

  return {
    id: folder.id,
    key: folder.key || folder.id,
    name: folder.name,
    created,
  };
}
