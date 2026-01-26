import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';
import { randomUUID } from 'crypto';
import {
  FolderWithItems,
  FolderBasic,
  FolderContents,
  WorkflowWithMeta,
  PromptWithMeta,
  SkillWithFolderMeta,
  TrashedItem,
  CreateFolderInput,
  UpdateFolderInput,
  FolderServiceResult,
  FolderTargetType,
  UncategorizedItems,
} from './types';

/**
 * Folder Service
 *
 * Provides database operations for the Library file system.
 * Handles folder CRUD, item organization, and trash management.
 */

/**
 * Helper to get display username from user object
 */
function getDisplayUsername(user: { username: string | null; email: string }): string {
  return user.username ?? user.email.split('@')[0];
}

/**
 * Generate a unique folder key from name
 * Creates a slug-style key and ensures uniqueness by appending random suffix if needed
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateFolderKey(name: string, _userId: string): Promise<string> {
  // Create base slug from name
  const baseKey = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);

  // Check if base key exists
  const existing = await prisma.folders.findUnique({
    where: { key: baseKey },
  });

  if (!existing) {
    return baseKey;
  }

  // Add random suffix for uniqueness
  const suffix = randomUUID().substring(0, 8);
  return `${baseKey}-${suffix}`;
}

/**
 * Get all folders for a user (excluding deleted ones)
 */
export async function getUserFolders(userId: string): Promise<FolderServiceResult<FolderWithItems[]>> {
  try {
    const folders = await withRetry(() =>
      prisma.folders.findMany({
        where: {
          user_id: userId,
          is_active: true,
          deleted_at: null,
        },
        orderBy: { position: 'asc' },
        include: {
          _count: {
            select: { folder_items: true },
          },
        },
      })
    );

    const mappedFolders: FolderWithItems[] = folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      key: folder.key,
      description: folder.description,
      visibility: folder.visibility,
      position: folder.position,
      deletedAt: folder.deleted_at,
      createdAt: folder.created_at,
      updatedAt: folder.updated_at,
      itemCount: folder._count.folder_items,
    }));

    return { success: true, data: mappedFolders };
  } catch (error) {
    console.error('[FolderService] getUserFolders error:', error);
    return { success: false, error: 'Failed to fetch folders' };
  }
}

/**
 * Get a single folder by ID
 */
export async function getFolderById(
  folderId: string,
  userId: string
): Promise<FolderServiceResult<FolderBasic>> {
  try {
    const folder = await withRetry(() =>
      prisma.folders.findFirst({
        where: {
          id: folderId,
          user_id: userId,
          is_active: true,
          deleted_at: null,
        },
      })
    );

    if (!folder) {
      return { success: false, error: 'Folder not found' };
    }

    return {
      success: true,
      data: {
        id: folder.id,
        name: folder.name,
        key: folder.key,
        description: folder.description,
        visibility: folder.visibility,
        position: folder.position,
      },
    };
  } catch (error) {
    console.error('[FolderService] getFolderById error:', error);
    return { success: false, error: 'Failed to fetch folder' };
  }
}

/**
 * Get items not in any folder (Uncategorized view)
 * Returns workflows and standalone prompts with zero folder_items entries
 */
