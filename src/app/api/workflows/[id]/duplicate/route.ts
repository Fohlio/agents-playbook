import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/client';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Get the original workflow with all its data
  const originalWorkflow = await prisma.workflow.findUnique({
    where: { id },
    include: {
      stages: {
        orderBy: { order: 'asc' },
        include: {
          miniPrompts: {
            orderBy: { order: 'asc' },
            include: {
              miniPrompt: true,
            },
          },
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!originalWorkflow) {
    return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
  }

  // Check if user has access (owns it, it's public, or has it in library)
  const hasAccess =
    originalWorkflow.userId === session.user.id ||
    originalWorkflow.visibility === 'PUBLIC' ||
    (await prisma.workflowReference.findFirst({
      where: {
        workflowId: id,
        userId: session.user.id,
      },
    }));

  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get the highest position for the user's workflows
  const maxPosition = await prisma.workflow.findFirst({
    where: { userId: session.user.id },
    orderBy: { position: 'desc' },
    select: { position: true },
  });

  // Create duplicate workflow
  const duplicatedWorkflow = await prisma.$transaction(async (tx) => {
    // Create the new workflow
    const newWorkflow = await tx.workflow.create({
      data: {
        userId: session.user.id,
        name: `${originalWorkflow.name} (Copy)`,
        description: originalWorkflow.description,
        yamlContent: originalWorkflow.yamlContent,
        visibility: 'PRIVATE', // Always private when duplicated
        isActive: false, // Inactive by default
        isSystemWorkflow: false, // Never a system workflow
        complexity: originalWorkflow.complexity,
        includeMultiAgentChat: originalWorkflow.includeMultiAgentChat,
        position: (maxPosition?.position ?? 0) + 1,
      },
    });

    // Duplicate stages and mini-prompts
    for (const stage of originalWorkflow.stages) {
      const newStage = await tx.workflowStage.create({
        data: {
          workflowId: newWorkflow.id,
          name: stage.name,
          description: stage.description,
          color: stage.color,
          order: stage.order,
          withReview: stage.withReview,
        },
      });

      // Duplicate stage mini-prompts
      if (stage.miniPrompts.length > 0) {
        await tx.stageMiniPrompt.createMany({
          data: stage.miniPrompts.map((smp) => ({
            stageId: newStage.id,
            miniPromptId: smp.miniPromptId,
            order: smp.order,
          })),
        });
      }
    }

    // Duplicate tags
    if (originalWorkflow.tags.length > 0) {
      await tx.workflowTag.createMany({
        data: originalWorkflow.tags.map((wt) => ({
          workflowId: newWorkflow.id,
          tagId: wt.tagId,
        })),
      });
    }

    return newWorkflow;
  });

  return NextResponse.json(duplicatedWorkflow);
}
