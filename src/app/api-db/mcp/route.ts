import { createMcpHandler } from '@vercel/mcp-adapter';
import { config } from 'dotenv';
import {
  getWorkflowsToolSchema,
  getWorkflowsHandler,
  selectWorkflowToolSchema,
  selectWorkflowHandler,
  getNextStepToolSchema,
  getNextStepHandler
} from '@/lib/mcp-tools-db';

// Load environment variables
config();

const handler = createMcpHandler(
  (server) => {
    // Tool 1: Get available workflows from database with semantic search
    server.tool(
      'get_available_workflows',
      'Get workflow recommendations from database based on task description using semantic search. Supports optional user authentication token.',
      getWorkflowsToolSchema,
      async ({ task_description, user_token }) => {
        return await getWorkflowsHandler({ task_description, user_token });
      },
    );

    // Tool 2: Select workflow from database
    server.tool(
      'select_workflow',
      'Get complete workflow details from database. Supports optional user authentication token for accessing user workflows.',
      selectWorkflowToolSchema,
      async ({ workflow_id, user_token }) => {
        return await selectWorkflowHandler({ workflow_id, user_token });
      },
    );

    // Tool 3: Get next step from database workflow
    server.tool(
      'get_next_step',
      'Get the next step in a workflow progression from database. Supports optional user authentication token.',
      getNextStepToolSchema,
      async ({ workflow_id, current_step, available_context, user_token }) => {
        return await getNextStepHandler({ workflow_id, current_step, available_context, user_token });
      },
    );
  },
  {},
  { basePath: '/api-db' }
);

// Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export { handler as GET, handler as POST, handler as DELETE };
