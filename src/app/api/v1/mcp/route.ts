import { createMcpHandler } from '@vercel/mcp-adapter';
import { config } from 'dotenv';
import { NextRequest } from 'next/server';
import { z } from 'zod';
// Import database services directly
import { dbSemanticSearch } from '@/server/workflows/db-semantic-search';
import { unifiedWorkflowService } from '@/server/workflows/unified-workflow-service';
import { executionPlanBuilder } from '@/server/mcp-tools-db/execution-plan-builder';
// Import auth helpers
import { getUserId, extractUserIdFromRequest, userIdStorage } from '@/server/mcp-tools-db/mcp-auth-helpers';
// Import CRUD handlers
import {
  getWorkflowToolSchema,
  getWorkflowHandler,
  addWorkflowToolSchema,
  addWorkflowHandler,
  editWorkflowToolSchema,
  editWorkflowHandler,
  // Folder tools
  getByFolderToolSchema,
  getByFolderHandler,
  createFolderToolSchema,
  createFolderHandler,
} from '@/server/mcp-tools-db';
// Import skill handlers
import { getSkillsToolSchema, getSkillsHandler } from '@/server/mcp-tools-db/get-skills-handler';
import { getSelectedSkillToolSchema, getSelectedSkillHandler } from '@/server/mcp-tools-db/get-selected-skill-handler';
import { addSkillToolSchema, addSkillHandler } from '@/server/mcp-tools-db/add-skill-handler';
import { editSkillToolSchema, editSkillHandler } from '@/server/mcp-tools-db/edit-skill-handler';
// Load environment variables
config();

// Use Node.js runtime for database access and auth
export const runtime = 'nodejs';

