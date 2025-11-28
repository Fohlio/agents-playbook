import { prisma } from "@/lib/db/client";
import { TargetType } from "@prisma/client";
import crypto from "crypto";

/**
 * Generate a cryptographically secure share token
 * Returns a base64url-encoded string (~11 characters for 8 bytes)
 * Base64url is URL-safe (uses - and _ instead of + and /, no padding)
 */
export function generateShareToken(): string {
  const bytes = crypto.randomBytes(8);
  return bytes.toString("base64url");
}

/**
 * Create a share link for a workflow or mini-prompt
 * - Verifies user owns the target
 * - Returns existing active link if found
 * - Creates new link with optional expiration
 */
export async function createShareLink(
  userId: string,
  targetType: TargetType,
  targetId: string,
  expiresAt?: Date
): Promise<{ success: boolean; shareToken?: string; message: string }> {
  try {
    // Verify ownership
    const isOwner = await verifyOwnership(userId, targetType, targetId);
    if (!isOwner) {
      return {
        success: false,
        message: "You do not own this item",
      };
    }

    // Check for existing active share link
    const existingLink = await prisma.sharedLink.findFirst({
      where: {
        userId,
        targetType,
        targetId,
        isActive: true,
      },
    });

    if (existingLink) {
      return {
        success: true,
        shareToken: existingLink.shareToken,
        message: "Share link already exists",
      };
    }

    // Create new share link
    const shareToken = generateShareToken();
    const newLink = await prisma.sharedLink.create({
      data: {
        userId,
        targetType,
        targetId,
        shareToken,
        expiresAt,
      },
    });

    return {
      success: true,
      shareToken: newLink.shareToken,
      message: "Share link created successfully",
    };
  } catch (error) {
    console.error("Error creating share link:", error);
    return {
      success: false,
      message: "Failed to create share link",
    };
  }
}

/**
 * Toggle share link active status (enable/disable)
 */
export async function toggleShareLink(
  userId: string,
  shareLinkId: string,
  isActive: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify ownership
    const shareLink = await prisma.sharedLink.findUnique({
      where: { id: shareLinkId },
    });

    if (!shareLink) {
      return {
        success: false,
        message: "Share link not found",
      };
    }

    if (shareLink.userId !== userId) {
      return {
        success: false,
        message: "You do not own this share link",
      };
    }

    // Update active status
    await prisma.sharedLink.update({
      where: { id: shareLinkId },
      data: { isActive },
    });

    return {
      success: true,
      message: `Share link ${isActive ? "enabled" : "disabled"} successfully`,
    };
  } catch (error) {
    console.error("Error toggling share link:", error);
    return {
      success: false,
      message: "Failed to toggle share link",
    };
  }
}

/**
 * Regenerate share token for an existing share link
 */
export async function regenerateShareToken(
  userId: string,
  shareLinkId: string
): Promise<{ success: boolean; shareToken?: string; message: string }> {
  try {
    // Verify ownership
    const shareLink = await prisma.sharedLink.findUnique({
      where: { id: shareLinkId },
    });

    if (!shareLink) {
      return {
        success: false,
        message: "Share link not found",
      };
    }

    if (shareLink.userId !== userId) {
      return {
        success: false,
        message: "You do not own this share link",
      };
    }

    // Generate new token and update
    const newToken = generateShareToken();
    const updated = await prisma.sharedLink.update({
      where: { id: shareLinkId },
      data: { shareToken: newToken },
    });

    return {
      success: true,
      shareToken: updated.shareToken,
      message: "Share token regenerated successfully",
    };
  } catch (error) {
    console.error("Error regenerating share token:", error);
    return {
      success: false,
      message: "Failed to regenerate share token",
    };
  }
}

/**
 * Update share link expiration date
 */
