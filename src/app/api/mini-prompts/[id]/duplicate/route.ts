import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Get the original mini-prompt with all its data
  const originalMiniPrompt = await prisma.miniPrompt.findUnique({
    where: { id },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!originalMiniPrompt) {
    return NextResponse.json({ error: 'Mini-prompt not found' }, { status: 404 });
  }

  // Check if user has access (owns it, it's public, or has it in library)
  const hasAccess =
    originalMiniPrompt.userId === session.user.id ||
    originalMiniPrompt.visibility === 'PUBLIC' ||
    (await prisma.miniPromptReference.findFirst({
      where: {
        miniPromptId: id,
        userId: session.user.id,
      },
    }));

  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get the highest position for the user's mini-prompts
  const maxPosition = await prisma.miniPrompt.findFirst({
    where: { userId: session.user.id },
    orderBy: { position: 'desc' },
    select: { position: true },
  });

  // Create duplicate mini-prompt
  const duplicatedMiniPrompt = await prisma.$transaction(async (tx) => {
    // Create the new mini-prompt
    const newMiniPrompt = await tx.miniPrompt.create({
      data: {
        userId: session.user.id,
        name: `${originalMiniPrompt.name} (Copy)`,
        description: originalMiniPrompt.description,
        content: originalMiniPrompt.content,
        visibility: 'PRIVATE', // Always private when duplicated
        isActive: false, // Inactive by default
        isSystemMiniPrompt: false, // Never a system mini-prompt
        position: (maxPosition?.position ?? 0) + 1,
      },
    });

    // Duplicate tags
    if (originalMiniPrompt.tags.length > 0) {
      await tx.miniPromptTag.createMany({
        data: originalMiniPrompt.tags.map((mpt) => ({
          miniPromptId: newMiniPrompt.id,
          tagId: mpt.tagId,
        })),
      });
    }

    return newMiniPrompt;
  });

  return NextResponse.json(duplicatedMiniPrompt);
}
