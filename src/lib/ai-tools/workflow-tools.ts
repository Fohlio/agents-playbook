import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/db/client';

/**
 * AI Tool: Get current workflow details
 *
 * Fetches the current workflow state from the database with all stages and mini-prompts.
 * Use this tool when you need to understand the current workflow structure before modifying it.
 */
export const getCurrentWorkflow = tool({
  description:
    'Get the current workflow details including all stages and mini-prompts. ' +
    'Use this tool to understand the current workflow structure before suggesting modifications.',
  inputSchema: z.object({
    workflowId: z.string().describe('The ID of the workflow to fetch'),
  }),
  execute: async ({ workflowId }) => {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        stages: {
          include: {
            miniPrompts: {
              include: {
                miniPrompt: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    content: true,
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!workflow) {
      return 'Workflow not found';
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stages = workflow.stages.map((stage: any) => ({
      id: stage.id,
      name: stage.name,
      description: stage.description,
      color: stage.color,
      withReview: stage.withReview,
      order: stage.order,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      miniPrompts: stage.miniPrompts.map((smp: any) => ({
        id: smp.miniPrompt.id,
        name: smp.miniPrompt.name,
        description: smp.miniPrompt.description,
        content: smp.miniPrompt.content,
        order: smp.order,
      })),
    }));

    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      complexity: workflow.complexity,
      includeMultiAgentChat: workflow.includeMultiAgentChat,
      stages,
    };
  },
});

/**
 * AI Tool: Get available mini-prompts
 *
 * Fetches the list of available mini-prompts that can be added to the workflow.
 * Use this tool to see what mini-prompts are available in the library.
 */
export const getAvailableMiniPrompts = tool({
  description:
    'Get the list of available mini-prompts that can be added to the workflow. ' +
    'Returns mini-prompts owned by the user or public system mini-prompts.',
  inputSchema: z.object({
    userId: z.string().describe('The ID of the current user'),
    search: z.string().optional().describe('Optional search term to filter mini-prompts'),
  }),
  execute: async ({ userId, search }) => {
    const miniPrompts = await prisma.miniPrompt.findMany({
      where: {
        isActive: true,
        OR: [
          { userId: userId },
          { isSystemMiniPrompt: true },
        ],
        ...(search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        } : {}),
      },
      select: {
        id: true,
        name: true,
        description: true,
        isSystemMiniPrompt: true,
      },
      orderBy: [
        { isSystemMiniPrompt: 'desc' },
        { name: 'asc' },
      ],
      take: 50,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return miniPrompts.map((mp: any) => ({
      id: mp.id,
      name: mp.name,
      description: mp.description,
      isSystem: mp.isSystemMiniPrompt,
    }));
  },
});

/**
 * AI Tool: Create or modify a complete workflow
 *
 * This tool allows the AI to create a new workflow structure with stages and mini-prompts.
 * The result is returned to the client for user approval before saving.
 */
export const createWorkflow = tool({
  description:
    'Create or modify a complete workflow with stages and mini-prompts. ' +
    'Use this when the user wants to create a new workflow or make major structural changes. ' +
    'Returns the complete workflow structure for user approval.',
  inputSchema: z.object({
    name: z
      .string()
      .min(1)
      .max(255)
      .describe('Workflow name (1-255 characters)'),
    description: z
      .string()
      .optional()
      .describe('Detailed workflow description'),
    complexity: z
      .enum(['XS', 'S', 'M', 'L', 'XL'])
      .optional()
      .describe('Workflow complexity level: XS (very simple), S (simple), M (medium), L (large), XL (very large)'),
    includeMultiAgentChat: z
      .boolean()
      .default(false)
      .describe('Whether to include multi-agent chat coordination after each mini-prompt'),
    stages: z
      .array(
        z.object({
          name: z
            .string()
            .min(1)
            .max(255)
            .describe('Stage name (1-255 characters)'),
          description: z
            .string()
            .optional()
            .describe('Stage description'),
          color: z
            .string()
            .optional()
            .describe('Stage color for visual identification (hex color or named color)'),
          withReview: z
            .boolean()
            .default(true)
            .describe('Whether to include review/memory board at the end of this stage'),
          miniPrompts: z
            .array(
              z.object({
                id: z
                  .string()
                  .optional()
                  .describe('Existing mini-prompt ID (if reusing existing prompt)'),
                name: z
                  .string()
                  .min(1)
                  .max(255)
                  .describe('Mini-prompt name'),
                description: z
                  .string()
                  .optional()
                  .describe('Mini-prompt description'),
                content: z
                  .string()
                  .optional()
                  .describe('Mini-prompt markdown content (required if creating new prompt)'),
              })
            )
            .min(1)
            .describe('Mini-prompts for this stage (at least 1 required)'),
        })
      )
      .min(1)
      .describe('Workflow stages (at least 1 required)'),
  }),
  execute: async (input) => {

    // This tool returns the structure for client approval
    // The client will handle saving to the database
    return {
      success: true,
      workflow: input,
      message: `Workflow "${input.name}" created with ${input.stages.length} stage(s). Review and save when ready.`,
    };
  },
});

/**
 * AI Tool: Add a new stage to existing workflow
 *
 * Adds a new stage at a specific position in the workflow.
 */
export const addStage = tool({
  description:
    'Add a new stage to the current workflow at a specific position. ' +
    'Use this when the user wants to add a stage without recreating the entire workflow.',
  inputSchema: z.object({
    name: z
      .string()
      .min(1)
      .max(255)
      .describe('Stage name (1-255 characters)'),
    description: z
      .string()
      .optional()
      .describe('Stage description'),
    color: z
      .string()
      .optional()
      .describe('Stage color for visual identification'),
    withReview: z
      .boolean()
      .default(true)
      .describe('Whether to include review/memory board at the end of this stage'),
    position: z
      .number()
      .int()
      .min(0)
      .describe('Position to insert the stage (0 = first, -1 = last)'),
    miniPrompts: z
      .array(
        z.object({
          id: z
            .string()
            .optional()
            .describe('Existing mini-prompt ID'),
          name: z
            .string()
            .min(1)
            .max(255)
            .describe('Mini-prompt name'),
          description: z
            .string()
            .optional()
            .describe('Mini-prompt description'),
          content: z
            .string()
            .optional()
            .describe('Mini-prompt content (required if creating new)'),
        })
      )
      .min(1)
      .describe('Mini-prompts for this stage'),
  }),
  execute: async (input) => {

    return {
      success: true,
      action: 'add_stage',
      stage: input,
      message: `Stage "${input.name}" will be added at position ${input.position === -1 ? 'end' : input.position}.`,
    };
  },
});

/**
 * AI Tool: Modify an existing stage
 *
 * Updates stage properties or reorders/adds/removes mini-prompts within a stage.
 */
export const modifyStage = tool({
  description:
    'Modify an existing workflow stage: update name, description, color, review settings, or change mini-prompts. ' +
    'Use this for targeted edits to a specific stage.',
  inputSchema: z.object({
    stageIndex: z
      .number()
      .int()
      .min(0)
      .describe('Index of the stage to modify (0-based)'),
    updates: z.object({
      name: z
        .string()
        .min(1)
        .max(255)
        .optional()
        .describe('New stage name'),
      description: z
        .string()
        .optional()
        .describe('New stage description'),
      color: z
        .string()
        .optional()
        .describe('New stage color'),
      withReview: z
        .boolean()
        .optional()
        .describe('Update review setting'),
      miniPrompts: z
        .array(
          z.object({
            id: z.string().optional(),
            name: z.string().min(1).max(255),
            description: z.string().optional(),
            content: z.string().optional(),
          })
        )
        .optional()
        .describe('Replacement mini-prompts list (replaces all existing prompts in stage)'),
    }),
  }),
  execute: async (input) => {

    return {
      success: true,
      action: 'modify_stage',
      stageIndex: input.stageIndex,
      updates: input.updates,
      message: `Stage at index ${input.stageIndex} will be updated.`,
    };
  },
});

/**
 * AI Tool: Remove a stage from workflow
 *
 * Removes a stage at a specific index.
 */
export const removeStage = tool({
  description:
    'Remove a stage from the workflow by its index. ' +
    'Use this when the user wants to delete a stage.',
  inputSchema: z.object({
    stageIndex: z
      .number()
      .int()
      .min(0)
      .describe('Index of the stage to remove (0-based)'),
  }),
  execute: async (input) => {

    return {
      success: true,
      action: 'remove_stage',
      stageIndex: input.stageIndex,
      message: `Stage at index ${input.stageIndex} will be removed.`,
    };
  },
});

/**
 * AI Tool: Create a standalone mini-prompt
 *
 * Creates a new mini-prompt that can be used independently or added to workflows.
 */
export const createMiniPrompt = tool({
  description:
    'Create a new standalone mini-prompt that can be reused across workflows. ' +
    'Use this when the user wants to create a reusable prompt template.',
  inputSchema: z.object({
    name: z
      .string()
      .min(1)
      .max(255)
      .describe('Mini-prompt name (1-255 characters)'),
    description: z
      .string()
      .max(1000)
      .optional()
      .describe('Mini-prompt description (max 1000 characters)'),
    content: z
      .string()
      .min(1)
      .describe('Mini-prompt content in markdown format'),
    tags: z
      .array(z.string())
      .optional()
      .describe('Tags for categorization'),
  }),
  execute: async (input) => {

    return {
      success: true,
      miniPrompt: input,
      message: `Mini-prompt "${input.name}" created. Review and save when ready.`,
    };
  },
});

/**
 * AI Tool: Modify an existing mini-prompt
 *
 * Updates the content, name, or description of an existing mini-prompt.
 */
export const modifyMiniPrompt = tool({
  description:
    'Modify an existing mini-prompt: update name, description, or content. ' +
    'Use this when editing a mini-prompt in the library or within a workflow context.',
  inputSchema: z.object({
    miniPromptId: z
      .string()
      .optional()
      .describe('ID of the mini-prompt to modify (if known)'),
    updates: z.object({
      name: z
        .string()
        .min(1)
        .max(255)
        .optional()
        .describe('New mini-prompt name'),
      description: z
        .string()
        .max(1000)
        .optional()
        .describe('New mini-prompt description'),
      content: z
        .string()
        .min(1)
        .optional()
        .describe('New mini-prompt content in markdown'),
      tags: z
        .array(z.string())
        .optional()
        .describe('Updated tags'),
    }),
  }),
  execute: async (input) => {

    return {
      success: true,
      action: 'modify_mini_prompt',
      miniPromptId: input.miniPromptId,
      updates: input.updates,
      message: input.miniPromptId
        ? `Mini-prompt ${input.miniPromptId} will be updated.`
        : 'Mini-prompt will be updated.',
    };
  },
});

/**
 * Workflow AI Tools Collection
 *
 * Export all workflow-related AI tools as a single object
 * for use with the AI SDK's streamText function.
 */
export const workflowTools = {
  // Data fetching tools
  getCurrentWorkflow,
  getAvailableMiniPrompts,
  // Modification tools
  createWorkflow,
  addStage,
  modifyStage,
  removeStage,
  createMiniPrompt,
  modifyMiniPrompt,
};
