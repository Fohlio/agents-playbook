import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';
import { ROUTES } from '@/shared/routes';
import { WorkflowConstructorWrapper } from '@/features/workflow-constructor/components/WorkflowConstructorWrapper';

export default async function NewWorkflowPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(ROUTES.LOGIN);
  }

  // Verify user exists in database
  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!userExists) {
    // User session is stale, redirect to login
    redirect(ROUTES.LOGIN);
  }

  // Fetch user's mini-prompts library (owned + referenced + used in workflows)
  const ownedMiniPrompts = await prisma.miniPrompt.findMany({
    where: { userId: session.user.id },
  });

  const referencedMiniPrompts = await prisma.miniPromptReference.findMany({
    where: { userId: session.user.id },
    include: { miniPrompt: true },
  });

  const usedInWorkflows = await prisma.stageMiniPrompt.findMany({
    where: {
      stage: {
        workflow: { userId: session.user.id },
      },
    },
    include: { miniPrompt: true },
  });

  const allMiniPrompts = [
    ...ownedMiniPrompts,
    ...referencedMiniPrompts.map((ref) => ref.miniPrompt),
    ...usedInWorkflows.map((smp) => smp.miniPrompt),
  ];

  const miniPrompts = Array.from(
    new Map(allMiniPrompts.map((mp) => [mp.id, mp])).values()
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <WorkflowConstructorWrapper
      userId={session.user.id}
      miniPrompts={miniPrompts}
    />
  );
}
