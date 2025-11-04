import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getUserSharedItems } from "@/features/sharing/lib/share-service";

export const runtime = "nodejs";

/**
 * GET /api/v1/share/my-items
 *
 * Get current user's shared items with enriched target data
 * Requires authentication
 *
 * Returns array of shared links with:
 * - Share link metadata (id, shareToken, isActive, expiresAt, viewCount, etc.)
 * - Target name and visibility
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sharedItems = await getUserSharedItems(session.user.id);

    return NextResponse.json(
      {
        success: true,
        items: sharedItems,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching shared items:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch shared items",
      },
      { status: 500 }
    );
  }
}
