import { createMcpHandler } from '@vercel/mcp-adapter';
import { config } from 'dotenv';
import {
  getWorkflowsToolSchema,
  getWorkflowsHandler,
  selectWorkflowToolSchema,
  selectWorkflowHandler,
  getNextStepToolSchema,
  getNextStepHandler
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
  },
  {},
  { basePath: '/api' },
);

export { handler as GET, handler as POST, handler as DELETE }; 