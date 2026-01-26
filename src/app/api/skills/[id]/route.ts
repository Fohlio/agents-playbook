import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
import { triggerSkillEmbedding } from '@/server/skills/skill-embedding-service';
import { isValidKey } from '@/shared/lib/validators/key';

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

    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            createdAt: true,
          },
        },
      },
    });

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    // Allow admin to view system skills, or owner to view their own
    if (
      skill.userId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      ...skill,
      tagIds: skill.tags.map((t) => t.tagId),
    });
  } catch (error) {
    console.error('Error fetching skill:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill' },
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

    // Check if skill exists and user has permission
    const skill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    // Allow admin to update system skills, or owner to update their own
    if (
      skill.userId !== session.user.id &&
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
      await prisma.skillTag.deleteMany({
        where: { skillId: id }
      });

      // Combine existing tag IDs with newly created tag IDs
      // Filter out any temporary IDs that might have slipped through
      const existingTagIds = (body.tagIds || []).filter(
        (tagId: string) => !tagId.startsWith('temp-')
      );
      const allTagIds = [...existingTagIds, ...createdTagIds];

      if (allTagIds.length > 0) {
        await prisma.skillTag.createMany({
          data: allTagIds.map((tagId: string) => ({
            skillId: id,
            tagId
          }))
        });
      }
    }

    // Handle model updates if provided
    if (body.modelIds !== undefined) {
      // Delete existing model associations
      await prisma.skillModel.deleteMany({
        where: { skillId: id }
      });

      // Create new model associations
      if (body.modelIds.length > 0) {
        await prisma.skillModel.createMany({
          data: body.modelIds.map((modelId: string) => ({
            skillId: id,
            modelId
          }))
        });
      }
    }

    // Handle key updates - only allowed for admin on system skills
    const keyUpdate: { key?: string | null } = {};
    if (body.key !== undefined) {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Only admins can set or update keys' },
          { status: 403 }
        );
      }
      if (!skill.isSystemSkill) {
        return NextResponse.json(
          { error: 'Key can only be set for system skills' },
          { status: 400 }
        );
      }
      // Allow setting to null/empty to remove key, or validate new key
      if (body.key === null || body.key === '') {
        keyUpdate.key = null;
      } else if (!isValidKey(body.key)) {
        return NextResponse.json(
          { error: 'Key must be 2-100 characters, lowercase alphanumeric and hyphens only' },
          { status: 400 }
        );
      } else {
        keyUpdate.key = body.key;
      }
    }

    // Update skill
    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.visibility !== undefined && { visibility: body.visibility }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...keyUpdate,
      },
    });

    // Trigger embedding regeneration if name, description, content, or tags changed
    if (body.name !== undefined || body.description !== undefined || body.content !== undefined || body.tagIds !== undefined || body.newTagNames !== undefined) {
      triggerSkillEmbedding(id);
    }

    return NextResponse.json(updatedSkill);
  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json(
      { error: 'Failed to update skill' },
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

    // Check if skill exists and user has permission
    const skill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    // Allow admin to delete system skills, or owner to delete their own
    if (
      skill.userId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete: set deletedAt and remove from folder_items
    await prisma.$transaction(async (tx) => {
      // Set deletedAt timestamp
      await tx.skill.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          visibility: 'PRIVATE', // Remove from public discover when deleted
        },
      });

      // Remove from folder_items
      await tx.folder_items.deleteMany({
        where: {
          target_type: 'SKILL',
          target_id: id,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json(
      { error: 'Failed to delete skill' },
      { status: 500 }
    );
  }
}
