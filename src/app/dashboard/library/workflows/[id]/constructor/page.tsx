import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getWorkflowWithStages, getAllAvailableMiniPrompts } from '@/features/workflow-constructor/actions/workflow-actions';
import { WorkflowConstructor } from '@/features/workflow-constructor/components/WorkflowConstructor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkflowConstructorPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    notFound();
  }

  const { id } = await params;

  const [workflow, miniPrompts] = await Promise.all([
    getWorkflowWithStages(id),
    getAllAvailableMiniPrompts(session.user.id),
  ]);

  if (!workflow) {
    notFound();
  }

  // Allow access if user owns the workflow OR if user is admin and it's a system workflow
  const isOwner = workflow.userId === session.user.id;
  const isAdminEditingSystem = session.user.role === 'ADMIN' && workflow.isSystemWorkflow;

  if (!isOwner && !isAdminEditingSystem) {
    notFound();
  }

  return (
    <WorkflowConstructor
      data={{
        workflow,
        miniPrompts,
      }}
    />
  );
}
