import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
import { z } from 'zod';

const reorderSchema = z.object({
  workflowId: z.string().uuid(),
  newPosition: z.number().int().min(0),
});

/**
 * POST /api/workflows/reorder
 * Reorder a workflow to a new position within the user's library
 *
 * Updates positions atomically using a transaction to ensure consistency.
 * When a workflow moves to a new position:
 * - Moving down: decrement positions between old and new
 * - Moving up: increment positions between new and old
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = reorderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { workflowId, newPosition } = validation.data;

    await prisma.$transaction(async (tx) => {
      // Get the workflow to reorder
      const workflow = await tx.workflow.findUnique({
        where: { id: workflowId },
        select: { id: true, userId: true, position: true }
      });

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      if (workflow.userId !== session.user.id) {
        throw new Error('Forbidden: You do not own this workflow');
      }

      const oldPosition = workflow.position;

      // No change needed
      if (oldPosition === newPosition) {
        return;
      }

      if (newPosition > oldPosition) {
        // Moving down: decrement positions between old and new
        await tx.workflow.updateMany({
          where: {
            userId: session.user.id,
            position: { gt: oldPosition, lte: newPosition }
          },
          data: { position: { decrement: 1 } }
        });
      } else if (newPosition < oldPosition) {
        // Moving up: increment positions between new and old
        await tx.workflow.updateMany({
          where: {
            userId: session.user.id,
            position: { gte: newPosition, lt: oldPosition }
          },
          data: { position: { increment: 1 } }
        });
      }

      // Update the workflow to its new position
      await tx.workflow.update({
        where: { id: workflowId },
        data: { position: newPosition }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Workflow reorder error:', error);

    if (error instanceof Error) {
      if (error.message === 'Workflow not found') {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }
      if (error.message.startsWith('Forbidden')) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