const handler = createMcpHandler(
  (server) => {
    // Tool 1: Get available workflows using database semantic search
    // - No auth: Returns public system workflows from database
    // - With auth: Returns active workflows from user's library + system workflows
    server.tool(
      'get_available_workflows',
      'Get workflow recommendations. Without auth: public system workflows. With auth: active workflows from your library.',
      {
        task_description: z.string().describe('Description of the task to find workflows for')
      },
      async ({ task_description }) => {
        const userId = await getUserId();

        try {
          // Use database semantic search directly with userId
          const results = await dbSemanticSearch.searchWorkflows(task_description, 5, userId || undefined);

          if (results.length === 0) {
            return {
              content: [{
                type: "text" as const,
                text: `No relevant workflows found for "${task_description}". ${userId ? 'Try creating a custom workflow or check system workflows.' : 'Try different search terms or authenticate to see user workflows.'}`
              }]
            };
          }

          // Format results
          const formattedResults = results.map((workflow, index: number) => {
            const sourceIndicator = workflow.source === 'system' ? '[SYSTEM]' : '[USER]';
            const complexity = workflow.complexity === 'low' ? '🟢' : workflow.complexity === 'medium' ? '🟡' : '🔴';
            const similarity = Math.round(workflow.similarity * 100);

            return `${index + 1}. ${sourceIndicator} **${workflow.title}** ${complexity} (${similarity}% match)\n   ${workflow.description}\n   📁 ${workflow.category} | 🏷️ ${workflow.tags.join(', ')}`;
          });

          const matchQuality = results[0].similarity >= 0.8 ? '🎯' : results[0].similarity >= 0.6 ? '✅' : results[0].similarity >= 0.4 ? '👍' : '🤔';

          return {
            content: [{
              type: "text" as const,
              text: `Found ${results.length} workflows for "${task_description}" ${matchQuality}:\n\n${formattedResults.join('\n\n')}\n\n**Next Steps:**\nUse \`select_workflow\` with one of these workflow IDs: ${results.map(w => `"${w.id}"`).join(', ')}`
            }]
          };
        } catch (error) {
          console.error('[MCP-DB] Error in workflow search:', error);
          return {
            content: [{
              type: "text" as const,
              text: 'Error: Failed to search workflows. Please try again.'
            }]
          };
        }
      },
    );

    // Tool 2: Select workflow - returns full content from database
    server.tool(
      'select_workflow',
      'Get complete workflow details including all steps',
      {
        workflow_id: z.string().describe('ID of the workflow to select')
      },
      async ({ workflow_id }) => {
        // Get userId from session or API token
        const userId = await getUserId();
        
        // Call handler with userId extracted from auth
        // We create a modified version that accepts userId directly
        try {
          const workflow = await unifiedWorkflowService.getWorkflowById(workflow_id, userId || undefined);

          if (!workflow) {
            return {
              content: [{
                type: "text" as const,
                text: `Workflow "${workflow_id}" not found or you don't have access to it.`
              }]
            };
          }

          const executionPlan = await executionPlanBuilder.buildExecutionPlan(workflow_id);
          const sourceIndicator = workflow.source === 'system' ? '[SYSTEM WORKFLOW]' : '[USER WORKFLOW]';

          let response = `${sourceIndicator}\n\n# ${workflow.name}\n\n${workflow.description || 'No description available.'}\n\n`;

          if (executionPlan) {
            response += `## Execution Plan\n\n`;
            response += executionPlanBuilder.formatExecutionPlan(executionPlan);
            response += `\n\n---\n\n`;
            response += `## Workflow Execution Instructions\n\n`;
            response += `**⚠️ Important:** This workflow consists of ${executionPlan.totalSteps} sequential steps. `;
            response += `After completing each step, you must automatically proceed to the next step in the workflow. `;
            response += `Use the \`get_next_step\` tool with the workflow ID and the next step number to continue. `;
            response += `Do not skip steps or stop until all steps are completed.\n\n`;
          }

          return {
            content: [{
              type: "text" as const,
              text: response
            }]
          };
        } catch (error) {
          console.error('[MCP-DB] Error selecting workflow:', error);
          return {
            content: [{
              type: "text" as const,
              text: 'Error: Failed to load workflow. Please try again.'
            }]
          };
        }
      },
    );

    // Tool 3: Get next step - parses steps with context support from database
    server.tool(
      'get_next_step',
      'Get the next step in a workflow progression with guided execution',
      {
        workflow_id: z.string().describe('ID of the workflow'),
        current_step: z.number().describe('Current step number (0-based index)'),
        available_context: z.array(z.string()).optional().describe('Available context for step execution')
      },
      async ({ workflow_id, current_step, available_context }) => {
        try {
          // Get execution plan with auto-prompts
          const executionPlan = await executionPlanBuilder.buildExecutionPlan(workflow_id);

          if (!executionPlan) {
            return {
              content: [{
                type: "text" as const,
                text: `Workflow "${workflow_id}" not found or you don't have access to it.`
              }]
            };
          }

          // Get specific step
          const step = executionPlan.items[current_step];

          if (!step) {
            return {
              content: [{
                type: "text" as const,
                text: `Step ${current_step} not found. This workflow has ${executionPlan.totalSteps} steps (0-${executionPlan.totalSteps - 1}).`
              }]
            };
          }

          // Format step response
          let response = `# Step ${step.index + 1}/${executionPlan.totalSteps}\n\n`;

          // Add stage context
          if (step.stageName) {
            response += `**Stage:** ${step.stageName}\n`;
          }

          // Add type indicator
          if (step.type === 'auto-prompt') {
            const icon = step.autoPromptType === 'memory-board' ? '📋' : '🤖';
            const badge = step.autoPromptType === 'memory-board' ? '[REVIEW]' : '[AUTO]';
            response += `**Type:** ${icon} ${badge}\n\n`;
          } else if (step.type === 'skill') {
            response += `**Type:** 🛠️ Skill\n\n`;
          } else {
            response += `**Type:** Mini-prompt\n\n`;
          }

          response += `## ${step.name}\n\n`;

          if (step.description) {
            response += `${step.description}\n\n`;
          }

          // Add prompt/skill content
          if (step.content) {
            response += `---\n\n${step.content}\n\n`;

            // Add attachment info for skills
            if (step.type === 'skill' && step.attachments && step.attachments.length > 0) {
              response += `### Attachments\n\n`;
              for (const att of step.attachments) {
                const sizeKB = Math.round(att.fileSize / 1024);
                response += `- **${att.fileName}** (${att.mimeType}, ${sizeKB}KB)\n  URL: ${att.blobUrl}\n`;
              }
              response += `\n`;
            }

            // Add instruction to follow steps (for mini-prompt and skill types, not auto-prompts)
            if (step.type === 'mini-prompt' || step.type === 'skill') {
              response += `---\n\n**⚠️ Important:** Strictly follow all the steps outlined above.\n\n`;
            }
          }

          // Add context information
          if (available_context && available_context.length > 0) {
            response += `---\n\n**Available Context:** ${available_context.join(', ')}\n\n`;
          }

          // Add instruction to proceed to next step after completing current one
          const nextStepIndex = current_step + 1;
          if (nextStepIndex < executionPlan.totalSteps) {
            response += `---\n\n**➡️ Next Step:** After completing this step, automatically proceed to step ${nextStepIndex + 1}/${executionPlan.totalSteps} `;
            response += `by calling \`get_next_step\` with \`workflow_id="${workflow_id}"\` and \`current_step=${nextStepIndex}\`.`;
          } else {
            response += `---\n\n**✅ Workflow Complete:** This is the final step. After completing this step, the workflow execution is finished.`;
          }

          return {
            content: [{
              type: "text" as const,
              text: response
            }]
          };
        } catch (error) {
          console.error('[MCP-DB] Error getting next step:', error);
          return {
            content: [{
              type: "text" as const,
              text: 'Error: Failed to get next step. Please try again.'
            }]
          };
        }
      },
    );

    // Tool 4: Get skills
    // - No auth: Returns public system skills
    // - With auth: Returns active skills from user's library
    server.tool(
      'get_skills',
      'Get skills. Without auth: public system skills. With auth: active skills from your library.',
      getSkillsToolSchema,
      async ({ search, task_description }) => {
        const userId = await getUserId();
        return await getSkillsHandler({ search, task_description }, userId);
      },
    );

    // Tool 5: Get selected skill details
    // Supports lookup by ID or by unique key
    server.tool(
      'get_selected_skill',
      'Get complete details and content for a specific skill. Supports lookup by ID or by unique key.',
      getSelectedSkillToolSchema,
      async ({ skill_id, key }) => {
        const userId = await getUserId();
        return await getSelectedSkillHandler({ skill_id, key }, userId);
      },
    );

    // Tool 6: Get workflow details
    // PUBLIC workflows accessible without auth, PRIVATE requires auth + ownership
    server.tool(
      'get_workflow',
      'Get complete workflow details including all stages, prompts, tags, and models. Public workflows work without auth.',
      getWorkflowToolSchema,
      async ({ workflow_id }) => {
        const userId = await getUserId();
        return await getWorkflowHandler({ workflow_id }, userId);
      },
    );

    // Tool 7: Get folder contents by key
    // Public folders accessible without auth, private requires auth + ownership
    server.tool(
      'get_by_folder',
      'Get folder contents by folder key with pagination. Public folders work without auth.',
      getByFolderToolSchema,
      async ({ folder_key, page, limit }) => {
        const userId = await getUserId();
        return await getByFolderHandler({ folder_key, page, limit }, userId);
      },
    );

    // Tool 8: Create folder
    // Requires authentication
    server.tool(
      'create_folder',
      'Create a new folder for organizing workflows and prompts. Requires authentication.',
      createFolderToolSchema,
      async ({ name, description, visibility, key }) => {
        const userId = await getUserId();
        return await createFolderHandler({ name, description, visibility, key }, userId);
      },
    );

    // Tool 9: Add new skill
    // Requires authentication
    server.tool(
      'add_skill',
      'Create a new skill with markdown content and optional tags. Can optionally add to a folder. Requires authentication.',
      addSkillToolSchema,
      async ({ name, content, description, visibility, tags, folder_id, folder }) => {
        const userId = await getUserId();
        return await addSkillHandler({ name, content, description, visibility, tags, folder_id, folder }, userId);
      },
    );

    // Tool 10: Edit existing skill
    // Requires authentication and ownership
    server.tool(
      'edit_skill',
      'Update an existing skill. Requires authentication and ownership.',
      editSkillToolSchema,
      async ({ skill_id, name, content, description, visibility, is_active, tags }) => {
        const userId = await getUserId();
        return await editSkillHandler({ skill_id, name, content, description, visibility, is_active, tags }, userId);
      },
    );

    // Tool 11: Add new workflow
    // Requires authentication
    server.tool(
      'add_workflow',
      'Create a new workflow with optional stages and prompts. Can optionally add to a folder. Requires authentication.',
      addWorkflowToolSchema,
      async ({ name, description, complexity, visibility, tags, stages, folder_id }) => {
        const userId = await getUserId();
        return await addWorkflowHandler({ name, description, complexity, visibility, tags, stages, folder_id }, userId);
      },
    );

    // Tool 12: Edit existing workflow
    // Requires authentication and ownership
    server.tool(
      'edit_workflow',
      'Update an existing workflow. If stages are provided, performs full replacement. Requires authentication and ownership.',
      editWorkflowToolSchema,
      async ({ workflow_id, name, description, complexity, visibility, is_active, tags, stages }) => {
        const userId = await getUserId();
        return await editWorkflowHandler({ workflow_id, name, description, complexity, visibility, is_active, tags, stages }, userId);
      },
    );
  },
  {},
  { basePath: '/api/v1' },
);

/**
 * Wrap handlers to extract userId from request and store in async context
 */
async function wrappedHandler(
  request: NextRequest
): Promise<Response> {
  const userId = await extractUserIdFromRequest(request);
  // Store userId in async context so getUserId() can retrieve it
  return userIdStorage.run(userId, async () => {
    // Convert NextRequest to Request for createMcpHandler compatibility
    return handler(request as unknown as Request);
  });
}

export async function GET(request: NextRequest) {
  return wrappedHandler(request);
}

export async function POST(request: NextRequest) {
  return wrappedHandler(request);
}

export async function DELETE(request: NextRequest) {
  return wrappedHandler(request);
}

export async function OPTIONS(request: NextRequest) {
  return wrappedHandler(request);
}
