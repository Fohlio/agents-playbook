import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/client';

/**
 * GET /api/public/workflows/[id]/details
 * 
 * Returns full workflow details including stages and mini-prompts
 * for PUBLIC workflows only. No authentication required.
 * 
 * This endpoint is used by the landing page to show workflow previews
 * to unauthenticated users.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Fetch workflow with full details
  const workflow = await prisma.workflow.findUnique({
    where: { 
      id,
      visibility: 'PUBLIC', // Only allow public workflows
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
        },
      },
      stages: {
        orderBy: { order: 'asc' },
        include: {
          miniPrompts: {
            orderBy: { order: 'asc' },
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
      models: {
        include: {
          model: true,
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
    return NextResponse.json(
      { error: 'Workflow not found or not public' }, 
      { status: 404 }
    );
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
    totalRatings: ratingStats._count.rating,
    usageCount: workflow._count.references,
    isInUserLibrary: false, // Always false for unauthenticated users
  };

  return NextResponse.json(response);
}

