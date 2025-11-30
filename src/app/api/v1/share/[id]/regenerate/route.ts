import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { regenerateShareToken } from "@/features/sharing/lib/share-service";

export const runtime = "nodejs";

/**
 * PATCH /api/v1/share/:id/regenerate
 *
 * Regenerate share token for an existing share link
 * Requires authentication and ownership
 * Old token becomes invalid, new token is returned
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
    const result = await regenerateShareToken(session.user.id, id);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        shareToken: result.shareToken,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error regenerating share token:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to regenerate share token",
      },
      { status: 500 }
    );
  }
}
