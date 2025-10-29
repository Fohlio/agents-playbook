import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = params;

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

    // Update mini prompt
    const updatedMiniPrompt = await prisma.miniPrompt.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.visibility !== undefined && { visibility: body.visibility }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

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
  { params }: { params: { id: string } }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;

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

    // Delete mini prompt
    await prisma.miniPrompt.delete({
      where: { id },
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
