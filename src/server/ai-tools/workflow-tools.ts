import { tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/server/db/client';
import { decryptApiKey } from '@/server/auth/openai-key';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

/**
 * AI Tool: Get current workflow details
 *
 * Fetches the current workflow state from the database with all stages and mini-prompts.
 * Use this tool when you need to understand the current workflow structure before modifying it.
 */
export const getCurrentWorkflow = tool({
  description:
    'IMPORTANT: DO NOT USE THIS TOOL if the workflow context is already in the system prompt under "Current Workflow Context". ' +
    'Only use this to fetch a DIFFERENT workflow by ID (not the one currently being edited). ' +
    'This tool CANNOT fetch unsaved workflows (id="new" or temp-* IDs). ' +
    'For the current workflow being edited, ALL details are already provided in the system prompt.',
  inputSchema: z.object({
    workflowId: z.string().describe('Database ID of a SAVED workflow to fetch (not "new" or temp-* IDs)'),
  }),
  execute: async ({ workflowId }) => {
    console.log('[getCurrentWorkflow] Called with workflowId:', workflowId);

    // Cannot fetch unsaved workflows
    if (workflowId === 'new' || workflowId.startsWith('temp-')) {
      console.log('[getCurrentWorkflow] Unsaved workflow, returning error');
      return {
        error: 'Cannot fetch unsaved workflow. The workflow context is already provided in the system prompt.',
        message: 'This workflow has not been saved yet. Please refer to the workflow context in the system prompt for current details.',
      };
    }

    console.log('[getCurrentWorkflow] Fetching workflow from database');
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
      console.log('[getCurrentWorkflow] Workflow not found in database for ID:', workflowId);
      return {
        error: 'Workflow not found',
        message: `Workflow with ID "${workflowId}" was not found in the database. The workflow context is already provided in the system prompt.`
      };
    }

    console.log('[getCurrentWorkflow] Workflow found:', workflow.name);

    interface StageMiniPromptData {
      miniPrompt: {
        id: string;
        name: string;
        description: string | null;
        content: string;
      };
      order: number;
    }

    interface StageData {
      id: string;
      name: string;
      description: string | null;
      color: string | null;
      withReview: boolean;
      includeMultiAgentChat: boolean;
      order: number;
      miniPrompts: StageMiniPromptData[];
    }

    const stages = workflow.stages.map((stage: StageData) => ({
      id: stage.id,
      name: stage.name,
      description: stage.description,
      color: stage.color,
      withReview: stage.withReview,
      includeMultiAgentChat: stage.includeMultiAgentChat,
      order: stage.order,
      miniPrompts: stage.miniPrompts.map((smp) => ({
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

    return miniPrompts.map((mp: typeof miniPrompts[0]) => ({
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
    tags: z
      .array(z.string())
      .optional()
      .describe('Array of tag names to categorize the workflow (e.g., ["frontend", "testing", "documentation"]). Tags will be created if they don\'t exist.'),
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
          includeMultiAgentChat: z
            .boolean()
            .default(false)
            .describe('Whether to enable multi-agent chat coordination prompts after each mini-prompt in this stage'),
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
    includeMultiAgentChat: z
      .boolean()
      .default(false)
      .describe('Whether to enable multi-agent chat coordination prompts after each mini-prompt in this stage'),
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
 * Supports identification by stageId (for database-saved stages) or stagePosition (for local temporary stages).
 */
export const modifyStage = tool({
  description:
    'Modify an existing workflow stage: update name, description, color, review settings, or change mini-prompts. ' +
    'Use this for targeted edits to a specific stage. Identify stage by stageId (database ID) or stagePosition (0-based index).',
  inputSchema: z.object({
    stageId: z
      .string()
      .optional()
      .describe('Database ID of the stage to modify (use this for saved stages)'),
    stagePosition: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Position/index of the stage to modify (0-based, use this for temporary stages)'),
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
      includeMultiAgentChat: z
        .boolean()
        .optional()
        .describe('Update multi-agent chat setting for this stage'),
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
    // Validate that at least one identifier is provided
    if (!input.stageId && input.stagePosition === undefined) {
      throw new Error('Either stageId or stagePosition must be provided');
    }

    return {
      success: true,
      action: 'modify_stage',
      stageId: input.stageId,
      stagePosition: input.stagePosition,
      updates: input.updates,
      message: input.stageId
        ? `Stage ${input.stageId} will be updated.`
        : `Stage at position ${input.stagePosition} will be updated.`,
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
 * Supports identification by miniPromptId (for saved prompts) or by stage/mini-prompt position (for temporary prompts in workflow constructor).
 */
export const modifyMiniPrompt = tool({
  description:
    'Modify an existing mini-prompt: update name, description, or content. ' +
    'Identify by miniPromptId (database ID) or by stagePosition + miniPromptPosition (0-based indexes in workflow constructor).',
  inputSchema: z.object({
    miniPromptId: z
      .string()
      .optional()
      .describe('Database ID of the mini-prompt to modify (use this for saved mini-prompts)'),
    stagePosition: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Position of the stage containing the mini-prompt (0-based, use with miniPromptPosition)'),
    miniPromptPosition: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe('Position of the mini-prompt within the stage (0-based, use with stagePosition)'),
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
    // Validate that proper identification is provided
    if (!input.miniPromptId && (input.stagePosition === undefined || input.miniPromptPosition === undefined)) {
      throw new Error('Either miniPromptId or both stagePosition and miniPromptPosition must be provided');
    }

    // Build a descriptive message including the new name if being updated
    let message = '';
    if (input.updates.name) {
      message = `Mini-prompt "${input.updates.name}" will be updated`;
    } else {
      message = `Mini-prompt will be updated`;
    }

    if (input.miniPromptId) {
      message += ` (ID: ${input.miniPromptId})`;
    } else {
      message += ` at stage ${input.stagePosition}, position ${input.miniPromptPosition}`;
    }

    message += '.';

    return {
      success: true,
      action: 'modify_mini_prompt',
      miniPromptId: input.miniPromptId,
      stagePosition: input.stagePosition,
      miniPromptPosition: input.miniPromptPosition,
      updates: input.updates,
      message,
    };
  },
});

/**
 * AI Tool: Update workflow settings
 *
 * Updates global workflow settings like name, description, complexity, multi-agent chat, and visibility.
 * All parameters are optional - only provide the settings you want to update.
 */
export const updateWorkflowSettings = tool({
  description:
    'Update workflow-level settings: name, description, complexity, multi-agent chat, or visibility. ' +
    'Use this when the user wants to change workflow metadata without modifying stages or mini-prompts.',
  inputSchema: z.object({
    name: z
      .string()
      .min(1)
      .max(255)
      .optional()
      .describe('New workflow name (1-255 characters)'),
    description: z
      .string()
      .optional()
      .describe('New workflow description'),
    complexity: z
      .enum(['XS', 'S', 'M', 'L', 'XL'])
      .optional()
      .describe('New complexity level: XS (very simple), S (simple), M (medium), L (large), XL (very large)'),
    includeMultiAgentChat: z
      .boolean()
      .optional()
      .describe('Whether to include multi-agent chat coordination after each mini-prompt'),
    visibility: z
      .enum(['PUBLIC', 'PRIVATE'])
      .optional()
      .describe('Workflow visibility: PUBLIC (discoverable by all) or PRIVATE (user-only)'),
  }),
  execute: async (input) => {
    return {
      success: true,
      action: 'update_workflow_settings',
      updates: input,
      message: 'Workflow settings will be updated.',
    };
  },
});

/**
 * AI Tool: Translate mini-prompt to a different language
 *
 * Translates the content of a mini-prompt to a target language while preserving
 * all structure, formatting, and wordings. Only the language changes.
 */
export const translateMiniPrompt = tool({
  description:
    'Translate a mini-prompt to a different language while preserving all structure, formatting, markdown, and wordings. ' +
    'Only the language changes - everything else stays exactly the same. ' +
    'Use this when the user wants to translate the currently opened mini-prompt.',
  inputSchema: z.object({
    miniPromptId: z
      .string()
      .describe('Database ID of the mini-prompt to translate (use the currently opened mini-prompt ID from context)'),
    targetLanguage: z
      .string()
      .min(1)
      .describe('Target language name (e.g., "Spanish", "French", "German", "Japanese", "Russian", etc.)'),
  }),
  execute: async ({ miniPromptId, targetLanguage }) => {
    try {
      // Fetch the mini-prompt
      const miniPrompt = await prisma.miniPrompt.findUnique({
        where: { id: miniPromptId },
        select: {
          id: true,
          name: true,
          description: true,
          content: true,
          userId: true,
        },
      });

      if (!miniPrompt) {
        return {
          success: false,
          error: 'Mini-prompt not found',
          message: `Mini-prompt with ID "${miniPromptId}" was not found.`,
        };
      }

      // Get user's API key
      const user = await prisma.user.findUnique({
        where: { id: miniPrompt.userId },
        select: { openaiApiKey: true, role: true },
      });

      let apiKey: string | undefined;
      if (user?.role === 'ADMIN') {
        apiKey = process.env.OPENAI_API_KEY;
      } else if (user?.openaiApiKey) {
        try {
          apiKey = await decryptApiKey(user.openaiApiKey);
        } catch (error) {
          console.error('[translateMiniPrompt] Failed to decrypt API key:', error);
          return {
            success: false,
            error: 'API key decryption failed',
            message: 'Unable to access OpenAI API key. Please check your settings.',
          };
        }
      }

      if (!apiKey) {
        return {
          success: false,
          error: 'OpenAI API key not configured',
          message: 'OpenAI API key is required for translation. Please configure it in settings.',
        };
      }

      // Use OpenAI to translate the content
      const openai = createOpenAI({ apiKey });
      
      const translationPrompt = `Translate the following markdown content to ${targetLanguage}. 
IMPORTANT: 
- Preserve ALL markdown formatting exactly (headers, lists, code blocks, etc.)
- Keep ALL structure and organization identical
- Maintain ALL technical terms, placeholders, and special formatting
- Only translate the natural language text, not code, markdown syntax, or technical identifiers
- Preserve line breaks and spacing exactly

Content to translate:
${miniPrompt.content}`;

      const result = await generateText({
        model: openai('gpt-4o'),
        messages: [
          {
            role: 'user',
            content: translationPrompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent translation
      });

      const translatedContent = result.text;

      // Return result that will trigger modifyMiniPrompt action
      return {
        success: true,
        action: 'modify_mini_prompt',
        miniPromptId: miniPrompt.id,
        updates: {
          content: translatedContent,
        },
        message: `Mini-prompt "${miniPrompt.name}" has been translated to ${targetLanguage}. The translated content will be applied.`,
      };
    } catch (error) {
      console.error('[translateMiniPrompt] Error:', error);
      return {
        success: false,
        error: 'Translation failed',
        message: error instanceof Error ? error.message : 'An unknown error occurred during translation.',
      };
    }
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
  updateWorkflowSettings,
  // Translation tool
  translateMiniPrompt,
};
