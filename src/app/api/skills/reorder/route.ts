import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
import { z } from 'zod';

const reorderSchema = z.object({
  skillId: z.string().uuid(),
  newPosition: z.number().int().min(0),
});

/**
 * POST /api/skills/reorder
 * Reorder a skill to a new position within the user's library
 *
 * Updates positions atomically using a transaction to ensure consistency.
 * When a skill moves to a new position:
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

    const { skillId, newPosition } = validation.data;

    await prisma.$transaction(async (tx) => {
      // Get the skill to reorder
      const skill = await tx.skill.findUnique({
        where: { id: skillId },
        select: { id: true, userId: true, position: true }
      });

      if (!skill) {
        throw new Error('Skill not found');
      }

      if (skill.userId !== session.user.id) {
        throw new Error('Forbidden: You do not own this skill');
      }

      const oldPosition = skill.position;

      // No change needed
      if (oldPosition === newPosition) {
        return;
      }

      if (newPosition > oldPosition) {
        // Moving down: decrement positions between old and new
        await tx.skill.updateMany({
          where: {
            userId: session.user.id,
            position: { gt: oldPosition, lte: newPosition }
          },
          data: { position: { decrement: 1 } }
        });
      } else {
        // Moving up: increment positions between new and old
        await tx.skill.updateMany({
          where: {
            userId: session.user.id,
            position: { gte: newPosition, lt: oldPosition }
          },
          data: { position: { increment: 1 } }
        });
      }

      // Update the skill to its new position
      await tx.skill.update({
        where: { id: skillId },
        data: { position: newPosition }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Skill reorder error:', error);

    if (error instanceof Error) {
      if (error.message === 'Skill not found') {
        return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
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
