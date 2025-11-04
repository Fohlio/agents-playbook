import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';
import { userWorkflowEmbeddings } from '@/lib/embeddings/user-workflow-embeddings';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const systemOnly = searchParams.get('systemOnly') === 'true';

  if (systemOnly) {
    const workflows = await prisma.workflow.findMany({
      where: { isSystemWorkflow: true },
      include: {
        _count: {
          select: { stages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(workflows);
  }

  // Get workflows owned by user
  const ownedWorkflows = await prisma.workflow.findMany({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: { stages: true },
      },
    },
  });

  // Get workflow references (imported workflows)
  const workflowReferences = await prisma.workflowReference.findMany({
    where: { userId: session.user.id },
    include: {
      workflow: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: { stages: true },
          },
        },
      },
    },
  });

  // Mark owned vs imported workflows
  const ownedWithFlag = ownedWorkflows.map((w) => ({
    ...w,
    isOwned: true,
    referenceId: null,
    isSystemWorkflow: w.isSystemWorkflow
  }));
  const referencedWithFlag = workflowReferences.map((ref) => ({
    ...ref.workflow,
    isOwned: false,
    referenceId: ref.id,
    isSystemWorkflow: ref.workflow.isSystemWorkflow,
  }));

  const allWorkflows = [...ownedWithFlag, ...referencedWithFlag];

  // Remove duplicates and sort by position (for reordering support)
  const uniqueWorkflows = Array.from(
    new Map(allWorkflows.map((w) => [w.id, w])).values()
  ).sort((a, b) => a.position - b.position);

  // Add rating and usage stats for each workflow
  const workflowsWithMeta = await Promise.all(
    uniqueWorkflows.map(async (workflow) => {
      const ratingStats = await prisma.rating.aggregate({
        where: {
          targetType: 'WORKFLOW',
          targetId: workflow.id,
        },
        _avg: { rating: true },
        _count: { rating: true },
      });

      const usageStats = await prisma.usageStats.findUnique({
        where: {
          targetType_targetId: {
            targetType: 'WORKFLOW',
            targetId: workflow.id,
          },
        },
      });

      return {
        ...workflow,
        averageRating: ratingStats?._avg?.rating || null,
        totalRatings: ratingStats?._count?.rating || 0,
        usageCount: usageStats?.usageCount || 0,
      };
    })
  );

  return NextResponse.json(workflowsWithMeta);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const workflow = await prisma.workflow.create({
    data: {
      userId: session.user.id,
      name: body.name || 'Untitled Workflow',
      description: body.description || null,
      yamlContent: null,
      visibility: 'PRIVATE',
      isActive: body.isActive || false,
    },
  });

  if (body.tagIds && body.tagIds.length > 0) {
    await prisma.workflowTag.createMany({
      data: body.tagIds.map((tagId: string) => ({
        workflowId: workflow.id,
        tagId
      }))
    });
  }

  // Trigger embedding generation asynchronously
  userWorkflowEmbeddings.syncWorkflowEmbedding(workflow.id).catch((error) => {
    console.error('[POST /api/workflows] Failed to generate embedding:', error);
  });

  return NextResponse.json(workflow);
}