export async function updateShareLinkExpiration(
  userId: string,
  shareLinkId: string,
  expiresAt: Date | null
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify ownership
    const shareLink = await prisma.sharedLink.findUnique({
      where: { id: shareLinkId },
    });

    if (!shareLink) {
      return {
        success: false,
        message: "Share link not found",
      };
    }

    if (shareLink.userId !== userId) {
      return {
        success: false,
        message: "You do not own this share link",
      };
    }

    // Update expiration
    await prisma.sharedLink.update({
      where: { id: shareLinkId },
      data: { expiresAt },
    });

    return {
      success: true,
      message: "Expiration updated successfully",
    };
  } catch (error) {
    console.error("Error updating expiration:", error);
    return {
      success: false,
      message: "Failed to update expiration",
    };
  }
}

/**
 * Get user's shared items with enriched target data
 */
export async function getUserSharedItems(userId: string) {
  try {
    const sharedLinks = await prisma.sharedLink.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Enrich with target details
    const enriched = await Promise.all(
      sharedLinks.map(async (link) => {
        let targetName = "";
        let targetVisibility: "PUBLIC" | "PRIVATE" = "PRIVATE";

        if (link.targetType === "WORKFLOW") {
          const workflow = await prisma.workflow.findUnique({
            where: { id: link.targetId },
            select: { name: true, visibility: true },
          });
          targetName = workflow?.name || "Unknown Workflow";
          targetVisibility = workflow?.visibility || "PRIVATE";
        } else {
          const miniPrompt = await prisma.miniPrompt.findUnique({
            where: { id: link.targetId },
            select: { name: true, visibility: true },
          });
          targetName = miniPrompt?.name || "Unknown Mini-Prompt";
          targetVisibility = miniPrompt?.visibility || "PRIVATE";
        }

        return {
          ...link,
          targetName,
          targetVisibility,
        };
      })
    );

    return enriched;
  } catch (error) {
    console.error("Error fetching user shared items:", error);
    return [];
  }
}

/**
 * Get shared content by share token
 * - Validates active status and expiration
 * - Increments view count
 * - Returns content with metadata
 */
export async function getSharedContent(
  shareToken: string,
  incrementView: boolean = true
) {
  try {
    const shareLink = await prisma.sharedLink.findUnique({
      where: { shareToken },
    });

    if (!shareLink) {
      return { success: false, message: "Share link not found" };
    }

    // Check if active
    if (!shareLink.isActive) {
      return { success: false, message: "Share link is disabled" };
    }

    // Check expiration
    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      return { success: false, message: "Share link has expired" };
    }

    // Increment view count (non-blocking)
    if (incrementView) {
      prisma.sharedLink
        .update({
          where: { id: shareLink.id },
          data: { viewCount: { increment: 1 } },
        })
        .catch((error) => console.error("Error incrementing view count:", error));
    }

    // Fetch content based on target type
    if (shareLink.targetType === "WORKFLOW") {
      const workflow = await prisma.workflow.findUnique({
        where: { id: shareLink.targetId },
        include: {
          user: {
            select: { id: true, username: true },
          },
          stages: {
            include: {
              miniPrompts: {
                include: {
                  miniPrompt: true,
                },
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      if (!workflow) {
        return { success: false, message: "Workflow not found" };
      }

      return {
        success: true,
        targetType: "WORKFLOW" as const,
        content: workflow,
        shareLink,
      };
    } else {
      const miniPrompt = await prisma.miniPrompt.findUnique({
        where: { id: shareLink.targetId },
        include: {
          user: {
            select: { id: true, username: true },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      if (!miniPrompt) {
        return { success: false, message: "Mini-prompt not found" };
      }

      return {
        success: true,
        targetType: "MINI_PROMPT" as const,
        content: miniPrompt,
        shareLink,
      };
    }
  } catch (error) {
    console.error("Error fetching shared content:", error);
    return { success: false, message: "Failed to fetch shared content" };
  }
}

/**
 * Verify user owns a workflow or mini-prompt
 */
async function verifyOwnership(
  userId: string,
  targetType: TargetType,
  targetId: string
): Promise<boolean> {
  if (targetType === "WORKFLOW") {
    const workflow = await prisma.workflow.findFirst({
      where: { id: targetId, userId },
    });
    return !!workflow;
  } else {
    const miniPrompt = await prisma.miniPrompt.findFirst({
      where: { id: targetId, userId },
    });
    return !!miniPrompt;
  }
}
