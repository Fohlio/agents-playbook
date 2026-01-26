import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';
import { ActiveSkillData } from '../components/ActiveSkillsSection';

/**
 * Skills Service for Dashboard
 *
 * Provides data fetching functions for skill-related dashboard sections.
 */

/**
 * Get active skills for a user
 * Returns skills that are active and not deleted
 */
export async function getActiveSkills(userId: string): Promise<ActiveSkillData[]> {
  const skills = await withRetry(() =>
    prisma.skill.findMany({
      where: {
        userId,
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        visibility: true,
        isSystemSkill: true,
        _count: {
          select: {
            attachments: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10, // Limit to 10 most recently updated
    })
  );

  return skills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    description: skill.description,
    attachmentCount: skill._count.attachments,
    isSystem: skill.isSystemSkill,
    visibility: skill.visibility,
  }));
}

/**
 * Deactivate a skill
 */
export async function deactivateSkill(skillId: string, userId: string): Promise<boolean> {
  try {
    const skill = await prisma.skill.findFirst({
      where: { id: skillId, userId },
    });

    if (!skill) {
      return false;
    }

    await withRetry(() =>
      prisma.skill.update({
        where: { id: skillId },
        data: { isActive: false },
      })
    );

    return true;
  } catch (error) {
    console.error('[SkillsService] deactivateSkill error:', error);
    return false;
  }
}
