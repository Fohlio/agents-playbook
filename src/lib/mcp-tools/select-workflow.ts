import { z } from 'zod';
import { WorkflowLoader } from '../loaders/workflow-loader';
import { SmartWorkflowEngine } from '../execution/smart-workflow-engine';
import { DefaultMCPRegistry } from '../validation/workflow-validator';
import { MiniPromptLoader } from '../loaders/mini-prompt-loader';
import { ExecutionContext } from '../types/workflow-types';

export const selectWorkflowToolSchema = {
  workflow_id: z.string().describe('ID of the workflow to select and analyze')
};

// Create shared instances
const workflowLoader = new WorkflowLoader();
const miniPromptLoader = new MiniPromptLoader();

export async function selectWorkflowHandler({ workflow_id }: { workflow_id: string }) {
  try {
    console.log(`[MCP] Selecting workflow: ${workflow_id}`);
    
    // Load the workflow configuration
    const workflowConfig = await workflowLoader.loadWorkflowConfig(workflow_id);
    
    if (!workflowConfig) {
      return {
        content: [{ 
          type: "text" as const, 
          text: `❌ **Workflow not found**: "${workflow_id}"\n\nPlease use \`get_available_workflows\` to see available workflows.`
        }],
      };
    }

    // Create execution context (assuming no MCP servers are available for now)
    const executionContext: ExecutionContext = {
      available_mcp_servers: [], // Will be populated based on actual environment
      context_data: new Map(),
      workflow_id: workflow_id,
      current_phase: '',
      completed_steps: [],
      skipped_steps: []
    };

    // Create MCP registry (assuming no additional servers available)
    const mcpRegistry = new DefaultMCPRegistry(['base']);

    // Create smart workflow engine
    const smartEngine = new SmartWorkflowEngine(
      executionContext,
      mcpRegistry,
      miniPromptLoader
    );

    // Generate execution plan
    const executionPlan = await smartEngine.planWorkflow(workflowConfig);

    // Format the response
    const phasesSummary = executionPlan.phases.map(phase => {
      const skippedInPhase = phase.skipped_steps.length;
      const executableInPhase = phase.executable_steps;
      const totalInPhase = phase.total_steps;
      const phaseRate = totalInPhase > 0 ? Math.round((executableInPhase / totalInPhase) * 100) : 0;
      
      let phaseStatus = '';
      if (skippedInPhase === 0) {
        phaseStatus = '✅ All steps executable';
      } else if (executableInPhase === 0) {
        phaseStatus = '⚠️ All steps will be skipped';
      } else {
        phaseStatus = `⚡ ${executableInPhase}/${totalInPhase} steps executable (${phaseRate}%)`;
      }
      
      return `📋 **${phase.name}**: ${phaseStatus}`;
    }).join('\n');

    const skippedDetails = executionPlan.skipped_steps.length > 0 
      ? `\n\n**⚠️ Skipped Steps (${executionPlan.skipped_steps.length}):**\n${
          executionPlan.skipped_steps.map(skip => `• ${skip.step_title}: ${skip.reason}`).join('\n')
        }`
      : '';

    const nextStepsInfo = executionPlan.executable_steps > 0
      ? `\n\n**🚀 Ready to Start:**\nUse \`get_next_step\` with workflow_id="${workflow_id}" and current_step=0 to begin execution.`
      : `\n\n**❌ Cannot Execute:**\nThis workflow has no executable steps with the current configuration. Please check prerequisites or try a different workflow.`;

    return {
      content: [{ 
        type: "text" as const, 
        text: `## 📋 ${workflowConfig.name}\n\n**Description:** ${workflowConfig.description}\n\n**Execution Strategy:** ${workflowConfig.execution_strategy === 'smart_skip' ? 'Smart Skip (Auto-skip missing prerequisites)' : 'Linear (All steps required)'}\n\n**📊 Execution Plan:**\n- **Total Steps:** ${executionPlan.total_steps}\n- **Executable Steps:** ${executionPlan.executable_steps}\n- **Execution Rate:** ${executionPlan.execution_rate}%\n- **Estimated Duration:** ${workflowConfig.estimated_duration}\n\n**📋 Phases Overview:**\n${phasesSummary}${skippedDetails}${nextStepsInfo}`
      }],
    };
  } catch (error) {
    console.error('[MCP] Error in select_workflow:', error);
    return {
      content: [{ 
        type: "text" as const, 
        text: `❌ **Error selecting workflow "${workflow_id}"**\n\nPlease check the workflow ID and try again. Use \`get_available_workflows\` to see available options.`
      }],
    };
  }
} 