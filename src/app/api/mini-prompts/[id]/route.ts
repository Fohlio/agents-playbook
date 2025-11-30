import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
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

    // Handle tag updates if provided
    if (body.tagIds !== undefined || body.newTagNames !== undefined) {
      // Create new tags if provided
      const createdTagIds: string[] = [];
      if (body.newTagNames && body.newTagNames.length > 0) {
        for (const tagName of body.newTagNames) {
          // Check if tag already exists (case-insensitive)
          const existingTag = await prisma.tag.findFirst({
            where: { name: { equals: tagName, mode: 'insensitive' } },
          });

          if (existingTag) {
            createdTagIds.push(existingTag.id);
          } else {
            const newTag = await prisma.tag.create({
              data: {
                name: tagName,
                color: null,
                isActive: true,
                createdBy: session.user.id,
              },
            });
            createdTagIds.push(newTag.id);
          }
        }
      }

      // Delete existing tag associations
      await prisma.miniPromptTag.deleteMany({
        where: { miniPromptId: id }
      });

      // Combine existing tag IDs with newly created tag IDs
      // Filter out any temporary IDs that might have slipped through
      const existingTagIds = (body.tagIds || []).filter(
        (tagId: string) => !tagId.startsWith('temp-')
      );
      const allTagIds = [...existingTagIds, ...createdTagIds];

      if (allTagIds.length > 0) {
        await prisma.miniPromptTag.createMany({
          data: allTagIds.map((tagId: string) => ({
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
    if (body.name !== undefined || body.description !== undefined || body.content !== undefined || body.tagIds !== undefined || body.newTagNames !== undefined) {
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

    // Soft delete: mark as inactive and set to private (hides from library and discover)
    await prisma.miniPrompt.update({
      where: { id },
      data: { 
        isActive: false,
        visibility: 'PRIVATE', // Remove from public discover when deleted
      },
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
