'use server';

import { prisma } from '@/lib/db/client';
import type {
  CreateWorkflowStageInput,
  UpdateWorkflowStageInput,
  WorkflowStageWithMiniPrompts,
} from '@/lib/types/workflow-constructor-types';

export async function createWorkflowStage(
  input: CreateWorkflowStageInput
): Promise<WorkflowStageWithMiniPrompts> {
  const stage = await prisma.workflowStage.create({
    data: {
      workflowId: input.workflowId,
      name: input.name,
      description: input.description,
      color: input.color ?? '#64748b', // Default gray color
      order: input.order,
    },
    include: {
      miniPrompts: {
        include: {
          miniPrompt: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  return stage;
}

export async function updateWorkflowStage(
  input: UpdateWorkflowStageInput
): Promise<WorkflowStageWithMiniPrompts> {
  const stage = await prisma.workflowStage.update({
    where: { id: input.id },
    data: {
      name: input.name,
      description: input.description,
      color: input.color,
      order: input.order,
    },
    include: {
      miniPrompts: {
        include: {
          miniPrompt: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  return stage;
}

export async function deleteWorkflowStage(stageId: string): Promise<void> {
  await prisma.workflowStage.delete({
    where: { id: stageId },
  });
}

export async function getWorkflowStage(
  stageId: string
): Promise<WorkflowStageWithMiniPrompts | null> {
  return await prisma.workflowStage.findUnique({
    where: { id: stageId },
    include: {
      miniPrompts: {
        include: {
          miniPrompt: true,
        },
        orderBy: {
          order: 'asc',
        },
      },
    },
  });
}
