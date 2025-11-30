import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
import { z } from 'zod';

const mergeSchema = z.object({
  targetTagId: z.string().uuid()
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: sourceTagId } = await params;

  try {
    const body = await request.json();
    const validation = mergeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { targetTagId } = validation.data;

    if (sourceTagId === targetTagId) {
      return NextResponse.json({ error: 'Cannot merge tag into itself' }, { status: 400 });
    }

    // Verify both tags exist
    const [sourceTag, targetTag] = await Promise.all([
      prisma.tag.findUnique({ where: { id: sourceTagId } }),
      prisma.tag.findUnique({ where: { id: targetTagId } })
    ]);

    if (!sourceTag || !targetTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    // Execute merge in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Get all workflow/mini-prompt assignments for source tag
      const [workflowTags, miniPromptTags] = await Promise.all([
        tx.workflowTag.findMany({ where: { tagId: sourceTagId } }),
        tx.miniPromptTag.findMany({ where: { tagId: sourceTagId } })
      ]);

      // 2. Reassign to target tag (skip if already exists)
      for (const wt of workflowTags) {
        await tx.workflowTag.upsert({
          where: {
            workflowId_tagId: {
              workflowId: wt.workflowId,
              tagId: targetTagId
            }
          },
          create: { workflowId: wt.workflowId, tagId: targetTagId },
          update: {} // Already exists, do nothing
        });
      }

      for (const mpt of miniPromptTags) {
        await tx.miniPromptTag.upsert({
          where: {
            miniPromptId_tagId: {
              miniPromptId: mpt.miniPromptId,
              tagId: targetTagId
            }
          },
          create: { miniPromptId: mpt.miniPromptId, tagId: targetTagId },
          update: {} // Already exists, do nothing
        });
      }

      // 3. Hard delete source tag (cascades to junction tables)
      await tx.tag.delete({ where: { id: sourceTagId } });
    });

    return NextResponse.json({
      success: true,
      message: `Tag "${sourceTag.name}" merged into "${targetTag.name}"`
    });
  } catch (error) {
    console.error('Error merging tags:', error);
    return NextResponse.json({ error: 'Failed to merge tags' }, { status: 500 });
  }
}
