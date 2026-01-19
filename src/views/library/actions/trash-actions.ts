"use server";

import { auth } from "@/server/auth/auth";
import { revalidatePath } from "next/cache";
import * as folderService from "@/server/folders/folder-service";
import { z } from "zod";
import { FolderTargetType } from "@/server/folders/types";

/**
 * Trash Server Actions
 *
 * Server actions for trash operations in the Library.
 * All actions require authentication and validate input with Zod.
 */

// Input validation schemas
const itemTypeSchema = z.enum(["WORKFLOW", "MINI_PROMPT", "FOLDER"]);

const restoreItemSchema = z.object({
  type: itemTypeSchema,
  id: z.string().uuid("Invalid item ID"),
});

const bulkRestoreSchema = z.object({
  items: z.array(restoreItemSchema).min(1, "At least one item required"),
});

// Type for action results
type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Restore a single item from trash
 */
export async function restoreItemAction(
  type: "WORKFLOW" | "MINI_PROMPT" | "FOLDER",
  id: string
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validation = restoreItemSchema.safeParse({ type, id });
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    // Folders cannot be restored (they are permanently deleted when "trashed")
    if (validation.data.type === "FOLDER") {
      return { success: false, error: "Folders cannot be restored from trash" };
    }

    const result = await folderService.restoreFromTrash(
      validation.data.type as FolderTargetType,
      validation.data.id,
      session.user.id
    );

    if (!result.success) {
      return { success: false, error: result.error || "Failed to restore item" };
    }

    revalidatePath("/dashboard/library");

    return { success: true };
  } catch (error) {
    console.error("[restoreItemAction] Error:", error);
    return { success: false, error: "Failed to restore item" };
  }
}

/**
 * Permanently delete a single item
 */
export async function permanentDeleteAction(
  type: "WORKFLOW" | "MINI_PROMPT" | "FOLDER",
  id: string
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validation = restoreItemSchema.safeParse({ type, id });
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    // Folders use a different deletion mechanism (they're already soft-deleted)
    if (validation.data.type === "FOLDER") {
      // For now, folders are already permanently deleted when moved to trash
      return { success: true };
    }

    const result = await folderService.permanentDelete(
      validation.data.type as FolderTargetType,
      validation.data.id,
      session.user.id
    );

    if (!result.success) {
      return { success: false, error: result.error || "Failed to delete item" };
    }

    revalidatePath("/dashboard/library");

    return { success: true };
  } catch (error) {
    console.error("[permanentDeleteAction] Error:", error);
    return { success: false, error: "Failed to delete item" };
  }
}

/**
 * Empty trash (delete all trashed items permanently)
 */
export async function emptyTrashAction(): Promise<ActionResult<{ deleted: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Get all trashed items
    const trashedResult = await folderService.getTrashedItems(session.user.id);
    if (!trashedResult.success || !trashedResult.data) {
      return { success: false, error: "Failed to get trashed items" };
    }

    const items = trashedResult.data;
    let deletedCount = 0;

    // Delete each item
    for (const item of items) {
      const result = await folderService.permanentDelete(
        item.type,
        item.id,
        session.user.id
      );
      if (result.success) {
        deletedCount++;
      }
    }

    revalidatePath("/dashboard/library");

    return { success: true, data: { deleted: deletedCount } };
  } catch (error) {
    console.error("[emptyTrashAction] Error:", error);
    return { success: false, error: "Failed to empty trash" };
  }
}

/**
 * Bulk restore items from trash
 */
export async function bulkRestoreAction(
  items: { type: "WORKFLOW" | "MINI_PROMPT" | "FOLDER"; id: string }[]
): Promise<ActionResult<{ restored: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validation = bulkRestoreSchema.safeParse({ items });
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    let restoredCount = 0;

    for (const item of validation.data.items) {
      // Skip folders (can't be restored)
      if (item.type === "FOLDER") {
        continue;
      }

      const result = await folderService.restoreFromTrash(
        item.type as FolderTargetType,
        item.id,
        session.user.id
      );
      if (result.success) {
        restoredCount++;
      }
    }

    revalidatePath("/dashboard/library");

    return { success: true, data: { restored: restoredCount } };
  } catch (error) {
    console.error("[bulkRestoreAction] Error:", error);
    return { success: false, error: "Failed to restore items" };
  }
}

/**
 * Bulk permanent delete items
 */
export async function bulkPermanentDeleteAction(
  items: { type: "WORKFLOW" | "MINI_PROMPT" | "FOLDER"; id: string }[]
): Promise<ActionResult<{ deleted: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const validation = bulkRestoreSchema.safeParse({ items });
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    let deletedCount = 0;

    for (const item of validation.data.items) {
      // Skip folders (already permanently deleted)
      if (item.type === "FOLDER") {
        continue;
      }

      const result = await folderService.permanentDelete(
        item.type as FolderTargetType,
        item.id,
        session.user.id
      );
      if (result.success) {
        deletedCount++;
      }
    }

    revalidatePath("/dashboard/library");

    return { success: true, data: { deleted: deletedCount } };
  } catch (error) {
    console.error("[bulkPermanentDeleteAction] Error:", error);
    return { success: false, error: "Failed to delete items" };
  }
}

/**
 * Get trash item count
 */
export async function getTrashCountAction(): Promise<ActionResult<{ count: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await folderService.getTrashedItems(session.user.id);
    if (!result.success || !result.data) {
      return { success: false, error: result.error || "Failed to get trash count" };
    }

    return { success: true, data: { count: result.data.length } };
  } catch (error) {
    console.error("[getTrashCountAction] Error:", error);
    return { success: false, error: "Failed to get trash count" };
  }
}
