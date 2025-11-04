import { createMcpHandler } from '@vercel/mcp-adapter';
import { config } from 'dotenv';
import { auth } from '@/lib/auth/auth';
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
  getSelectedPromptHandler,
  getUserWorkflowsHandler
} from '@/lib/mcp-tools';

// Load environment variables
config();

// Use Node.js runtime for database access and auth
export const runtime = 'nodejs';

const handler = createMcpHandler(
  (server) => {
    // Tool 1: Get workflows
    // - No auth: Returns public system workflows (YAML playbook)
    // - With auth: Returns active workflows from user's library
    server.tool(
      'get_available_workflows',
      'Get workflow recommendations. Without auth: public system workflows. With auth: active workflows from your library.',
      getWorkflowsToolSchema,
      async ({ task_description }) => {
        const session = await auth();
        const userId = session?.user?.id;

        if (userId) {
          // Authenticated: return user's library workflows
          return await getUserWorkflowsHandler({ search: task_description, userId });
        } else {
          // Not authenticated: return public system workflows
          return await getWorkflowsHandler({ task_description });
        }
      },
    );

    // Tool 2: Select workflow - returns full content
    server.tool(
      'select_workflow',
      'Get complete workflow details including all steps',
      selectWorkflowToolSchema,
      async ({ workflow_id }) => {
        return await selectWorkflowHandler({ workflow_id });
      },
    );

    // Tool 3: Get next step - parses steps with context support
    server.tool(
      'get_next_step',
      'Get the next step in a workflow progression with guided execution',
      getNextStepToolSchema,
      async ({ workflow_id, current_step, available_context }) => {
        return await getNextStepHandler({ workflow_id, current_step, available_context });
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
);

export { handler as GET, handler as POST, handler as DELETE, handler as OPTIONS };
