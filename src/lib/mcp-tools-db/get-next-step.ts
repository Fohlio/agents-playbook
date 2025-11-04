import { z } from 'zod';
import { executionPlanBuilder } from './execution-plan-builder';
import { tokenAuth } from '../auth/token-auth';

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
    // Note: userId would be used for access control in future enhancements
  }

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
      
      // Add instruction to follow steps (only for mini-prompt types, not auto-prompts)
      if (step.type === 'mini-prompt') {
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
}
