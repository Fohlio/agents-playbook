import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { updateShareLinkExpiration } from "@/features/sharing/lib/share-service";

export const runtime = "nodejs";

/**
 * PATCH /api/v1/share/:id/expiration
 *
 * Update share link expiration date
 * Requires authentication and ownership
 *
 * Body:
 * - expiresAt: string | null (ISO date string, or null for never expires)
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
    const { expiresAt } = body;

    // Parse expiration date
    let expirationDate: Date | null = null;
    if (expiresAt !== null && expiresAt !== undefined) {
      expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid expiresAt date format" },
          { status: 400 }
        );
      }
    }

    const result = await updateShareLinkExpiration(
      session.user.id,
      id,
      expirationDate
    );

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
    console.error("Error updating expiration:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update expiration",
      },
      { status: 500 }
    );
  }
}
