import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Fetch workflow with full details
  const workflow = await prisma.workflow.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      stages: {
        orderBy: { order: 'asc' },
        include: {
          miniPrompts: {
            include: {
              miniPrompt: true,
            },
          },
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      _count: {
        select: {
          stages: true,
          references: true,
        },
      },
    },
  });

  if (!workflow) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
  }

  // Check if user has access (owns it or has it in library)
  const hasAccess =
    workflow.userId === session.user.id ||
    workflow.visibility === 'PUBLIC' ||
    (await prisma.workflowReference.findFirst({
      where: {
        workflowId: id,
        userId: session.user.id,
      },
    }));

  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get average rating
  const ratingStats = await prisma.rating.aggregate({
    where: {
      targetType: 'WORKFLOW',
      targetId: id
    },
    _avg: { rating: true },
    _count: { rating: true },
  });

  // Format response to match PublicWorkflowWithMeta type
  const response = {
    ...workflow,
    averageRating: ratingStats._avg.rating || null,
    ratingCount: ratingStats._count.rating,
  };

  return NextResponse.json(response);
}
