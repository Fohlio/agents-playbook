import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/client";

/**
 * DELETE /api/v1/share/[id]/delete
 *
 * Permanently delete a share link
 * Requires authentication and ownership
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

    const { id: shareId } = await params;

    // Verify ownership
    const shareLink = await prisma.sharedLink.findUnique({
      where: { id: shareId },
    });

    if (!shareLink) {
      return NextResponse.json(
        { error: "Share link not found" },
        { status: 404 }
      );
    }

    if (shareLink.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this share link" },
        { status: 403 }
      );
    }

    // Delete the share link
    await prisma.sharedLink.delete({
      where: { id: shareId },
    });

    return NextResponse.json({
      success: true,
      message: "Share link deleted permanently",
    });
  } catch (error) {
    console.error("Error deleting share link:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete share link",
      },
      { status: 500 }
    );
  }
}

