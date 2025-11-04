import { z } from 'zod';
import { unifiedWorkflowService } from '../workflows/unified-workflow-service';
import { tokenAuth } from '../auth/token-auth';
import { executionPlanBuilder } from './execution-plan-builder';

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
      response += `## Workflow Execution Instructions\n\n`;
      response += `**⚠️ Important:** This workflow consists of ${executionPlan.totalSteps} sequential steps. `;
      response += `After completing each step, you must automatically proceed to the next step in the workflow. `;
      response += `Use the \`get_next_step\` tool with the workflow ID and the next step number to continue. `;
      response += `Do not skip steps or stop until all steps are completed.\n\n`;
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
}
