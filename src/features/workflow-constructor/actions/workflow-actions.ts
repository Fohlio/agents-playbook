'use server';

import { prisma } from '@/lib/db/client';
import type { MiniPrompt, WorkflowComplexity } from '@prisma/client';
import type {
  WorkflowWithStages,
  SaveWorkflowInput,
} from '@/lib/types/workflow-constructor-types';
import { userWorkflowEmbeddings } from '@/lib/embeddings/user-workflow-embeddings';
import { triggerMiniPromptEmbedding } from '@/features/mini-prompts/lib/embedding-service';

export async function getWorkflowWithStages(
  workflowId: string
): Promise<WorkflowWithStages | null> {
  return await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
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
  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const isAdmin = user?.role === 'ADMIN';

  // Fetch owned mini-prompts
  const ownedMiniPrompts = await prisma.miniPrompt.findMany({
    where: { userId },
  });

  // Fetch referenced mini-prompts (in library)
  const referencedMiniPrompts = await prisma.miniPromptReference.findMany({
    where: { userId },
    include: { miniPrompt: true },
  });

  // For admin users, also fetch all system prompts
  const systemPrompts = isAdmin
    ? await prisma.miniPrompt.findMany({
        where: { isSystemMiniPrompt: true },
      })
    : [];

  // Combine and deduplicate
  const allMiniPrompts = [
    ...ownedMiniPrompts,
    ...referencedMiniPrompts.map((ref) => ref.miniPrompt),
    ...systemPrompts,
  ];

  const uniqueMiniPrompts = Array.from(
    new Map(allMiniPrompts.map((mp) => [mp.id, mp])).values()
  );

  return uniqueMiniPrompts.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createWorkflow(input: {
  name: string;
  userId: string;
  description?: string;
  complexity?: WorkflowComplexity;
  isActive?: boolean;
  visibility?: 'PUBLIC' | 'PRIVATE';
  includeMultiAgentChat?: boolean;
  tagIds?: string[];
  newTagNames?: string[]; // New tags to create
  tempMiniPrompts?: Record<string, { name: string; description: string; content: string; visibility: 'PUBLIC' | 'PRIVATE' }>; // Temp mini-prompts to create
  stages: Array<{
    name: string;
    description?: string;
    color?: string;
    order: number;
    withReview?: boolean;
    includeMultiAgentChat?: boolean;
    miniPrompts: Array<{
      miniPromptId: string;
      order: number;
    }>;
  }>;
}): Promise<{ success: boolean; workflowId?: string; error?: string }> {
  console.log('[createWorkflow] Starting with input:', JSON.stringify(input, null, 2));

  try {
    console.log('[createWorkflow] Starting transaction');
    const createdMiniPromptIds: string[] = []; // Collect IDs to generate embeddings after commit
    const workflow = await prisma.$transaction(async (tx) => {
      // First, create temp mini-prompts
      const miniPromptIdMap = new Map<string, string>(); // temp ID -> real ID

      if (input.tempMiniPrompts) {
        console.log('[createWorkflow] Creating', Object.keys(input.tempMiniPrompts).length, 'temp mini-prompts');
        for (const [tempId, mpData] of Object.entries(input.tempMiniPrompts)) {
          console.log('[createWorkflow] Creating mini-prompt:', tempId, mpData.name);
          const createdMiniPrompt = await tx.miniPrompt.create({
            data: {
              name: mpData.name,
              description: mpData.description,
              content: mpData.content,
              visibility: mpData.visibility,
              userId: input.userId,
              isActive: true,
              isSystemMiniPrompt: false,
              position: 0,
            },
          });
          miniPromptIdMap.set(tempId, createdMiniPrompt.id);
          createdMiniPromptIds.push(createdMiniPrompt.id); // Collect ID for embedding generation after commit
          console.log('[createWorkflow] Created mini-prompt:', tempId, '->', createdMiniPrompt.id);
        }
      }

      console.log('[createWorkflow] Creating workflow');
      // Create workflow
      const newWorkflow = await tx.workflow.create({
        data: {
          name: input.name,
          userId: input.userId,
          description: input.description,
          complexity: input.complexity,
          isActive: input.isActive ?? false,
          visibility: input.visibility ?? 'PRIVATE',
          includeMultiAgentChat: input.includeMultiAgentChat ?? false,
          position: 0,
        },
      });
      console.log('[createWorkflow] Workflow created:', newWorkflow.id);

      // Create new tags if provided
      const createdTagIds: string[] = [];
      if (input.newTagNames && input.newTagNames.length > 0) {
        console.log('[createWorkflow] Creating new tags:', input.newTagNames);
        for (const tagName of input.newTagNames) {
          const existingTag = await tx.tag.findFirst({
            where: { name: tagName },
          });

          if (existingTag) {
            createdTagIds.push(existingTag.id);
          } else {
            const newTag = await tx.tag.create({
              data: {
                name: tagName,
                color: null,
                isActive: true,
                createdBy: input.userId,
              },
            });
            createdTagIds.push(newTag.id);
          }
        }
      }

      // Add tags (existing + newly created)
      const allTagIds = [...(input.tagIds || []), ...createdTagIds];
      if (allTagIds.length > 0) {
        console.log('[createWorkflow] Adding tags:', allTagIds);
        await tx.workflowTag.createMany({
          data: allTagIds.map((tagId) => ({
            workflowId: newWorkflow.id,
            tagId,
          })),
        });
      }

      // Create stages with mini-prompts
      console.log('[createWorkflow] Creating', input.stages.length, 'stages');
      for (const stageInput of input.stages) {
        console.log('[createWorkflow] Creating stage:', stageInput.name);
        const stage = await tx.workflowStage.create({
          data: {
            workflowId: newWorkflow.id,
            name: stageInput.name,
            description: stageInput.description,
            color: stageInput.color ?? '#64748b',
            order: stageInput.order,
            withReview: stageInput.withReview ?? true,
            includeMultiAgentChat: stageInput.includeMultiAgentChat ?? false,
          },
        });
        console.log('[createWorkflow] Stage created:', stage.id);

        // Add mini-prompts to stage
        if (stageInput.miniPrompts.length > 0) {
          console.log('[createWorkflow] Adding', stageInput.miniPrompts.length, 'mini-prompts to stage');
          await tx.stageMiniPrompt.createMany({
            data: stageInput.miniPrompts.map((mp) => ({
              stageId: stage.id,
              // Replace temp IDs with real IDs created earlier
              miniPromptId: miniPromptIdMap.get(mp.miniPromptId) || mp.miniPromptId,
              order: mp.order,
            })),
          });
        }
      }

      console.log('[createWorkflow] Transaction complete');
      return newWorkflow;
    });

    console.log('[createWorkflow] Success! Workflow ID:', workflow.id);
    
    // Trigger embedding generation AFTER transaction commit (fire-and-forget)
    // Generate embeddings for workflow
    userWorkflowEmbeddings.syncWorkflowEmbedding(workflow.id).catch((error) => {
      console.error('[createWorkflow] Failed to generate workflow embedding:', error);
    });
    
    // Generate embeddings for temp mini-prompts created during transaction
    for (const miniPromptId of createdMiniPromptIds) {
      triggerMiniPromptEmbedding(miniPromptId);
    }
    
    return { success: true, workflowId: workflow.id };
  } catch (error) {
    console.error('[createWorkflow] Error creating workflow:', error);
    console.error('[createWorkflow] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return { success: false, error: 'Failed to create workflow' };
  }
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
        includeMultiAgentChat: input.includeMultiAgentChat ?? false,
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
          withReview: stageInput.withReview ?? true,
          includeMultiAgentChat: stageInput.includeMultiAgentChat ?? false,
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

  // Trigger embedding regeneration AFTER transaction commit if name, description, or tags changed
  if (input.name !== undefined || input.description !== undefined || input.tagIds !== undefined) {
    userWorkflowEmbeddings.syncWorkflowEmbedding(input.workflowId).catch((error) => {
      console.error('[saveWorkflow] Failed to regenerate embedding:', error);
    });
  }

  return result;
}
