import { notFound } from 'next/navigation';
import { auth } from '@/server/auth/auth';
import { getWorkflowWithStages, getAllAvailableMiniPrompts } from '@/views/workflow-constructor/actions/workflow-actions';
import { WorkflowConstructor } from '@/views/workflow-constructor/components/WorkflowConstructor';
import { prisma } from '@/server/db/client';

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
    // Also allow access if workflow is public or user has a reference (read-only)
    const isPublic = workflow.visibility === 'PUBLIC';
    const hasReference = await prisma.workflowReference.findFirst({
      where: { workflowId: id, userId: session.user.id },
      select: { id: true },
    });

    if (!isPublic && !hasReference) {
      notFound();
    }
  }

  const readOnly = !isOwner && !isAdminEditingSystem;

  return (
    <WorkflowConstructor
      data={{
        workflow,
        miniPrompts,
      }}
      readOnly={readOnly}
    />
  );
}
