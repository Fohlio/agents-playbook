import { redirect } from 'next/navigation';
import { auth } from '@/server/auth/auth';
import { prisma } from '@/server/db/client';
import { ROUTES } from '@/shared/routes';
import { WorkflowConstructorWrapper } from '@/views/workflow-constructor/components/WorkflowConstructorWrapper';
import { getAllAvailableMiniPrompts } from '@/views/workflow-constructor/actions/workflow-actions';

export default async function NewWorkflowPage() {
  console.log('[NewWorkflowPage] Starting page render');

  const session = await auth();
  console.log('[NewWorkflowPage] Session:', session?.user?.id ? 'Found' : 'Not found');

  if (!session?.user?.id) {
    redirect(ROUTES.LOGIN);
  }

  // Verify user exists in database
  console.log('[NewWorkflowPage] Checking if user exists:', session.user.id);
  const userExists = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  console.log('[NewWorkflowPage] User exists:', !!userExists);

  if (!userExists) {
    // User session is stale, redirect to login
    redirect(ROUTES.LOGIN);
  }

  // Fetch user's mini-prompts library (owned + referenced)
  console.log('[NewWorkflowPage] Fetching mini-prompts');
  const miniPrompts = await getAllAvailableMiniPrompts(session.user.id);
  console.log('[NewWorkflowPage] Fetched', miniPrompts.length, 'mini-prompts');

  console.log('[NewWorkflowPage] Rendering WorkflowConstructorWrapper');
  return (
    <WorkflowConstructorWrapper
      userId={session.user.id}
      miniPrompts={miniPrompts}
    />
  );
}
