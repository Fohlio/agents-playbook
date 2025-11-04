import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getPublicMiniPrompts } from "@/features/public-discovery/lib/discovery-service";
import type { MiniPromptSortOption } from "@/features/public-discovery/types";

export const runtime = "nodejs";

/**
 * GET /api/v1/public/mini-prompts
 *
 * Get public mini-prompts with pagination, filtering, search
 * No authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || undefined;
    const sort = searchParams.get("sort") || "recent";
    const filtersParam = searchParams.get("filters");
    const filters = filtersParam ? JSON.parse(filtersParam) : undefined;

    // Get user session (optional)
    const session = await auth();
    const userId = session?.user?.id;

    const result = await getPublicMiniPrompts(
      { page, limit, search, sort: sort as MiniPromptSortOption, filters },
      userId
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching public mini-prompts:", error);
    return NextResponse.json(
      { error: "Failed to fetch mini-prompts" },
      { status: 500 }
    );
  }
}
