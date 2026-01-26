import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/client";
import { del } from "@vercel/blob";

/**
 * Trash Cleanup Cron Job
 *
 * Automatically deletes items that have been in trash for more than 30 days.
 * Runs daily at 3am UTC via Vercel Cron.
 *
 * Configure in vercel.json:
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/cleanup-trash",
 *       "schedule": "0 3 * * *"
 *     }
 *   ]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to ensure this is a legitimate cron call
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.warn("[Trash Cleanup] CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn("[Trash Cleanup] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log("[Trash Cleanup] Starting cleanup for items deleted before:", thirtyDaysAgo.toISOString());

    // Delete old trashed folders
    const deletedFolders = await prisma.folders.deleteMany({
      where: {
        deleted_at: {
          lt: thirtyDaysAgo,
          not: null,
        },
      },
    });

    console.log(`[Trash Cleanup] Deleted ${deletedFolders.count} folders`);

    // Delete old trashed workflows
    // First, we need to handle cascading deletes for related data
    const oldWorkflows = await prisma.workflow.findMany({
      where: {
        deletedAt: {
          lt: thirtyDaysAgo,
          not: null,
        },
      },
      select: { id: true },
    });

    const workflowIds = oldWorkflows.map((w) => w.id);

    if (workflowIds.length > 0) {
      // Delete related workflow embeddings
      await prisma.workflowEmbedding.deleteMany({
        where: { workflowId: { in: workflowIds } },
      });

      // Delete folder_items references
      await prisma.folder_items.deleteMany({
        where: {
          target_type: "WORKFLOW",
          target_id: { in: workflowIds },
        },
      });
    }

    const deletedWorkflows = await prisma.workflow.deleteMany({
      where: {
        deletedAt: {
          lt: thirtyDaysAgo,
          not: null,
        },
      },
    });

    console.log(`[Trash Cleanup] Deleted ${deletedWorkflows.count} workflows`);

    // Delete old trashed mini-prompts
    const oldPrompts = await prisma.miniPrompt.findMany({
      where: {
        deletedAt: {
          lt: thirtyDaysAgo,
          not: null,
        },
      },
      select: { id: true },
    });

    const promptIds = oldPrompts.map((p) => p.id);

    if (promptIds.length > 0) {
      // Delete folder_items references
      await prisma.folder_items.deleteMany({
        where: {
          target_type: "MINI_PROMPT",
          target_id: { in: promptIds },
        },
      });
    }

    const deletedPrompts = await prisma.miniPrompt.deleteMany({
      where: {
        deletedAt: {
          lt: thirtyDaysAgo,
          not: null,
        },
      },
    });

    console.log(`[Trash Cleanup] Deleted ${deletedPrompts.count} prompts`);

    // Delete old trashed skills (with blob cleanup)
    const oldSkills = await prisma.skill.findMany({
      where: {
        deletedAt: {
          lt: thirtyDaysAgo,
          not: null,
        },
      },
      select: {
        id: true,
        attachments: {
          select: { blobUrl: true },
        },
      },
    });

    const skillIds = oldSkills.map((s) => s.id);

    if (skillIds.length > 0) {
      // Delete skill embeddings
      await prisma.skillEmbedding.deleteMany({
        where: { skillId: { in: skillIds } },
      });

      // Delete folder_items references
      await prisma.folder_items.deleteMany({
        where: {
          target_type: "SKILL",
          target_id: { in: skillIds },
        },
      });

      // Delete blob attachments (best-effort, log errors)
      for (const skill of oldSkills) {
        for (const attachment of skill.attachments) {
          try {
            await del(attachment.blobUrl);
          } catch (blobError) {
            console.error(`[Trash Cleanup] Failed to delete blob for skill ${skill.id}:`, blobError);
          }
        }
      }
    }

    const deletedSkills = await prisma.skill.deleteMany({
      where: {
        deletedAt: {
          lt: thirtyDaysAgo,
          not: null,
        },
      },
    });

    console.log(`[Trash Cleanup] Deleted ${deletedSkills.count} skills`);

    // Clean up orphaned folder_items (items pointing to non-existent folders)
    const orphanedItems = await prisma.$executeRaw`
      DELETE FROM folder_items
      WHERE folder_id NOT IN (SELECT id FROM folders)
    `;

    console.log(`[Trash Cleanup] Cleaned up ${orphanedItems} orphaned folder items`);

    const result = {
      success: true,
      deleted: {
        folders: deletedFolders.count,
        workflows: deletedWorkflows.count,
        prompts: deletedPrompts.count,
        skills: deletedSkills.count,
        orphanedItems: Number(orphanedItems),
      },
      timestamp: new Date().toISOString(),
    };

    console.log("[Trash Cleanup] Completed:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Trash Cleanup] Error:", error);
    return NextResponse.json(
      { error: "Cleanup failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Disable caching for cron endpoint
export const dynamic = "force-dynamic";
export const revalidate = 0;
