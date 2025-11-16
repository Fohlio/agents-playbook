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

  // Batch fetch all ratings and usage stats in single queries
  const workflowIds = uniqueWorkflows.map((w) => w.id);

  // Fetch all ratings for all workflows in one query
  const allRatings = await prisma.rating.findMany({
    where: {
      targetType: 'WORKFLOW',
      targetId: { in: workflowIds },
    },
    select: {
      targetId: true,
      rating: true,
    },
  });

  // Fetch all usage stats for all workflows in one query
  const allUsageStats = await prisma.usageStats.findMany({
    where: {
      targetType: 'WORKFLOW',
      targetId: { in: workflowIds },
    },
  });

  // Group ratings by workflow ID and calculate averages
  const ratingsByWorkflow = new Map<string, { averageRating: number | null; totalRatings: number }>();
  for (const workflowId of workflowIds) {
    const workflowRatings = allRatings.filter((r) => r.targetId === workflowId);
    const averageRating =
      workflowRatings.length > 0
        ? workflowRatings.reduce((sum, r) => sum + r.rating, 0) / workflowRatings.length
        : null;
    ratingsByWorkflow.set(workflowId, {
      averageRating,
      totalRatings: workflowRatings.length,
    });
  }

  // Create usage stats map
  const usageStatsByWorkflow = new Map<string, number>();
  for (const stat of allUsageStats) {
    usageStatsByWorkflow.set(stat.targetId, stat.usageCount);
  }

  // Combine workflows with their metadata
  const workflowsWithMeta = uniqueWorkflows.map((workflow) => {
    const ratingData = ratingsByWorkflow.get(workflow.id) || {
      averageRating: null,
      totalRatings: 0,
    };
    const usageCount = usageStatsByWorkflow.get(workflow.id) || 0;

    return {
      ...workflow,
      averageRating: ratingData.averageRating,
      totalRatings: ratingData.totalRatings,
      usageCount,
    };
  });

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
