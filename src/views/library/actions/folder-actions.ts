"use server";

import { auth } from "@/server/auth/auth";
import { revalidatePath } from "next/cache";
import * as folderService from "@/server/folders/folder-service";
import { z } from "zod";
import { FolderTargetType } from "@/server/folders/types";

/**
 * Folder Server Actions
 *
 * Server actions for folder operations in the Library.
 * All actions require authentication and validate input with Zod.
 */

// Input validation schemas
const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(100, "Folder name too long"),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PRIVATE"),
});

const renameFolderSchema = z.object({
  folderId: z.string().uuid("Invalid folder ID"),
  name: z.string().min(1, "Folder name is required").max(100, "Folder name too long"),
});

const folderItemSchema = z.object({
  type: z.enum(["WORKFLOW", "MINI_PROMPT", "SKILL"]),
  id: z.string().uuid("Invalid item ID"),
});

const bulkFolderItemsSchema = z.object({
  folderId: z.string().uuid("Invalid folder ID"),
  items: z.array(folderItemSchema).min(1, "At least one item required"),
});

const moveToFolderSchema = z.object({
  targetFolderId: z.string().uuid("Invalid target folder ID"),
  items: z.array(folderItemSchema).min(1, "At least one item required"),
  sourceFolderId: z.string().uuid("Invalid source folder ID").optional(),
});

const bulkTrashSchema = z.object({
  items: z.array(
    z.object({
      type: z.enum(["WORKFLOW", "MINI_PROMPT", "SKILL", "FOLDER"]),
      id: z.string().uuid("Invalid item ID"),
    })
  ).min(1, "At least one item required"),
});

// Type for action results
type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Create a new folder
 */
export async function createFolderAction(
  name: string,
  visibility: "PUBLIC" | "PRIVATE" = "PRIVATE"
): Promise<ActionResult<{ id: string; name: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validation = createFolderSchema.safeParse({ name, visibility });
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    const result = await folderService.createFolder(
      { name: validation.data.name, visibility: validation.data.visibility },
      session.user.id
    );

    if (!result.success || !result.data) {
      return { success: false, error: result.error || "Failed to create folder" };
    }

    revalidatePath("/dashboard/library");

    return {
      success: true,
      data: { id: result.data.id, name: result.data.name },
    };
  } catch (error) {
    console.error("[createFolderAction] Error:", error);
    return { success: false, error: "Failed to create folder" };
  }
}

/**
 * Rename a folder
 */
export async function renameFolderAction(
  folderId: string,
  name: string
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validation = renameFolderSchema.safeParse({ folderId, name });
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    const result = await folderService.updateFolder(
      validation.data.folderId,
      { name: validation.data.name },
      session.user.id
    );

    if (!result.success) {
      return { success: false, error: result.error || "Failed to rename folder" };
    }

    revalidatePath("/dashboard/library");

    return { success: true };
  } catch (error) {
    console.error("[renameFolderAction] Error:", error);
    return { success: false, error: "Failed to rename folder" };
  }
}

/**
 * Delete a folder (move to trash)
 */
export async function deleteFolderAction(folderId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!z.string().uuid().safeParse(folderId).success) {
      return { success: false, error: "Invalid folder ID" };
    }

    const result = await folderService.deleteFolder(folderId, session.user.id);

    if (!result.success) {
      return { success: false, error: result.error || "Failed to delete folder" };
    }

    revalidatePath("/dashboard/library");

    return { success: true };
  } catch (error) {
    console.error("[deleteFolderAction] Error:", error);
    return { success: false, error: "Failed to delete folder" };
  }
}

/**
 * Add items to a folder (bulk)
 */
export async function addToFolderAction(
  folderId: string,
  items: { type: "WORKFLOW" | "MINI_PROMPT" | "SKILL"; id: string }[]
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validation = bulkFolderItemsSchema.safeParse({ folderId, items });
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    const mappedItems = validation.data.items.map((item) => ({
      targetType: item.type as FolderTargetType,
      targetId: item.id,
    }));

    const result = await folderService.bulkAddToFolder(
      validation.data.folderId,
      mappedItems,
      session.user.id
    );

    if (!result.success) {
      return { success: false, error: result.error || "Failed to add items to folder" };
    }

    revalidatePath("/dashboard/library");

    return { success: true };
  } catch (error) {
    console.error("[addToFolderAction] Error:", error);
    return { success: false, error: "Failed to add items to folder" };
  }
}

