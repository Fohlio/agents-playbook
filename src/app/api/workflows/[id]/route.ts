import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
import { userWorkflowEmbeddings } from '@/server/embeddings/user-workflow-embeddings';

/**
 * Verify user is authenticated and owns the workflow
 */
async function verifyWorkflowAccess(workflowId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    select: { userId: true },
  });

  if (!workflow) {
    return { error: NextResponse.json({ error: 'Workflow not found' }, { status: 404 }) };
  }

  if (workflow.userId !== session.user.id) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { userId: session.user.id };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const access = await verifyWorkflowAccess(id);
  if ('error' in access) return access.error;

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
    data: {
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.visibility !== undefined && { visibility: body.visibility }),
    },
  });

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
  const { id } = await params;
  const access = await verifyWorkflowAccess(id);
  if ('error' in access) return access.error;

  await prisma.workflow.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
