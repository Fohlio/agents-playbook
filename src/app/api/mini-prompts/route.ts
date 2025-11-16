import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';
import { triggerMiniPromptEmbedding } from '@/features/mini-prompts/lib/embedding-service';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const systemOnly = searchParams.get('systemOnly') === 'true';

  if (systemOnly) {
    const miniPrompts = await prisma.miniPrompt.findMany({
      where: { isSystemMiniPrompt: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(miniPrompts);
  }

  // Get mini-prompts owned by user
  const ownedMiniPrompts = await prisma.miniPrompt.findMany({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
    },
  });

  // Get mini-prompt references (imported mini-prompts)
  const miniPromptReferences = await prisma.miniPromptReference.findMany({
    where: { userId: session.user.id },
    include: {
      miniPrompt: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // Get mini-prompts used in user's workflows (via StageMiniPrompt)
  const usedInWorkflows = await prisma.stageMiniPrompt.findMany({
    where: {
      stage: {
        workflow: {
          userId: session.user.id,
        },
      },
    },
    include: {
      miniPrompt: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // Mark owned vs imported mini-prompts
  const ownedWithFlag = ownedMiniPrompts.map((m) => ({
    ...m,
    isOwned: true,
    referenceId: null,
    isSystemMiniPrompt: m.isSystemMiniPrompt
  }));
  const referencedWithFlag = miniPromptReferences.map((ref) => ({
    ...ref.miniPrompt,
    isOwned: false,
    referenceId: ref.id,
    isSystemMiniPrompt: ref.miniPrompt.isSystemMiniPrompt,
  }));
  const workflowMiniPrompts = usedInWorkflows.map((smp) => ({
    ...smp.miniPrompt,
    isOwned: smp.miniPrompt.userId === session.user.id,
    referenceId: null,
    isSystemMiniPrompt: smp.miniPrompt.isSystemMiniPrompt,
  }));

  const allMiniPrompts = [...ownedWithFlag, ...referencedWithFlag, ...workflowMiniPrompts];

  // Remove duplicates and sort by position (for reordering support)
  const uniqueMiniPrompts = Array.from(
    new Map(allMiniPrompts.map((m) => [m.id, m])).values()
  ).sort((a, b) => a.position - b.position);

  // Batch fetch all ratings, usage stats, and stage counts in single queries
  const miniPromptIds = uniqueMiniPrompts.map((m) => m.id);

  // Fetch all ratings for all mini-prompts in one query
  const allRatings = await prisma.rating.findMany({
    where: {
      targetType: 'MINI_PROMPT',
      targetId: { in: miniPromptIds },
    },
    select: {
      targetId: true,
      rating: true,
    },
  });

  // Fetch all usage stats for all mini-prompts in one query
  const allUsageStats = await prisma.usageStats.findMany({
    where: {
      targetType: 'MINI_PROMPT',
      targetId: { in: miniPromptIds },
    },
  });

  // Fetch all stage counts for all mini-prompts in one query
  const allStageCounts = await prisma.stageMiniPrompt.groupBy({
    by: ['miniPromptId'],
    where: {
      miniPromptId: { in: miniPromptIds },
    },
    _count: {
      miniPromptId: true,
    },
  });

  // Group ratings by mini-prompt ID and calculate averages
  const ratingsByMiniPrompt = new Map<string, { averageRating: number | null; totalRatings: number }>();
  for (const miniPromptId of miniPromptIds) {
    const miniPromptRatings = allRatings.filter((r) => r.targetId === miniPromptId);
    const averageRating =
      miniPromptRatings.length > 0
        ? miniPromptRatings.reduce((sum, r) => sum + r.rating, 0) / miniPromptRatings.length
        : null;
    ratingsByMiniPrompt.set(miniPromptId, {
      averageRating,
      totalRatings: miniPromptRatings.length,
    });
  }

  // Create usage stats map
  const usageStatsByMiniPrompt = new Map<string, number>();
  for (const stat of allUsageStats) {
    usageStatsByMiniPrompt.set(stat.targetId, stat.usageCount);
  }

  // Create stage count map
  const stageCountsByMiniPrompt = new Map<string, number>();
  for (const count of allStageCounts) {
    stageCountsByMiniPrompt.set(count.miniPromptId, count._count.miniPromptId);
  }

  // Combine mini-prompts with their metadata
  const miniPromptsWithMeta = uniqueMiniPrompts.map((miniPrompt) => {
    const ratingData = ratingsByMiniPrompt.get(miniPrompt.id) || {
      averageRating: null,
      totalRatings: 0,
    };
    const usageCount = usageStatsByMiniPrompt.get(miniPrompt.id) || 0;
    const stageCount = stageCountsByMiniPrompt.get(miniPrompt.id) || 0;

    return {
      ...miniPrompt,
      averageRating: ratingData.averageRating,
      totalRatings: ratingData.totalRatings,
      usageCount,
      _count: {
        stageMiniPrompts: stageCount,
        references: 0, // Can add if needed
      },
    };
  });

  return NextResponse.json(miniPromptsWithMeta);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const miniPrompt = await prisma.miniPrompt.create({
    data: {
      userId: session.user.id,
      name: body.name || 'Untitled Mini-Prompt',
      description: body.description || null,
      content: body.content || '',
      visibility: body.visibility || 'PRIVATE',
      isActive: true,
      isSystemMiniPrompt: false,
      position: 0,
    },
  });

  if (body.tagIds && body.tagIds.length > 0) {
    await prisma.miniPromptTag.createMany({
      data: body.tagIds.map((tagId: string) => ({
        miniPromptId: miniPrompt.id,
        tagId
      }))
    });
  }

  // Trigger embedding generation asynchronously
  triggerMiniPromptEmbedding(miniPrompt.id);

  return NextResponse.json(miniPrompt);
}