/**
 * Remove items from a folder (bulk)
 */
export async function removeFromFolderAction(
  folderId: string,
  items: { type: "WORKFLOW" | "MINI_PROMPT" | "SKILL"; id: string }[]
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validation = bulkFolderItemsSchema.safeParse({ folderId, items });
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    // Remove each item from the folder
    for (const item of validation.data.items) {
      await folderService.removeItemFromFolder(
        validation.data.folderId,
        item.type as FolderTargetType,
        item.id,
        session.user.id
      );
    }

    revalidatePath("/dashboard/library");

    return { success: true };
  } catch (error) {
    console.error("[removeFromFolderAction] Error:", error);
    return { success: false, error: "Failed to remove items from folder" };
  }
}

/**
 * Move items to a folder (removes from source, adds to target)
 */
export async function moveToFolderAction(
  targetFolderId: string,
  items: { type: "WORKFLOW" | "MINI_PROMPT" | "SKILL"; id: string }[],
  sourceFolderId?: string
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validation = moveToFolderSchema.safeParse({
      targetFolderId,
      items,
      sourceFolderId,
    });
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    // If source folder specified, remove from there first
    if (validation.data.sourceFolderId) {
      for (const item of validation.data.items) {
        await folderService.removeItemFromFolder(
          validation.data.sourceFolderId,
          item.type as FolderTargetType,
          item.id,
          session.user.id
        );
      }
    }

    // Add to target folder
    const mappedItems = validation.data.items.map((item) => ({
      targetType: item.type as FolderTargetType,
      targetId: item.id,
    }));

    const result = await folderService.bulkAddToFolder(
      validation.data.targetFolderId,
      mappedItems,
      session.user.id
    );

    if (!result.success) {
      return { success: false, error: result.error || "Failed to move items to folder" };
    }

    revalidatePath("/dashboard/library");

    return { success: true };
  } catch (error) {
    console.error("[moveToFolderAction] Error:", error);
    return { success: false, error: "Failed to move items to folder" };
  }
}

/**
 * Bulk move items to trash
 */
export async function bulkMoveToTrashAction(
  items: { type: "WORKFLOW" | "MINI_PROMPT" | "SKILL" | "FOLDER"; id: string }[]
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validation = bulkTrashSchema.safeParse({ items });
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    // Handle folders separately
    const folders = validation.data.items.filter((i) => i.type === "FOLDER");
    const workflowsPromptsAndSkills = validation.data.items.filter((i) => i.type !== "FOLDER");

    // Delete folders
    for (const folder of folders) {
      await folderService.deleteFolder(folder.id, session.user.id);
    }

    // Trash workflows, prompts and skills
    if (workflowsPromptsAndSkills.length > 0) {
      const mappedItems = workflowsPromptsAndSkills.map((item) => ({
        targetType: item.type as FolderTargetType,
        targetId: item.id,
      }));

      await folderService.bulkMoveToTrash(mappedItems, session.user.id);
    }

    revalidatePath("/dashboard/library");

    return { success: true };
  } catch (error) {
    console.error("[bulkMoveToTrashAction] Error:", error);
    return { success: false, error: "Failed to move items to trash" };
  }
}

/**
 * Get user's folders
 */
export async function getUserFoldersAction(): Promise<
  ActionResult<{ id: string; name: string; itemCount: number }[]>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await folderService.getUserFolders(session.user.id);

    if (!result.success || !result.data) {
      return { success: false, error: result.error || "Failed to fetch folders" };
    }

    return {
      success: true,
      data: result.data.map((f) => ({
        id: f.id,
        name: f.name,
        itemCount: f.itemCount,
      })),
    };
  } catch (error) {
    console.error("[getUserFoldersAction] Error:", error);
    return { success: false, error: "Failed to fetch folders" };
  }
}
