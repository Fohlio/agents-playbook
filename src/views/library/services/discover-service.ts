/**
 * Discover Service
 *
 * Provides data access for public workflows and prompts displayed in the Discover tab.
 * Returns only PUBLIC visibility items that are active and not deleted.
 */

import { prisma } from '@/server/db/client';
import { withRetry } from '@/server/db/retry';

export interface PublicItem {
  id: string;
  type: 'workflow' | 'prompt';
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

export interface PublicPrompt extends PublicItem {
  type: 'prompt';
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
 * Get public prompts with optional search filter
 * Excludes prompts that are part of workflows (only standalone prompts)
 */
export async function getPublicPrompts(search?: string): Promise<PublicPrompt[]> {
  return withRetry(async () => {
    const prompts = await prisma.miniPrompt.findMany({
      where: {
        visibility: 'PUBLIC',
        isActive: true,
        deletedAt: null,
        // Exclude prompts that are part of workflows
        stageMiniPrompts: { none: {} },
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        user: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return prompts.map((p) => ({
      id: p.id,
      type: 'prompt' as const,
      name: p.name,
      description: p.description,
      authorId: p.userId,
      authorName: p.user?.username || null,
      createdAt: p.createdAt,
    }));
  });
}

/**
 * Get all public content (workflows and prompts) with optional search filter
 */
export async function getPublicContent(search?: string): Promise<{
  workflows: PublicWorkflow[];
  prompts: PublicPrompt[];
}> {
  const [workflows, prompts] = await Promise.all([
    getPublicWorkflows(search),
    getPublicPrompts(search),
  ]);

  return { workflows, prompts };
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
 * Check if a prompt is already in user's library (either owned or referenced)
 */
export async function isPromptInLibrary(promptId: string, userId: string): Promise<boolean> {
  // Check if user owns the prompt
  const owned = await prisma.miniPrompt.findFirst({
    where: { id: promptId, userId },
    select: { id: true },
  });
  if (owned) return true;

  // Check if user has a reference to the prompt
  const reference = await prisma.miniPromptReference.findFirst({
    where: { miniPromptId: promptId, userId },
    select: { id: true },
  });
  return !!reference;
}
