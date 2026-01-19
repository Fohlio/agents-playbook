'use server';

/**
 * Discover Actions
 *
 * Server actions for importing public workflows and prompts to user's library.
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
 * Import a public prompt to user's library
 * Creates a MiniPromptReference linking the user to the prompt
 */
export async function importPromptAction(promptId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    // Verify the prompt exists and is public
    const prompt = await prisma.miniPrompt.findFirst({
      where: {
        id: promptId,
        visibility: 'PUBLIC',
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, userId: true },
    });

    if (!prompt) {
      return { success: false, error: 'Prompt not found or not public' };
    }

    // Check if user already owns this prompt
    if (prompt.userId === session.user.id) {
      return { success: false, error: 'You already own this prompt' };
    }

    // Check if already imported (reference exists)
    const existing = await prisma.miniPromptReference.findFirst({
      where: {
        userId: session.user.id,
        miniPromptId: promptId,
      },
    });

    if (existing) {
      return { success: false, error: 'Already in library' };
    }

    // Create reference
    await withRetry(() =>
      prisma.miniPromptReference.create({
        data: {
          userId: session.user.id,
          miniPromptId: promptId,
        },
      })
    );

    revalidatePath('/dashboard/library');
    return { success: true };
  } catch (error) {
    console.error('[DiscoverActions] importPrompt error:', error);
    return { success: false, error: 'Failed to import prompt' };
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
 * Check if a prompt is already in user's library
 */
export async function checkPromptInLibraryAction(promptId: string): Promise<{
  inLibrary: boolean;
  owned: boolean;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return { inLibrary: false, owned: false };
  }

  // Check if user owns the prompt
  const owned = await prisma.miniPrompt.findFirst({
    where: { id: promptId, userId: session.user.id },
    select: { id: true },
  });
  if (owned) return { inLibrary: true, owned: true };

  // Check if user has a reference to the prompt
  const reference = await prisma.miniPromptReference.findFirst({
    where: { miniPromptId: promptId, userId: session.user.id },
    select: { id: true },
  });
  return { inLibrary: !!reference, owned: false };
}
