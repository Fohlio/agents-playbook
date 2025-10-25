import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getPublicWorkflows } from "@/features/public-discovery/lib/discovery-service";

export const runtime = "nodejs";

/**
 * GET /api/v1/public/workflows
 *
 * Get public workflows with pagination, filtering, search
 * No authentication required
 *
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 20)
 * - search: string
 * - sort: "recent" | "popular" | "highest_rated" | "most_used"
 * - filters: JSON string with WorkflowFilters
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

    const result = await getPublicWorkflows(
      { page, limit, search, sort: sort as any, filters },
      userId
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching public workflows:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflows" },
      { status: 500 }
    );
  }
}
