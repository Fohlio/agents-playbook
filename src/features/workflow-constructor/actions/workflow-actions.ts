'use server';

import { prisma } from '@/lib/db/client';
import type { MiniPrompt } from '@prisma/client';
import type {
  WorkflowWithStages,
  SaveWorkflowInput,
} from '@/lib/types/workflow-constructor-types';

export async function getWorkflowWithStages(
  workflowId: string
): Promise<WorkflowWithStages | null> {
  return await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      stages: {
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
        orderBy: {
          order: 'asc',
        },
      },
    },
  });
}

export async function getAllAvailableMiniPrompts(userId: string): Promise<MiniPrompt[]> {
  // Fetch owned mini-prompts
  const ownedMiniPrompts = await prisma.miniPrompt.findMany({
    where: { userId },
  });

  // Fetch referenced mini-prompts (in library)
  const referencedMiniPrompts = await prisma.miniPromptReference.findMany({
    where: { userId },
    include: { miniPrompt: true },
  });

  // Combine and deduplicate
  const allMiniPrompts = [
    ...ownedMiniPrompts,
    ...referencedMiniPrompts.map((ref) => ref.miniPrompt),
  ];

  const uniqueMiniPrompts = Array.from(
    new Map(allMiniPrompts.map((mp) => [mp.id, mp])).values()
  );

  return uniqueMiniPrompts.sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveWorkflow(input: SaveWorkflowInput): Promise<WorkflowWithStages> {
  const result = await prisma.$transaction(async (tx) => {
    // Update workflow metadata
    await tx.workflow.update({
      where: { id: input.workflowId },
      data: {
        name: input.name,
        description: input.description,
        complexity: input.complexity,
        isActive: input.isActive,
        visibility: input.visibility,
      },
    });

    // Update tags if provided
    if (input.tagIds !== undefined) {
      await tx.workflowTag.deleteMany({
        where: { workflowId: input.workflowId },
      });
      if (input.tagIds.length > 0) {
        await tx.workflowTag.createMany({
          data: input.tagIds.map((tagId) => ({
            workflowId: input.workflowId,
            tagId,
          })),
        });
      }
    }

    // Delete all existing stages and their mini-prompts (cascade will handle StageMiniPrompt)
    await tx.workflowStage.deleteMany({
      where: { workflowId: input.workflowId },
    });

    // Create new stages with mini-prompts
    for (const stageInput of input.stages) {
      const stage = await tx.workflowStage.create({
        data: {
          workflowId: input.workflowId,
          name: stageInput.name,
          description: stageInput.description,
          color: stageInput.color ?? '#64748b',
          order: stageInput.order,
        },
      });

      // Add mini-prompts to stage
      if (stageInput.miniPrompts.length > 0) {
        await tx.stageMiniPrompt.createMany({
          data: stageInput.miniPrompts.map((mp) => ({
            stageId: stage.id,
            miniPromptId: mp.miniPromptId,
            order: mp.order,
          })),
        });
      }
    }

    // Fetch and return the complete workflow with all relations
    return await tx.workflow.findUniqueOrThrow({
      where: { id: input.workflowId },
      include: {
        stages: {
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
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  });

  return result;
}
