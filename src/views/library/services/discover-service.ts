/**
 * Discover Service
 *
 * Provides data access for public workflows and skills displayed in the Discover tab.
 * Returns only PUBLIC visibility items that are active and not deleted.
 */

import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';

export interface PublicItem {
  id: string;
  type: 'workflow' | 'skill';
  name: string;
  description?: string | null;
  authorId: string;
  authorName?: string | null;
  createdAt: Date;
}

export interface PublicWorkflow extends PublicItem {
  type: 'workflow';
  stageCount: number;
}

export interface PublicSkill extends PublicItem {
  type: 'skill';
  attachmentCount: number;
}

/**
 * Get public workflows with optional search filter
 */
export async function getPublicWorkflows(search?: string): Promise<PublicWorkflow[]> {
  return withRetry(async () => {
    const workflows = await prisma.workflow.findMany({
      where: {
        visibility: 'PUBLIC',
        isActive: true,
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        user: { select: { id: true, username: true } },
        _count: { select: { stages: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return workflows.map((w) => ({
      id: w.id,
      type: 'workflow' as const,
      name: w.name,
      description: w.description,
      authorId: w.userId,
      authorName: w.user?.username || null,
      createdAt: w.createdAt,
      stageCount: w._count.stages,
    }));
  });
}

/**
 * Get public skills with optional search filter
 */
export async function getPublicSkills(search?: string): Promise<PublicSkill[]> {
  return withRetry(async () => {
    const skills = await prisma.skill.findMany({
      where: {
        visibility: 'PUBLIC',
        isActive: true,
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        user: { select: { id: true, username: true } },
        _count: { select: { attachments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return skills.map((s) => ({
      id: s.id,
      type: 'skill' as const,
      name: s.name,
      description: s.description,
      authorId: s.userId,
      authorName: s.user?.username || null,
      createdAt: s.createdAt,
      attachmentCount: s._count.attachments,
    }));
  });
}

/**
 * Get all public content (workflows and skills) with optional search filter
 */
export async function getPublicContent(search?: string): Promise<{
  workflows: PublicWorkflow[];
  skills: PublicSkill[];
}> {
  const [workflows, skills] = await Promise.all([
    getPublicWorkflows(search),
    getPublicSkills(search),
  ]);

  return { workflows, skills };
}

/**
 * Check if a workflow is already in user's library (either owned or referenced)
 */
export async function isWorkflowInLibrary(workflowId: string, userId: string): Promise<boolean> {
  // Check if user owns the workflow
  const owned = await prisma.workflow.findFirst({
    where: { id: workflowId, userId },
    select: { id: true },
  });
  if (owned) return true;

  // Check if user has a reference to the workflow
  const reference = await prisma.workflowReference.findFirst({
    where: { workflowId, userId },
    select: { id: true },
  });
  return !!reference;
}

/**
 * Check if a skill is already in user's library (either owned or referenced)
 */
export async function isSkillInLibrary(skillId: string, userId: string): Promise<boolean> {
  // Check if user owns the skill
  const owned = await prisma.skill.findFirst({
    where: { id: skillId, userId },
    select: { id: true },
  });
  if (owned) return true;

  // Check if user has a reference to the skill
  const reference = await prisma.skillReference.findFirst({
    where: { skillId, userId },
    select: { id: true },
  });
  return !!reference;
}
