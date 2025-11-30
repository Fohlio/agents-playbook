import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { upsertRating, getRatingStats } from "@/features/ratings/lib/rating-service";
import { TargetType } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { targetType, targetId, rating } = body;

    if (!targetType || !targetId || typeof rating !== "number") {
      return NextResponse.json(
        { error: "Missing required fields: targetType, targetId, rating" },
        { status: 400 }
      );
    }

    if (!["WORKFLOW", "MINI_PROMPT"].includes(targetType)) {
      return NextResponse.json(
        { error: "Invalid targetType. Must be WORKFLOW or MINI_PROMPT" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const ratingRecord = await upsertRating({
      userId: session.user.id,
      targetType: targetType as TargetType,
      targetId,
      rating,
    });

    const stats = await getRatingStats(targetType as TargetType, targetId);

    return NextResponse.json(
      { rating: ratingRecord, stats },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating rating:", error);

    if (error instanceof Error && error.message === "You cannot rate your own content") {
      return NextResponse.json(
        { error: "You cannot rate your own content" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create rating" },
      { status: 500 }
    );
  }
}
