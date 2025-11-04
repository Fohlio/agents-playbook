'use server';

import { prisma } from '@/lib/db/client';
import type {
  AddMiniPromptToStageInput,
  RemoveMiniPromptFromStageInput,
  ReorderStageMiniPromptsInput,
} from '@/lib/types/workflow-constructor-types';

export async function addMiniPromptToStage(
  input: AddMiniPromptToStageInput
): Promise<void> {
  await prisma.stageMiniPrompt.create({
    data: {
      stageId: input.stageId,
      miniPromptId: input.miniPromptId,
      order: input.order,
    },
  });
}

export async function removeMiniPromptFromStage(
  input: RemoveMiniPromptFromStageInput
): Promise<void> {
  await prisma.stageMiniPrompt.delete({
    where: {
      stageId_miniPromptId: {
        stageId: input.stageId,
        miniPromptId: input.miniPromptId,
      },
    },
  });
}

export async function reorderStageMiniPrompts(
  input: ReorderStageMiniPromptsInput
): Promise<void> {
  await prisma.$transaction(
    input.miniPromptOrders.map((item) =>
      prisma.stageMiniPrompt.update({
        where: {
          stageId_miniPromptId: {
            stageId: input.stageId,
            miniPromptId: item.miniPromptId,
          },
        },
        data: {
          order: item.order,
        },
      })
    )
  );
}
