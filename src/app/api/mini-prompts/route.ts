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

  // Add rating and usage stats for each mini-prompt
  const miniPromptsWithMeta = await Promise.all(
    uniqueMiniPrompts.map(async (miniPrompt) => {
      const ratingStats = await prisma.rating.aggregate({
        where: {
          targetType: 'MINI_PROMPT',
          targetId: miniPrompt.id,
        },
        _avg: { rating: true },
        _count: { rating: true },
      });

      const usageStats = await prisma.usageStats.findUnique({
        where: {
          targetType_targetId: {
            targetType: 'MINI_PROMPT',
            targetId: miniPrompt.id,
          },
        },
      });

      const stageCount = await prisma.stageMiniPrompt.count({
        where: { miniPromptId: miniPrompt.id },
      });

      return {
        ...miniPrompt,
        averageRating: ratingStats._avg.rating || null,
        totalRatings: ratingStats._count.rating,
        usageCount: usageStats?.usageCount || 0,
        _count: {
          stageMiniPrompts: stageCount,
          references: 0, // Can add if needed
        },
      };
    })
  );

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
