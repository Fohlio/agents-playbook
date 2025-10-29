import { createMcpHandler } from '@vercel/mcp-adapter';
import { config } from 'dotenv';
import {
  getWorkflowsToolSchema,
  getWorkflowsHandler,
  selectWorkflowToolSchema,
  selectWorkflowHandler,
  getNextStepToolSchema,
  getNextStepHandler,
  getPromptsToolSchema,
  getPromptsHandler,
  getSelectedPromptToolSchema,
  getSelectedPromptHandler
} from '@/lib/mcp-tools';

// Load environment variables
config();

const handler = createMcpHandler(
  (server) => {
    // Tool 1: Get available workflows using semantic search
    server.tool(
      'get_available_workflows',
      'Get workflow recommendations based on task description using semantic search',
      getWorkflowsToolSchema,
      async ({ task_description }) => {
        return await getWorkflowsHandler({ task_description });
      },
    );

    // Tool 2: Select workflow - returns full content from MD file
    server.tool(
      'select_workflow',
      'Get complete workflow details including all steps from the original markdown file',
      selectWorkflowToolSchema,
      async ({ workflow_id }) => {
        return await selectWorkflowHandler({ workflow_id });
      },
    );

    // Tool 3: Get next step - parses steps from MD content with context support
    server.tool(
      'get_next_step',
      'Get the next step in a workflow progression with guided execution',
      getNextStepToolSchema,
      async ({ workflow_id, current_step, available_context }) => {
        return await getNextStepHandler({ workflow_id, current_step, available_context });
      },
    );

    // Tool 4: Get active mini prompts
    server.tool(
      'get_prompts',
      'Get all active mini prompts with optional search filtering',
      getPromptsToolSchema,
      async ({ search }) => {
        return await getPromptsHandler({ search });
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
  { basePath: '/api' },
);

export { handler as GET, handler as POST, handler as DELETE }; 