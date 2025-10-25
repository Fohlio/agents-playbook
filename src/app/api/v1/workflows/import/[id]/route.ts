import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { importWorkflow } from "@/features/public-discovery/lib/discovery-service";

export const runtime = "nodejs";

/**
 * POST /api/v1/workflows/import/:id
 *
 * Import public workflow to user's library
 * Requires authentication
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await importWorkflow(params.id, session.user.id);

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