export async function getUncategorizedItems(userId: string): Promise<FolderServiceResult<UncategorizedItems>> {
  try {
    // Get all workflow IDs that are in folders
    const workflowsInFolders = await prisma.folder_items.findMany({
      where: { target_type: 'WORKFLOW' },
      select: { target_id: true },
    });
    const workflowIdsInFolders = new Set(workflowsInFolders.map((w) => w.target_id));

    // Get all prompt IDs that are in folders
    const promptsInFolders = await prisma.folder_items.findMany({
      where: { target_type: 'MINI_PROMPT' },
      select: { target_id: true },
    });
    const promptIdsInFolders = new Set(promptsInFolders.map((p) => p.target_id));

    // Get prompts that are inside workflows (not standalone)
    const promptsInWorkflows = await prisma.stageMiniPrompt.findMany({
      select: { miniPromptId: true },
    });
    const promptIdsInWorkflows = new Set(promptsInWorkflows.map((p) => p.miniPromptId));

    // Fetch uncategorized workflows
    const workflows = await withRetry(() =>
      prisma.workflow.findMany({
        where: {
          userId,
          isActive: true,
          deletedAt: null,
        },
        include: {
          user: {
            select: { id: true, username: true, email: true },
          },
          _count: {
            select: { stages: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    );

    // Filter to only uncategorized workflows
    const uncategorizedWorkflows: WorkflowWithMeta[] = workflows
      .filter((w) => !workflowIdsInFolders.has(w.id))
      .map((w) => ({
        id: w.id,
        name: w.name,
        description: w.description,
        visibility: w.visibility,
        isActive: w.isActive,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        key: w.key,
        user: {
          id: w.user.id,
          username: getDisplayUsername(w.user),
          email: w.user.email,
        },
        _count: { stages: w._count.stages },
        folderPosition: 0,
      }));

    // Fetch uncategorized prompts (standalone only)
    const prompts = await withRetry(() =>
      prisma.miniPrompt.findMany({
        where: {
          userId,
          isActive: true,
          deletedAt: null,
        },
        include: {
          user: {
            select: { id: true, username: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    );

    // Filter to only uncategorized AND standalone prompts
    const uncategorizedPrompts: PromptWithMeta[] = prompts
      .filter((p) => !promptIdsInFolders.has(p.id) && !promptIdsInWorkflows.has(p.id))
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        content: p.content,
        visibility: p.visibility,
        isActive: p.isActive,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        key: p.key,
        user: {
          id: p.user.id,
          username: getDisplayUsername(p.user),
          email: p.user.email,
        },
        folderPosition: 0,
        isStandalone: true,
      }));

    // Get all skill IDs that are in folders
    const skillsInFolders = await prisma.folder_items.findMany({
      where: { target_type: 'SKILL' },
      select: { target_id: true },
    });
    const skillIdsInFolders = new Set(skillsInFolders.map((s) => s.target_id));

    // Fetch uncategorized skills
    const skills = await withRetry(() =>
      prisma.skill.findMany({
        where: {
          userId,
          isActive: true,
          deletedAt: null,
        },
        include: {
          user: {
            select: { id: true, username: true, email: true },
          },
          _count: {
            select: { attachments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    );

    const uncategorizedSkills: SkillWithFolderMeta[] = skills
      .filter((s) => !skillIdsInFolders.has(s.id))
      .map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        visibility: s.visibility,
        isActive: s.isActive,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        key: s.key,
        user: {
          id: s.user.id,
          username: getDisplayUsername(s.user),
          email: s.user.email,
        },
        folderPosition: 0,
        attachmentCount: s._count.attachments,
      }));

    return {
      success: true,
      data: {
        workflows: uncategorizedWorkflows,
        prompts: uncategorizedPrompts,
        skills: uncategorizedSkills,
      },
    };
  } catch (error) {
    console.error('[FolderService] getUncategorizedItems error:', error);
    return { success: false, error: 'Failed to fetch uncategorized items' };
  }
}

/**
 * Get all trashed items for a user
 * Items where deleted_at IS NOT NULL
 */
export async function getTrashedItems(userId: string): Promise<FolderServiceResult<TrashedItem[]>> {
  try {
    // Get trashed workflows
    const trashedWorkflows = await withRetry(() =>
      prisma.workflow.findMany({
        where: {
          userId,
          deletedAt: { not: null },
        },
        select: {
          id: true,
          name: true,
          description: true,
          deletedAt: true,
        },
        orderBy: { deletedAt: 'desc' },
      })
    );

    // Get trashed prompts
    const trashedPrompts = await withRetry(() =>
      prisma.miniPrompt.findMany({
        where: {
          userId,
          deletedAt: { not: null },
        },
        select: {
          id: true,
          name: true,
          description: true,
          deletedAt: true,
        },
        orderBy: { deletedAt: 'desc' },
      })
    );

    // Get trashed skills
    const trashedSkills = await withRetry(() =>
      prisma.skill.findMany({
        where: {
          userId,
          deletedAt: { not: null },
        },
        select: {
          id: true,
          name: true,
          description: true,
          deletedAt: true,
        },
        orderBy: { deletedAt: 'desc' },
      })
    );

    const trashedItems: TrashedItem[] = [
      ...trashedWorkflows.map((w) => ({
        id: w.id,
        name: w.name,
        type: 'WORKFLOW' as FolderTargetType,
        deletedAt: w.deletedAt!,
        description: w.description,
      })),
      ...trashedPrompts.map((p) => ({
        id: p.id,
        name: p.name,
        type: 'MINI_PROMPT' as FolderTargetType,
        deletedAt: p.deletedAt!,
        description: p.description,
      })),
      ...trashedSkills.map((s) => ({
        id: s.id,
        name: s.name,
        type: 'SKILL' as FolderTargetType,
        deletedAt: s.deletedAt!,
        description: s.description,
      })),
    ];

    // Sort by deletedAt descending
    trashedItems.sort((a, b) => b.deletedAt.getTime() - a.deletedAt.getTime());

    return { success: true, data: trashedItems };
  } catch (error) {
    console.error('[FolderService] getTrashedItems error:', error);
    return { success: false, error: 'Failed to fetch trashed items' };
  }
}

/**
 * Get contents of a folder
 * Returns workflows and standalone prompts in the folder
 */
export async function getFolderContents(
  folderId: string,
  userId: string
): Promise<FolderServiceResult<FolderContents>> {
  try {
    // Verify folder ownership
    const folder = await prisma.folders.findFirst({
      where: {
        id: folderId,
        user_id: userId,
        is_active: true,
        deleted_at: null,
      },
    });

    if (!folder) {
      return { success: false, error: 'Folder not found' };
    }

    // Get all items in this folder
    const folderItems = await withRetry(() =>
      prisma.folder_items.findMany({
        where: { folder_id: folderId },
        orderBy: { position: 'asc' },
      })
    );

    // Separate by type
    const workflowIds = folderItems
      .filter((item) => item.target_type === 'WORKFLOW')
      .map((item) => ({ id: item.target_id, position: item.position }));

    const promptIds = folderItems
      .filter((item) => item.target_type === 'MINI_PROMPT')
      .map((item) => ({ id: item.target_id, position: item.position }));

    // Get prompts that are inside workflows (not standalone)
    const promptsInWorkflows = await prisma.stageMiniPrompt.findMany({
      select: { miniPromptId: true },
    });
    const promptIdsInWorkflows = new Set(promptsInWorkflows.map((p) => p.miniPromptId));

    // Fetch workflows
    const workflows = await withRetry(() =>
      prisma.workflow.findMany({
        where: {
          id: { in: workflowIds.map((w) => w.id) },
          isActive: true,
          deletedAt: null,
        },
        include: {
          user: {
            select: { id: true, username: true, email: true },
          },
          _count: {
            select: { stages: true },
          },
        },
      })
    );

    // Map workflows with position
    const workflowsWithMeta: WorkflowWithMeta[] = workflows.map((w) => {
      const folderItem = workflowIds.find((item) => item.id === w.id);
      return {
        id: w.id,
        name: w.name,
        description: w.description,
        visibility: w.visibility,
        isActive: w.isActive,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        key: w.key,
        user: {
          id: w.user.id,
          username: getDisplayUsername(w.user),
          email: w.user.email,
        },
        _count: { stages: w._count.stages },
        folderPosition: folderItem?.position ?? 0,
      };
    });

    // Fetch prompts (only standalone ones)
    const prompts = await withRetry(() =>
      prisma.miniPrompt.findMany({
        where: {
          id: { in: promptIds.map((p) => p.id) },
          isActive: true,
          deletedAt: null,
        },
        include: {
          user: {
            select: { id: true, username: true, email: true },
          },
        },
      })
    );

    // Map prompts with position, filtering out workflow-contained prompts
    const promptsWithMeta: PromptWithMeta[] = prompts
      .filter((p) => !promptIdsInWorkflows.has(p.id))
      .map((p) => {
        const folderItem = promptIds.find((item) => item.id === p.id);
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          content: p.content,
          visibility: p.visibility,
          isActive: p.isActive,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          key: p.key,
          user: {
            id: p.user.id,
            username: getDisplayUsername(p.user),
            email: p.user.email,
          },
          folderPosition: folderItem?.position ?? 0,
          isStandalone: true,
        };
      });

    // Get skills in this folder
    const skillIds = folderItems
      .filter((item) => item.target_type === 'SKILL')
      .map((item) => ({ id: item.target_id, position: item.position }));

    const skills = await withRetry(() =>
      prisma.skill.findMany({
        where: {
          id: { in: skillIds.map((s) => s.id) },
          isActive: true,
          deletedAt: null,
        },
        include: {
          user: {
            select: { id: true, username: true, email: true },
          },
          _count: {
            select: { attachments: true },
          },
        },
      })
    );

    const skillsWithMeta: SkillWithFolderMeta[] = skills.map((s) => {
      const folderItem = skillIds.find((item) => item.id === s.id);
      return {
        id: s.id,
        name: s.name,
        description: s.description,
        visibility: s.visibility,
        isActive: s.isActive,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        key: s.key,
        user: {
          id: s.user.id,
          username: getDisplayUsername(s.user),
          email: s.user.email,
        },
        folderPosition: folderItem?.position ?? 0,
        attachmentCount: s._count.attachments,
      };
    });

    // Sort by position
    workflowsWithMeta.sort((a, b) => a.folderPosition - b.folderPosition);
    promptsWithMeta.sort((a, b) => a.folderPosition - b.folderPosition);
    skillsWithMeta.sort((a, b) => a.folderPosition - b.folderPosition);

    return {
      success: true,
      data: {
        workflows: workflowsWithMeta,
        prompts: promptsWithMeta,
        skills: skillsWithMeta,
      },
    };
  } catch (error) {
    console.error('[FolderService] getFolderContents error:', error);
    return { success: false, error: 'Failed to fetch folder contents' };
  }
}

/**
 * Create a new folder
 */
export async function createFolder(
  data: CreateFolderInput,
  userId: string
): Promise<FolderServiceResult<FolderBasic>> {
  try {
    // Generate key if not provided
    const key = data.key ?? (await generateFolderKey(data.name, userId));

    // Get the highest position for user's folders
    const maxPosition = await prisma.folders.aggregate({
      where: { user_id: userId },
      _max: { position: true },
    });

    const newPosition = (maxPosition._max.position ?? -1) + 1;

    const folder = await withRetry(() =>
      prisma.folders.create({
        data: {
          id: randomUUID(),
          user_id: userId,
          name: data.name,
          description: data.description ?? null,
          visibility: data.visibility ?? 'PRIVATE',
          key,
          position: newPosition,
          is_active: true,
          updated_at: new Date(),
        },
      })
    );

    return {
      success: true,
      data: {
        id: folder.id,
        name: folder.name,
        key: folder.key,
        description: folder.description,
        visibility: folder.visibility,
        position: folder.position,
      },
    };
  } catch (error) {
    console.error('[FolderService] createFolder error:', error);
    return { success: false, error: 'Failed to create folder' };
  }
}

/**
 * Update a folder
 */
export async function updateFolder(
  folderId: string,
  data: UpdateFolderInput,
  userId: string
): Promise<FolderServiceResult<FolderBasic>> {
  try {
    // Verify ownership
    const existing = await prisma.folders.findFirst({
      where: {
        id: folderId,
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return { success: false, error: 'Folder not found' };
    }

    const folder = await withRetry(() =>
      prisma.folders.update({
        where: { id: folderId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.visibility !== undefined && { visibility: data.visibility }),
          ...(data.key !== undefined && { key: data.key }),
          ...(data.position !== undefined && { position: data.position }),
          updated_at: new Date(),
        },
      })
    );

    return {
      success: true,
      data: {
        id: folder.id,
        name: folder.name,
        key: folder.key,
        description: folder.description,
        visibility: folder.visibility,
        position: folder.position,
      },
    };
  } catch (error) {
    console.error('[FolderService] updateFolder error:', error);
    return { success: false, error: 'Failed to update folder' };
  }
}

/**
 * Soft delete a folder (move to trash)
 * Also removes all folder_items entries for this folder
 */
export async function deleteFolder(
  folderId: string,
  userId: string
): Promise<FolderServiceResult<void>> {
  try {
    // Verify ownership
    const existing = await prisma.folders.findFirst({
      where: {
        id: folderId,
        user_id: userId,
        deleted_at: null,
      },
    });

    if (!existing) {
      return { success: false, error: 'Folder not found' };
    }

    await withRetry(() =>
      prisma.$transaction([
        // Remove all folder_items entries
        prisma.folder_items.deleteMany({
          where: { folder_id: folderId },
        }),
        // Soft delete the folder
        prisma.folders.update({
          where: { id: folderId },
          data: {
            deleted_at: new Date(),
            updated_at: new Date(),
          },
        }),
      ])
    );

    return { success: true };
  } catch (error) {
    console.error('[FolderService] deleteFolder error:', error);
    return { success: false, error: 'Failed to delete folder' };
  }
}

/**
 * Add an item to a folder
 */
export async function addItemToFolder(
  folderId: string,
  targetType: FolderTargetType,
  targetId: string,
  userId: string,
  position?: number
): Promise<FolderServiceResult<void>> {
  try {
    // Verify folder ownership
    const folder = await prisma.folders.findFirst({
      where: {
        id: folderId,
        user_id: userId,
        is_active: true,
        deleted_at: null,
      },
    });

    if (!folder) {
      return { success: false, error: 'Folder not found' };
    }

    // Verify item ownership
    if (targetType === 'WORKFLOW') {
      const workflow = await prisma.workflow.findFirst({
        where: { id: targetId, userId, deletedAt: null },
      });
      if (!workflow) {
        return { success: false, error: 'Workflow not found' };
      }
    } else if (targetType === 'SKILL') {
      const skill = await prisma.skill.findFirst({
        where: { id: targetId, userId, deletedAt: null },
      });
      if (!skill) {
        return { success: false, error: 'Skill not found' };
      }
    } else {
      const prompt = await prisma.miniPrompt.findFirst({
        where: { id: targetId, userId, deletedAt: null },
      });
      if (!prompt) {
        return { success: false, error: 'Prompt not found' };
      }
    }

    // Check if already in folder
    const existing = await prisma.folder_items.findFirst({
      where: {
        folder_id: folderId,
        target_type: targetType,
        target_id: targetId,
      },
    });

    if (existing) {
      return { success: true }; // Already in folder, no-op
    }

    // Get max position if not provided
    let itemPosition = position;
    if (itemPosition === undefined) {
      const maxPosition = await prisma.folder_items.aggregate({
        where: { folder_id: folderId },
        _max: { position: true },
      });
      itemPosition = (maxPosition._max.position ?? -1) + 1;
    }

    await withRetry(() =>
      prisma.folder_items.create({
        data: {
          id: randomUUID(),
          folder_id: folderId,
          target_type: targetType,
          target_id: targetId,
          position: itemPosition!,
        },
      })
    );

    return { success: true };
  } catch (error) {
    console.error('[FolderService] addItemToFolder error:', error);
    return { success: false, error: 'Failed to add item to folder' };
  }
}

/**
 * Remove an item from a folder
 */
export async function removeItemFromFolder(
  folderId: string,
  targetType: FolderTargetType,
  targetId: string,
  userId: string
): Promise<FolderServiceResult<void>> {
  try {
    // Verify folder ownership
    const folder = await prisma.folders.findFirst({
      where: {
        id: folderId,
        user_id: userId,
      },
    });

    if (!folder) {
      return { success: false, error: 'Folder not found' };
    }

    await withRetry(() =>
      prisma.folder_items.deleteMany({
        where: {
          folder_id: folderId,
          target_type: targetType,
          target_id: targetId,
        },
      })
    );

    return { success: true };
  } catch (error) {
    console.error('[FolderService] removeItemFromFolder error:', error);
    return { success: false, error: 'Failed to remove item from folder' };
  }
}

/**
 * Move an item to trash (soft delete)
 * Also removes all folder_items entries for this item
 */
export async function moveItemToTrash(
  targetType: FolderTargetType,
  targetId: string,
  userId: string
): Promise<FolderServiceResult<void>> {
  try {
    if (targetType === 'WORKFLOW') {
      const workflow = await prisma.workflow.findFirst({
        where: { id: targetId, userId },
      });
      if (!workflow) {
        return { success: false, error: 'Workflow not found' };
      }

      await withRetry(() =>
        prisma.$transaction([
          prisma.folder_items.deleteMany({
            where: { target_type: 'WORKFLOW', target_id: targetId },
          }),
          prisma.workflow.update({
            where: { id: targetId },
            data: { deletedAt: new Date() },
          }),
        ])
      );
    } else if (targetType === 'SKILL') {
      const skill = await prisma.skill.findFirst({
        where: { id: targetId, userId },
      });
      if (!skill) {
        return { success: false, error: 'Skill not found' };
      }

      await withRetry(() =>
        prisma.$transaction([
          prisma.folder_items.deleteMany({
            where: { target_type: 'SKILL', target_id: targetId },
          }),
          prisma.skill.update({
            where: { id: targetId },
            data: { deletedAt: new Date() },
          }),
        ])
      );
    } else {
      const prompt = await prisma.miniPrompt.findFirst({
        where: { id: targetId, userId },
      });
      if (!prompt) {
        return { success: false, error: 'Prompt not found' };
      }

      await withRetry(() =>
        prisma.$transaction([
          prisma.folder_items.deleteMany({
            where: { target_type: 'MINI_PROMPT', target_id: targetId },
          }),
          prisma.miniPrompt.update({
            where: { id: targetId },
            data: { deletedAt: new Date() },
          }),
        ])
      );
    }

    return { success: true };
  } catch (error) {
    console.error('[FolderService] moveItemToTrash error:', error);
    return { success: false, error: 'Failed to move item to trash' };
  }
}

/**
 * Restore an item from trash
 * Item goes to Uncategorized (no folder assignment)
 */
export async function restoreFromTrash(
  targetType: FolderTargetType,
  targetId: string,
  userId: string
): Promise<FolderServiceResult<void>> {
  try {
    if (targetType === 'WORKFLOW') {
      const workflow = await prisma.workflow.findFirst({
        where: { id: targetId, userId, deletedAt: { not: null } },
      });
      if (!workflow) {
        return { success: false, error: 'Workflow not found in trash' };
      }

      await withRetry(() =>
        prisma.workflow.update({
          where: { id: targetId },
          data: { deletedAt: null },
        })
      );
    } else if (targetType === 'SKILL') {
      const skill = await prisma.skill.findFirst({
        where: { id: targetId, userId, deletedAt: { not: null } },
      });
      if (!skill) {
        return { success: false, error: 'Skill not found in trash' };
      }

      await withRetry(() =>
        prisma.skill.update({
          where: { id: targetId },
          data: { deletedAt: null },
        })
      );
    } else {
      const prompt = await prisma.miniPrompt.findFirst({
        where: { id: targetId, userId, deletedAt: { not: null } },
      });
      if (!prompt) {
        return { success: false, error: 'Prompt not found in trash' };
      }

      await withRetry(() =>
        prisma.miniPrompt.update({
          where: { id: targetId },
          data: { deletedAt: null },
        })
      );
    }

    return { success: true };
  } catch (error) {
    console.error('[FolderService] restoreFromTrash error:', error);
    return { success: false, error: 'Failed to restore item from trash' };
  }
}

/**
 * Permanently delete an item
 */
export async function permanentDelete(
  targetType: FolderTargetType,
  targetId: string,
  userId: string
): Promise<FolderServiceResult<void>> {
  try {
    if (targetType === 'WORKFLOW') {
      const workflow = await prisma.workflow.findFirst({
        where: { id: targetId, userId, deletedAt: { not: null } },
      });
      if (!workflow) {
        return { success: false, error: 'Workflow not found in trash' };
      }

      await withRetry(() => prisma.workflow.delete({ where: { id: targetId } }));
    } else if (targetType === 'SKILL') {
      const skill = await prisma.skill.findFirst({
        where: { id: targetId, userId, deletedAt: { not: null } },
        include: { attachments: { select: { blobUrl: true } } },
      });
      if (!skill) {
        return { success: false, error: 'Skill not found in trash' };
      }

      // Delete blob attachments asynchronously
      if (skill.attachments.length > 0) {
        const { del } = await import('@vercel/blob');
        for (const attachment of skill.attachments) {
          try {
            await del(attachment.blobUrl);
          } catch (blobError) {
            console.error('[FolderService] Failed to delete blob:', blobError);
          }
        }
      }

      await withRetry(() => prisma.skill.delete({ where: { id: targetId } }));
    } else {
      const prompt = await prisma.miniPrompt.findFirst({
        where: { id: targetId, userId, deletedAt: { not: null } },
      });
      if (!prompt) {
        return { success: false, error: 'Prompt not found in trash' };
      }

      await withRetry(() => prisma.miniPrompt.delete({ where: { id: targetId } }));
    }

    return { success: true };
  } catch (error) {
    console.error('[FolderService] permanentDelete error:', error);
    return { success: false, error: 'Failed to permanently delete item' };
  }
}

/**
 * Move item between folders
 * Removes from source folder, adds to target folder
 */
export async function moveItemBetweenFolders(
  sourceFolderId: string,
  targetFolderId: string,
  targetType: FolderTargetType,
  targetId: string,
  userId: string
): Promise<FolderServiceResult<void>> {
  try {
    // Remove from source
    const removeResult = await removeItemFromFolder(sourceFolderId, targetType, targetId, userId);
    if (!removeResult.success) {
      return removeResult;
    }

    // Add to target
    const addResult = await addItemToFolder(targetFolderId, targetType, targetId, userId);
    if (!addResult.success) {
      // Try to restore to source folder on failure
      await addItemToFolder(sourceFolderId, targetType, targetId, userId);
      return addResult;
    }

    return { success: true };
  } catch (error) {
    console.error('[FolderService] moveItemBetweenFolders error:', error);
    return { success: false, error: 'Failed to move item between folders' };
  }
}

/**
 * Bulk add items to a folder
 */
export async function bulkAddToFolder(
  folderId: string,
  items: Array<{ targetType: FolderTargetType; targetId: string }>,
  userId: string
): Promise<FolderServiceResult<void>> {
  try {
    for (const item of items) {
      const result = await addItemToFolder(folderId, item.targetType, item.targetId, userId);
      if (!result.success) {
        console.warn(`[FolderService] Failed to add item ${item.targetId} to folder:`, result.error);
      }
    }
    return { success: true };
  } catch (error) {
    console.error('[FolderService] bulkAddToFolder error:', error);
    return { success: false, error: 'Failed to bulk add items to folder' };
  }
}

/**
 * Bulk move items to trash
 */
export async function bulkMoveToTrash(
  items: Array<{ targetType: FolderTargetType; targetId: string }>,
  userId: string
): Promise<FolderServiceResult<void>> {
  try {
    for (const item of items) {
      const result = await moveItemToTrash(item.targetType, item.targetId, userId);
      if (!result.success) {
        console.warn(`[FolderService] Failed to trash item ${item.targetId}:`, result.error);
      }
    }
    return { success: true };
  } catch (error) {
    console.error('[FolderService] bulkMoveToTrash error:', error);
    return { success: false, error: 'Failed to bulk move items to trash' };
  }
}

/**
 * Get folder by key (for MCP access)
 */
export async function getFolderByKey(
  key: string,
  userId?: string
): Promise<FolderServiceResult<FolderBasic>> {
  try {
    const folder = await withRetry(() =>
      prisma.folders.findUnique({
        where: { key },
      })
    );

    if (!folder) {
      return { success: false, error: 'Folder not found' };
    }

    // Check visibility
    if (folder.visibility === 'PRIVATE' && folder.user_id !== userId) {
      return { success: false, error: 'Access denied' };
    }

    if (folder.deleted_at) {
      return { success: false, error: 'Folder not found' };
    }

    return {
      success: true,
      data: {
        id: folder.id,
        name: folder.name,
        key: folder.key,
        description: folder.description,
        visibility: folder.visibility,
        position: folder.position,
      },
    };
  } catch (error) {
    console.error('[FolderService] getFolderByKey error:', error);
    return { success: false, error: 'Failed to fetch folder' };
  }
}
