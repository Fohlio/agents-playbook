import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
import { triggerSkillEmbedding } from '@/server/skills/skill-embedding-service';
import { isValidKey } from '@/shared/lib/validators/key';
import { generateUniqueKey } from '@/shared/lib/generate-key';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const systemOnly = searchParams.get('systemOnly') === 'true';

  if (systemOnly) {
    const skills = await prisma.skill.findMany({
      where: { isSystemSkill: true, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(skills);
  }

  // Get skills owned by user
  const ownedSkills = await prisma.skill.findMany({
    where: { userId: session.user.id, deletedAt: null },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  // Get skill references (imported skills)
  const skillReferences = await prisma.skillReference.findMany({
    where: { userId: session.user.id },
    include: {
      skill: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      },
    },
  });

  // Get skills used in user's workflows (via StageSkill)
  const usedInWorkflows = await prisma.stageSkill.findMany({
    where: {
      workflowStage: {
        workflow: {
          userId: session.user.id,
        },
      },
    },
    include: {
      skill: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      },
    },
  });

  // Mark owned vs imported skills
  const ownedWithFlag = ownedSkills.map((s) => ({
    ...s,
    isOwned: true,
    referenceId: null,
  }));
  const referencedWithFlag = skillReferences
    .filter((ref) => ref.skill.deletedAt === null)
    .map((ref) => ({
      ...ref.skill,
      isOwned: false,
      referenceId: ref.id,
    }));
  const workflowSkills = usedInWorkflows
    .filter((ss) => ss.skill.deletedAt === null)
    .map((ss) => ({
      ...ss.skill,
      isOwned: ss.skill.userId === session.user.id,
      referenceId: null,
    }));

  const allSkills = [...ownedWithFlag, ...referencedWithFlag, ...workflowSkills];

  // Remove duplicates and sort by position (for reordering support)
  const uniqueSkills = Array.from(
    new Map(allSkills.map((s) => [s.id, s])).values()
  ).sort((a, b) => a.position - b.position);

  // Batch fetch all ratings, usage stats, and attachment counts in single queries
  const skillIds = uniqueSkills.map((s) => s.id);

  // Fetch all ratings for all skills in one query
  const allRatings = await prisma.rating.findMany({
    where: {
      targetType: 'SKILL',
      targetId: { in: skillIds },
    },
    select: {
      targetId: true,
      rating: true,
    },
  });

  // Fetch all usage stats for all skills in one query
  const allUsageStats = await prisma.usageStats.findMany({
    where: {
      targetType: 'SKILL',
      targetId: { in: skillIds },
    },
  });

  // Fetch all attachment counts for all skills in one query
  const allAttachmentCounts = await prisma.skillAttachment.groupBy({
    by: ['skillId'],
    where: {
      skillId: { in: skillIds },
    },
    _count: {
      skillId: true,
    },
  });

  // Group ratings by skill ID and calculate averages
  const ratingsBySkill = new Map<string, { sum: number; count: number }>();
  for (const r of allRatings) {
    const existing = ratingsBySkill.get(r.targetId);
    if (existing) {
      existing.sum += r.rating;
      existing.count += 1;
    } else {
      ratingsBySkill.set(r.targetId, { sum: r.rating, count: 1 });
    }
  }

  // Create usage stats map
  const usageStatsBySkill = new Map<string, number>();
  for (const stat of allUsageStats) {
    usageStatsBySkill.set(stat.targetId, stat.usageCount);
  }

  // Create attachment count map
  const attachmentCountsBySkill = new Map<string, number>();
  for (const count of allAttachmentCounts) {
    attachmentCountsBySkill.set(count.skillId, count._count.skillId);
  }

  // Combine skills with their metadata
  const skillsWithMeta = uniqueSkills.map((skill) => {
    const ratingData = ratingsBySkill.get(skill.id);
    const usageCount = usageStatsBySkill.get(skill.id) || 0;
    const attachmentCount = attachmentCountsBySkill.get(skill.id) || 0;

    return {
      ...skill,
      averageRating: ratingData ? ratingData.sum / ratingData.count : null,
      totalRatings: ratingData?.count ?? 0,
      usageCount,
      attachmentCount,
    };
  });

  return NextResponse.json(skillsWithMeta);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Allow admins to create system skills
  const isSystemSkill = session.user.role === 'ADMIN' ? (body.isSystemSkill ?? false) : false;

  // Handle key field - only allowed for admin creating system skills
  let key: string | null = null;
  if (body.key) {
    // Manual key can only be set for system skills by admins
    if (session.user.role !== 'ADMIN' || !isSystemSkill) {
      return NextResponse.json(
        { error: 'Key can only be set for system skills by admins' },
        { status: 403 }
      );
    }
    if (!isValidKey(body.key)) {
      return NextResponse.json(
        { error: 'Key must be 2-100 characters, lowercase alphanumeric and hyphens only' },
        { status: 400 }
      );
    }
    key = body.key;
  } else {
    // Auto-generate key for all skills
    key = generateUniqueKey(body.name || 'Untitled Skill');
  }

  const skill = await prisma.skill.create({
    data: {
      userId: session.user.id,
      name: body.name || 'Untitled Skill',
      description: body.description || null,
      content: body.content || '',
      visibility: body.visibility || 'PRIVATE',
      isActive: true,
      isSystemSkill,
      key,
      position: 0,
    },
  });

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

  // Combine existing tag IDs with newly created tag IDs
  // Filter out any temporary IDs that might have slipped through
  const existingTagIds = (body.tagIds || []).filter(
    (id: string) => !id.startsWith('temp-')
  );
  const allTagIds = [...existingTagIds, ...createdTagIds];

  if (allTagIds.length > 0) {
    await prisma.skillTag.createMany({
      data: allTagIds.map((tagId: string) => ({
        skillId: skill.id,
        tagId
      }))
    });
  }

  // Fetch the skill with tags to return
  const skillWithTags = await prisma.skill.findUnique({
    where: { id: skill.id },
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  });

  // Trigger embedding generation asynchronously
  triggerSkillEmbedding(skill.id);

  return NextResponse.json(skillWithTags);
}
