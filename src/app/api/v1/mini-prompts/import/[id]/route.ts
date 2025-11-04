import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { importMiniPrompt } from "@/features/public-discovery/lib/discovery-service";

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
