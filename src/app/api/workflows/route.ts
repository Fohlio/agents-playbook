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
    const workflows = await prisma.workflow.findMany({
      where: { isSystemWorkflow: true },
      include: {
        _count: {
          select: { stages: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(workflows);
  }

  // Get workflows owned by user
  const ownedWorkflows = await prisma.workflow.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { stages: true },
      },
    },
  });

  // Get workflow references (imported workflows)
  const workflowReferences = await prisma.workflowReference.findMany({
    where: { userId: session.user.id },
    include: {
      workflow: {
        include: {
          _count: {
            select: { stages: true },
          },
        },
      },
    },
  });

  // Mark owned vs imported workflows
  const ownedWithFlag = ownedWorkflows.map((w) => ({
    ...w,
    isOwned: true,
    referenceId: null,
    isSystemWorkflow: w.isSystemWorkflow
  }));
  const referencedWithFlag = workflowReferences.map((ref) => ({
    ...ref.workflow,
    isOwned: false,
    referenceId: ref.id,
    isSystemWorkflow: ref.workflow.isSystemWorkflow,
  }));

  const allWorkflows = [...ownedWithFlag, ...referencedWithFlag];

  // Remove duplicates and sort by updatedAt
  const uniqueWorkflows = Array.from(
    new Map(allWorkflows.map((w) => [w.id, w])).values()
  ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  return NextResponse.json(uniqueWorkflows);
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  const workflow = await prisma.workflow.create({
    data: {
      userId: session.user.id,
      name: body.name || 'Untitled Workflow',
      description: body.description || null,
      yamlContent: null,
      visibility: 'PRIVATE',
      isActive: body.isActive || false,
    },
  });

  if (body.tagIds && body.tagIds.length > 0) {
    await prisma.workflowTag.createMany({
      data: body.tagIds.map((tagId: string) => ({
        workflowId: workflow.id,
        tagId
      }))
    });
  }

  return NextResponse.json(workflow);
}
