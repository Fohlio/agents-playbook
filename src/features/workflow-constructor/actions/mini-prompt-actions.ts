'use server';

import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';
import type { MiniPrompt, Visibility } from '@prisma/client';

export interface CreateMiniPromptInput {
  name: string;
  content: string;
  visibility: Visibility;
}

export interface UpdateMiniPromptInput {
  id: string;
  name?: string;
  content?: string;
  visibility?: Visibility;
}

export async function createMiniPrompt(
  input: CreateMiniPromptInput
): Promise<MiniPrompt> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const miniPrompt = await prisma.miniPrompt.create({
    data: {
      userId: session.user.id,
      name: input.name,
      content: input.content,
      visibility: input.visibility,
    },
  });

  return miniPrompt;
}

export async function updateMiniPrompt(
  input: UpdateMiniPromptInput
): Promise<MiniPrompt> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Verify ownership
  const existing = await prisma.miniPrompt.findUnique({
    where: { id: input.id },
    select: { userId: true },
  });

  if (!existing) {
    throw new Error('Mini-prompt not found');
  }

  if (existing.userId !== session.user.id) {
    throw new Error('Unauthorized - not the owner');
  }

  const miniPrompt = await prisma.miniPrompt.update({
    where: { id: input.id },
    data: {
      name: input.name,
      content: input.content,
      visibility: input.visibility,
    },
  });

  return miniPrompt;
}

export async function deleteMiniPrompt(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Verify ownership
  const existing = await prisma.miniPrompt.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing) {
    throw new Error('Mini-prompt not found');
  }

  if (existing.userId !== session.user.id) {
    throw new Error('Unauthorized - not the owner');
  }

  // Check if mini-prompt is used in any workflows
  const usageCount = await prisma.stageMiniPrompt.count({
    where: { miniPromptId: id },
  });

  if (usageCount > 0) {
    throw new Error(
      `Cannot delete mini-prompt: it is used in ${usageCount} workflow stage(s)`
    );
  }

  await prisma.miniPrompt.delete({
    where: { id },
  });
}

export async function getMiniPromptsByUser(): Promise<MiniPrompt[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return await prisma.miniPrompt.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
}
