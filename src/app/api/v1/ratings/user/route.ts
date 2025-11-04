import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getUserRating, canUserRate } from "@/features/ratings/lib/rating-service";
import { TargetType } from "@prisma/client";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get("targetType");
    const targetId = searchParams.get("targetId");

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: "Missing required query params: targetType, targetId" },
        { status: 400 }
      );
    }

    if (!["WORKFLOW", "MINI_PROMPT"].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid targetType. Must be WORKFLOW or MINI_PROMPT" },
        { status: 400 }
      );
    }

    const [rating, canRate] = await Promise.all([
      getUserRating(session.user.id, targetType as TargetType, targetId),
      canUserRate(session.user.id, targetType as TargetType, targetId),
    ]);

    return NextResponse.json(
      { rating, canRate },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user rating:", error);
    return NextResponse.json(
      { error: "Failed to fetch user rating" },
      { status: 500 }
    );
  }
}
