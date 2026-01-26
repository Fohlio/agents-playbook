import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
import { triggerSkillEmbedding } from '@/server/skills/skill-embedding-service';
import { generateUniqueKey } from '@/shared/lib/generate-key';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Fetch the original skill with tags
    const originalSkill = await prisma.skill.findUnique({
      where: { id },
      include: {
        tags: {
          select: {
            tagId: true,
          },
        },
      },
    });

    if (!originalSkill) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    // Allow owner or admin to duplicate
    if (
      originalSkill.userId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const newName = `Copy of ${originalSkill.name}`;
    const newKey = generateUniqueKey(newName);

    // Create the duplicated skill
    const duplicatedSkill = await prisma.skill.create({
      data: {
        userId: session.user.id,
        name: newName,
        description: originalSkill.description,
        content: originalSkill.content,
        visibility: 'PRIVATE',
        isActive: true,
        isSystemSkill: false,
        key: newKey,
        position: 0,
      },
    });

    // Copy tags (do NOT copy attachments)
    if (originalSkill.tags.length > 0) {
      await prisma.skillTag.createMany({
        data: originalSkill.tags.map((t) => ({
          skillId: duplicatedSkill.id,
          tagId: t.tagId,
        })),
      });
    }

    // Fetch the duplicated skill with tags to return
    const skillWithTags = await prisma.skill.findUnique({
      where: { id: duplicatedSkill.id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Trigger embedding generation asynchronously
    triggerSkillEmbedding(duplicatedSkill.id);

    return NextResponse.json(skillWithTags);
  } catch (error) {
    console.error('Error duplicating skill:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate skill' },
      { status: 500 }
    );
  }
}
