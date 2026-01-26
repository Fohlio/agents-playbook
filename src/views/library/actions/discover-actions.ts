'use server';

/**
 * Discover Actions
 *
 * Server actions for importing public workflows and skills to user's library.
 */

import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';
import { revalidatePath } from 'next/cache';

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Import a public workflow to user's library
 * Creates a WorkflowReference linking the user to the workflow
 */
export async function importWorkflowAction(workflowId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify the workflow exists and is public
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        visibility: 'PUBLIC',
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, userId: true },
    });

    if (!workflow) {
      return { success: false, error: 'Workflow not found or not public' };
    }

    // Check if user already owns this workflow
    if (workflow.userId === session.user.id) {
      return { success: false, error: 'You already own this workflow' };
    }

    // Check if already imported (reference exists)
    const existing = await prisma.workflowReference.findFirst({
      where: {
        userId: session.user.id,
        workflowId,
      },
    });

    if (existing) {
      return { success: false, error: 'Already in library' };
    }

    // Create reference
    await withRetry(() =>
      prisma.workflowReference.create({
        data: {
          userId: session.user.id,
          workflowId,
        },
      })
    );

    revalidatePath('/dashboard/library');
    return { success: true };
  } catch (error) {
    console.error('[DiscoverActions] importWorkflow error:', error);
    return { success: false, error: 'Failed to import workflow' };
  }
}

/**
 * Import a public skill to user's library
 * Creates a SkillReference linking the user to the skill
 */
export async function importSkillAction(skillId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify the skill exists and is public
    const skill = await prisma.skill.findFirst({
      where: {
        id: skillId,
        visibility: 'PUBLIC',
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, userId: true },
    });

    if (!skill) {
      return { success: false, error: 'Skill not found or not public' };
    }

    // Check if user already owns this skill
    if (skill.userId === session.user.id) {
      return { success: false, error: 'You already own this skill' };
    }

    // Check if already imported (reference exists)
    const existing = await prisma.skillReference.findFirst({
      where: {
        userId: session.user.id,
        skillId,
      },
    });

    if (existing) {
      return { success: false, error: 'Already in library' };
    }

    // Create reference
    await withRetry(() =>
      prisma.skillReference.create({
        data: {
          userId: session.user.id,
          skillId,
        },
      })
    );

    revalidatePath('/dashboard/library');
    return { success: true };
  } catch (error) {
    console.error('[DiscoverActions] importSkill error:', error);
    return { success: false, error: 'Failed to import skill' };
  }
}

/**
 * Check if a workflow is already in user's library
 */
export async function checkWorkflowInLibraryAction(workflowId: string): Promise<{
  inLibrary: boolean;
  owned: boolean;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { inLibrary: false, owned: false };
  }

  // Check if user owns the workflow
  const owned = await prisma.workflow.findFirst({
    where: { id: workflowId, userId: session.user.id },
    select: { id: true },
  });
  if (owned) return { inLibrary: true, owned: true };

  // Check if user has a reference to the workflow
  const reference = await prisma.workflowReference.findFirst({
    where: { workflowId, userId: session.user.id },
    select: { id: true },
  });
  return { inLibrary: !!reference, owned: false };
}

/**
 * Check if a skill is already in user's library
 */
export async function checkSkillInLibraryAction(skillId: string): Promise<{
  inLibrary: boolean;
  owned: boolean;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { inLibrary: false, owned: false };
  }

  // Check if user owns the skill
  const owned = await prisma.skill.findFirst({
    where: { id: skillId, userId: session.user.id },
    select: { id: true },
  });
  if (owned) return { inLibrary: true, owned: true };

  // Check if user has a reference to the skill
  const reference = await prisma.skillReference.findFirst({
    where: { skillId, userId: session.user.id },
    select: { id: true },
  });
  return { inLibrary: !!reference, owned: false };
}
