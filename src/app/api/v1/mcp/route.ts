import { createMcpHandler } from '@vercel/mcp-adapter';
import { config } from 'dotenv';
import { auth } from '@/lib/auth/auth';
import { z } from 'zod';
// Import database services directly
import { dbSemanticSearch } from '@/lib/workflows/db-semantic-search';
import { unifiedWorkflowService } from '@/lib/workflows/unified-workflow-service';
import { executionPlanBuilder } from '@/lib/mcp-tools-db/execution-plan-builder';
// Import database-backed handlers for prompts (already using DB)
import {
  getPromptsToolSchema,
  getPromptsHandler,
  getSelectedPromptToolSchema,
  getSelectedPromptHandler,
} from '@/lib/mcp-tools';

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
        const session = await auth();
        const userId = session?.user?.id;

        try {
          // Use database semantic search directly with userId
          const results = await dbSemanticSearch.searchWorkflows(task_description, 5, userId);

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
        const session = await auth();
        const userId = session?.user?.id;

        try {
          // Get workflow from unified service
          const workflow = await unifiedWorkflowService.getWorkflowById(workflow_id, userId);

          if (!workflow) {
            return {
              content: [{
                type: "text" as const,
                text: `Workflow "${workflow_id}" not found or you don't have access to it.`
              }]
            };
          }

          // Build execution plan with automatic prompts
          const executionPlan = await executionPlanBuilder.buildExecutionPlan(workflow_id);

          // Return workflow details
          const sourceIndicator = workflow.source === 'system' ? '[SYSTEM WORKFLOW]' : '[USER WORKFLOW]';

          let response = `${sourceIndicator}\n\n# ${workflow.name}\n\n${workflow.description || 'No description available.'}\n\n`;

          // Add execution plan if available
          if (executionPlan) {
            response += `## Execution Plan\n\n`;
            response += executionPlanBuilder.formatExecutionPlan(executionPlan);
            response += `\n\n---\n\n`;
          }

          // Add YAML content if available
          if (workflow.yamlContent) {
            response += `## YAML Content\n\n\`\`\`yaml\n${workflow.yamlContent}\n\`\`\``;
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
            response += `**Type:** Auto-attached prompt ${icon} ${badge}\n\n`;
          } else {
            response += `**Type:** Mini-prompt\n\n`;
          }

          response += `## ${step.name}\n\n`;

          if (step.description) {
            response += `${step.description}\n\n`;
          }

          // Add prompt content
          if (step.content) {
            response += `---\n\n${step.content}\n\n`;
          }

          // Add context information
          if (available_context && available_context.length > 0) {
            response += `---\n\n**Available Context:** ${available_context.join(', ')}`;
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

    // Tool 4: Get mini prompts
    // - No auth: Returns public active mini prompts
    // - With auth: Returns active mini prompts from user's library
    server.tool(
      'get_prompts',
      'Get mini prompts. Without auth: public active prompts. With auth: active prompts from your library.',
      getPromptsToolSchema,
      async ({ search }) => {
        const session = await auth();
        const userId = session?.user?.id;

        return await getPromptsHandler({ search, userId });
      },
    );

    // Tool 5: Get selected mini prompt details
    server.tool(
      'get_selected_prompt',
      'Get complete details and content for a specific mini prompt',
      getSelectedPromptToolSchema,
      async ({ prompt_id }) => {
        return await getSelectedPromptHandler({ prompt_id });
      },
    );
  },
  {},
  { basePath: '/api/v1' },
);

export { handler as GET, handler as POST, handler as DELETE, handler as OPTIONS };
