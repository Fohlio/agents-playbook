import { prisma } from "@/lib/db/client";
import { TargetType, Prisma } from "@prisma/client";

export interface CreateRatingParams {
  userId: string;
  targetType: TargetType;
  targetId: string;
  rating: number;
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
}

export async function upsertRating(params: CreateRatingParams) {
  const { userId, targetType, targetId, rating } = params;

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const canRate = await canUserRate(userId, targetType, targetId);
  if (!canRate) {
    throw new Error("You cannot rate your own content");
  }

  return prisma.rating.upsert({
    where: {
      userId_targetType_targetId: {
        userId,
        targetType,
        targetId,
      },
    },
    create: {
      userId,
      targetType,
      targetId,
      rating,
    },
    update: {
      rating,
    },
  });
}

export async function getRatingStats(
  targetType: TargetType,
  targetId: string
): Promise<RatingStats> {
  const result = await prisma.rating.aggregate({
    where: {
      targetType,
      targetId,
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    averageRating: result._avg.rating || 0,
    totalRatings: result._count.id,
  };
}

export async function getRatingStatsForMultiple(
  targetType: TargetType,
  targetIds: string[]
): Promise<Record<string, RatingStats>> {
  if (targetIds.length === 0) {
    return {};
  }

  const ratings = await prisma.rating.groupBy({
    by: ["targetId"],
    where: {
      targetType,
      targetId: {
        in: targetIds,
      },
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  const statsMap: Record<string, RatingStats> = {};
  for (const rating of ratings) {
    statsMap[rating.targetId] = {
      averageRating: rating._avg.rating || 0,
      totalRatings: rating._count.id,
    };
  }

  return statsMap;
}

export async function getUserRating(
  userId: string,
  targetType: TargetType,
  targetId: string
) {
  return prisma.rating.findUnique({
    where: {
      userId_targetType_targetId: {
        userId,
        targetType,
        targetId,
      },
    },
  });
}

export async function canUserRate(
  userId: string,
  targetType: TargetType,
  targetId: string
): Promise<boolean> {
  if (targetType === "WORKFLOW") {
    const workflow = await prisma.workflow.findUnique({
      where: { id: targetId },
      select: { userId: true },
    });
    return workflow !== null && workflow.userId !== userId;
  } else {
    const miniPrompt = await prisma.miniPrompt.findUnique({
      where: { id: targetId },
      select: { userId: true },
    });
    return miniPrompt !== null && miniPrompt.userId !== userId;
  }
}
