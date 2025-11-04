import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { toggleShareLink } from "@/features/sharing/lib/share-service";

export const runtime = "nodejs";

/**
 * PATCH /api/v1/share/:id/toggle
 *
 * Toggle share link active status (enable/disable)
 * Requires authentication and ownership
 *
 * Body:
 * - isActive: boolean
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { isActive } = body;

    // Validate isActive field
    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    const result = await toggleShareLink(session.user.id, id, isActive);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling share link:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to toggle share link",
      },
      { status: 500 }
    );
  }
}
