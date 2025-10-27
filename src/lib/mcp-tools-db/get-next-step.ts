import { z } from 'zod';
import { selectWorkflowHandler } from './select-workflow';

export const getNextStepToolSchema = {
  workflow_id: z.string().describe('ID of the workflow'),
  current_step: z.number().describe('Current step number (0-based index)'),
  available_context: z.array(z.string()).optional().describe('Available context for step execution'),
  user_token: z.string().optional().describe('Optional user authentication token')
};

export async function getNextStepHandler({
  workflow_id,
  current_step,
  available_context,
  user_token
}: {
  workflow_id: string;
  current_step: number;
  available_context?: string[];
  user_token?: string;
}) {
  try {
    // Get workflow using select_workflow logic
    const workflowResponse = await selectWorkflowHandler({
      workflow_id,
      user_token
    });

    // Check if workflow was found
    if (workflowResponse.content[0].text.includes('not found')) {
      return workflowResponse;
    }

    // For now, return a simple next step message
    // TODO: Parse YAML and extract specific step
    return {
      content: [{
        type: "text" as const,
        text: `Next step for workflow "${workflow_id}" (step ${current_step}):\n\nPlease refer to the full workflow YAML for step details. Use \`select_workflow\` to see the complete workflow structure.\n\nAvailable context: ${available_context?.join(', ') || 'none'}`
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
}
