import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { getWorkflowWithStages, getAllPublicMiniPrompts } from '@/features/workflow-constructor/actions/workflow-actions';
import { getAllPhases } from '@/features/workflow-constructor/actions/phase-actions';
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

  const [workflow, phases, miniPrompts] = await Promise.all([
    getWorkflowWithStages(id),
    getAllPhases(),
    getAllPublicMiniPrompts(),
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
        phases,
        miniPrompts,
      }}
    />
  );
}
