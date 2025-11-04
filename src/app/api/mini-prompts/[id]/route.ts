import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';
import { triggerMiniPromptEmbedding } from '@/features/mini-prompts/lib/embedding-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const miniPrompt = await prisma.miniPrompt.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!miniPrompt) {
      return NextResponse.json({ error: 'Mini prompt not found' }, { status: 404 });
    }

    // Allow admin to view system mini prompts, or owner to view their own
    if (
      miniPrompt.userId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      ...miniPrompt,
      tagIds: miniPrompt.tags.map((t) => t.tagId),
    });
  } catch (error) {
    console.error('Error fetching mini prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mini prompt' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Check if mini prompt exists and user has permission
    const miniPrompt = await prisma.miniPrompt.findUnique({
      where: { id },
    });

    if (!miniPrompt) {
      return NextResponse.json({ error: 'Mini prompt not found' }, { status: 404 });
    }

    // Allow admin to update system mini prompts, or owner to update their own
    if (
      miniPrompt.userId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update tags if provided
    if (body.tagIds !== undefined) {
      await prisma.miniPromptTag.deleteMany({
        where: { miniPromptId: id }
      });

      if (body.tagIds.length > 0) {
        await prisma.miniPromptTag.createMany({
          data: body.tagIds.map((tagId: string) => ({
            miniPromptId: id,
            tagId
          }))
        });
      }
    }

    // Update mini prompt
    const updatedMiniPrompt = await prisma.miniPrompt.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.visibility !== undefined && { visibility: body.visibility }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    // Trigger embedding regeneration if name, description, content, or tags changed
    if (body.name !== undefined || body.description !== undefined || body.content !== undefined || body.tagIds !== undefined) {
      triggerMiniPromptEmbedding(id);
    }

    return NextResponse.json(updatedMiniPrompt);
  } catch (error) {
    console.error('Error updating mini prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update mini prompt' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Check if mini prompt exists and user has permission
    const miniPrompt = await prisma.miniPrompt.findUnique({
      where: { id },
    });

    if (!miniPrompt) {
      return NextResponse.json({ error: 'Mini prompt not found' }, { status: 404 });
    }

    // Allow admin to delete system mini prompts, or owner to delete their own
    if (
      miniPrompt.userId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete: mark as inactive (keeps in workflows but hides from library)
    await prisma.miniPrompt.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mini prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete mini prompt' },
      { status: 500 }
    );
  }
}
