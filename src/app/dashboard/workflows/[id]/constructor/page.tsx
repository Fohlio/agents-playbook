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

  if (workflow.userId !== session.user.id) {
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
