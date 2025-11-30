import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { createShareLink } from "@/features/sharing/lib/share-service";
import { TargetType } from "@prisma/client";

export const runtime = "nodejs";

/**
 * POST /api/v1/share/create
 *
 * Create a share link for a workflow or mini-prompt
 * Requires authentication
 *
 * Body:
 * - targetType: "WORKFLOW" | "MINI_PROMPT"
 * - targetId: string
 * - expiresAt?: string (ISO date)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { targetType, targetId, expiresAt } = body;

    // Validate required fields
    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: "targetType and targetId are required" },
        { status: 400 }
      );
    }

    // Validate targetType
    if (targetType !== "WORKFLOW" && targetType !== "MINI_PROMPT") {
      return NextResponse.json(
        { error: "Invalid targetType. Must be WORKFLOW or MINI_PROMPT" },
        { status: 400 }
      );
    }

    // Parse expiration date if provided
    let expirationDate: Date | undefined;
    if (expiresAt) {
      expirationDate = new Date(expiresAt);
      if (isNaN(expirationDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid expiresAt date format" },
          { status: 400 }
        );
      }
    }

    const result = await createShareLink(
      session.user.id,
      targetType as TargetType,
      targetId,
      expirationDate
    );

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
    console.error("Error creating share link:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create share link",
      },
      { status: 500 }
    );
  }
}
