import { z } from 'zod';
import { unifiedWorkflowService } from '../workflows/unified-workflow-service';
import { tokenAuth } from '../auth/token-auth';

export const selectWorkflowToolSchema = {
  workflow_id: z.string().describe('ID of the workflow to select'),
  user_token: z.string().optional().describe('Optional user authentication token')
};

export async function selectWorkflowHandler({
  workflow_id,
  user_token
}: {
  workflow_id: string;
  user_token?: string;
}) {
  let userId: string | undefined;

  // Validate token if provided
  if (user_token) {
    const validation = await tokenAuth.validateToken(user_token);

    if (!validation.valid) {
      return {
        content: [{
          type: "text" as const,
          text: `Authentication failed: ${validation.error}`
        }]
      };
    }

    userId = validation.userId;
  }

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

    // Return workflow details
    const sourceIndicator = workflow.source === 'system' ? '[SYSTEM WORKFLOW]' : '[USER WORKFLOW]';

    return {
      content: [{
        type: "text" as const,
        text: `${sourceIndicator}\n\n# ${workflow.name}\n\n${workflow.description || 'No description available.'}\n\n## YAML Content\n\n\`\`\`yaml\n${workflow.yamlContent || 'No YAML content available.'}\n\`\`\``
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
}
