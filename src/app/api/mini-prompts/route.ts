import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const systemOnly = searchParams.get('systemOnly') === 'true';

  if (systemOnly) {
    const miniPrompts = await prisma.miniPrompt.findMany({
      where: { isSystemMiniPrompt: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(miniPrompts);
  }

  // Get mini-prompts owned by user
  const ownedMiniPrompts = await prisma.miniPrompt.findMany({
    where: { userId: session.user.id },
  });

  // Get mini-prompt references (imported mini-prompts)
  const miniPromptReferences = await prisma.miniPromptReference.findMany({
    where: { userId: session.user.id },
    include: {
      miniPrompt: true,
    },
  });

  // Get mini-prompts used in user's workflows (via StageMiniPrompt)
  const usedInWorkflows = await prisma.stageMiniPrompt.findMany({
    where: {
      stage: {
        workflow: {
          userId: session.user.id,
        },
      },
    },
    include: {
      miniPrompt: true,
    },
  });

  // Combine all mini-prompts
  const referencedMiniPrompts = miniPromptReferences.map((ref) => ref.miniPrompt);
  const workflowMiniPrompts = usedInWorkflows.map((smp) => smp.miniPrompt);
  const allMiniPrompts = [...ownedMiniPrompts, ...referencedMiniPrompts, ...workflowMiniPrompts];

  // Remove duplicates and sort by createdAt
  const uniqueMiniPrompts = Array.from(
    new Map(allMiniPrompts.map((m) => [m.id, m])).values()
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return NextResponse.json(uniqueMiniPrompts);
}
