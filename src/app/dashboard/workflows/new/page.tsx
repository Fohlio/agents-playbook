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

  // Fetch both PUBLIC mini-prompts and user's own mini-prompts
  const miniPrompts = await prisma.miniPrompt.findMany({
    where: {
      OR: [
        { visibility: 'PUBLIC' },
        { userId: session.user.id },
      ],
    },
    orderBy: [
      { createdAt: 'desc' },
    ],
  });

  return (
    <WorkflowConstructorWrapper
      userId={session.user.id}
      miniPrompts={miniPrompts}
    />
  );
}
