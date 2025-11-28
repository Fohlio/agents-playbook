import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { importWorkflow } from "@/features/public-discovery/lib/discovery-service";
import { prisma } from "@/lib/db/client";

export const runtime = "nodejs";

/**
 * POST /api/v1/workflows/import/:id
 *
 * Import public workflow to user's library
 * Requires authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await importWorkflow(id, session.user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error importing workflow:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to import workflow",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/workflows/import/:id
 *
 * Undo workflow import (remove from library)
 * Decrements usage stats
 * Requires authentication
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: workflowId } = await params;
    const userId = session.user.id;

    // Check if reference exists
    const reference = await prisma.workflowReference.findUnique({
      where: {
        userId_workflowId: { userId, workflowId },
      },
    });

    if (!reference) {
      return NextResponse.json(
        { error: "Workflow not in your library" },
        { status: 404 }
      );
    }

    // Remove reference
    await prisma.workflowReference.delete({
      where: {
        userId_workflowId: { userId, workflowId },
      },
    });

    // Decrement usage stats
    await prisma.usageStats.updateMany({
      where: {
        targetType: "WORKFLOW",
        targetId: workflowId,
        usageCount: { gt: 0 }, // Only decrement if > 0
      },
      data: {
        usageCount: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Removed from library",
    });
  } catch (error) {
    console.error("Error removing workflow from library:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove workflow from library",
      },
      { status: 500 }
    );
  }
}
