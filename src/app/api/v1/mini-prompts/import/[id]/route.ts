import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { importMiniPrompt } from "@/views/discover/lib/discovery-service";
import { prisma } from "@/server/db/client";

export const runtime = "nodejs";

/**
 * POST /api/v1/mini-prompts/import/:id
 *
 * Import public mini-prompt to user's library
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
    const result = await importMiniPrompt(id, session.user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error importing mini-prompt:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to import mini-prompt",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/mini-prompts/import/:id
 *
 * Undo mini-prompt import (remove from library)
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

    const { id: miniPromptId } = await params;
    const userId = session.user.id;

    // Check if reference exists
    const reference = await prisma.miniPromptReference.findUnique({
      where: {
        userId_miniPromptId: { userId, miniPromptId },
      },
    });

    if (!reference) {
      return NextResponse.json(
        { error: "Mini-prompt not in your library" },
        { status: 404 }
      );
    }

    // Remove reference
    await prisma.miniPromptReference.delete({
      where: {
        userId_miniPromptId: { userId, miniPromptId },
      },
    });

    // Decrement usage stats
    await prisma.usageStats.updateMany({
      where: {
        targetType: "MINI_PROMPT",
        targetId: miniPromptId,
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
    console.error("Error removing mini-prompt from library:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to remove mini-prompt from library",
      },
      { status: 500 }
    );
  }
}
