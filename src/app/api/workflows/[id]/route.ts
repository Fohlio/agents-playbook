import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';
import { userWorkflowEmbeddings } from '@/lib/embeddings/user-workflow-embeddings';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const workflow = await prisma.workflow.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!workflow) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
  }

  if (workflow.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();

  if (body.tagIds !== undefined) {
    await prisma.workflowTag.deleteMany({
      where: { workflowId: id }
    });

    if (body.tagIds.length > 0) {
      await prisma.workflowTag.createMany({
        data: body.tagIds.map((tagId: string) => ({
          workflowId: id,
          tagId
        }))
      });
    }
  }

  const updated = await prisma.workflow.update({
    where: { id },
    data: { isActive: body.isActive },
  });

  // Trigger embedding regeneration if tags changed (tags affect searchability)
  if (body.tagIds !== undefined) {
    userWorkflowEmbeddings.syncWorkflowEmbedding(id).catch((error) => {
      console.error('[PATCH /api/workflows/[id]] Failed to regenerate embedding:', error);
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const workflow = await prisma.workflow.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!workflow) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
  }

  if (workflow.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.workflow.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
