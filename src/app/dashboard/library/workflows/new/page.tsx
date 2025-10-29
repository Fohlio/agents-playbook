import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';
import { ROUTES } from '@/shared/routes';
import { WorkflowConstructorWrapper } from '@/features/workflow-constructor/components/WorkflowConstructorWrapper';
import { getAllAvailableMiniPrompts } from '@/features/workflow-constructor/actions/workflow-actions';

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

  // Fetch user's mini-prompts library (owned + referenced)
  const miniPrompts = await getAllAvailableMiniPrompts(session.user.id);

  return (
    <WorkflowConstructorWrapper
      userId={session.user.id}
      miniPrompts={miniPrompts}
    />
  );
}
