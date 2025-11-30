'use server';

import { prisma } from '@/server/db/client';
import type {
  CreateWorkflowStageInput,
  UpdateWorkflowStageInput,
  WorkflowStageWithMiniPrompts,
} from '@/shared/lib/types/workflow-constructor-types';
import { jsonValueToStringArray } from '@/shared/lib/utils/prisma-json';

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

  // Convert itemOrder from Prisma JsonValue to string[]
  return {
    ...stage,
    itemOrder: jsonValueToStringArray(stage.itemOrder),
  } as WorkflowStageWithMiniPrompts;
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

  // Convert itemOrder from Prisma JsonValue to string[]
  return {
    ...stage,
    itemOrder: jsonValueToStringArray(stage.itemOrder),
  } as WorkflowStageWithMiniPrompts;
}

export async function deleteWorkflowStage(stageId: string): Promise<void> {
  await prisma.workflowStage.delete({
    where: { id: stageId },
  });
}

export async function getWorkflowStage(
  stageId: string
): Promise<WorkflowStageWithMiniPrompts | null> {
  const stage = await prisma.workflowStage.findUnique({
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

  if (!stage) {
    return null;
  }

  // Convert itemOrder from Prisma JsonValue to string[]
  return {
    ...stage,
    itemOrder: jsonValueToStringArray(stage.itemOrder),
  } as WorkflowStageWithMiniPrompts;
}
