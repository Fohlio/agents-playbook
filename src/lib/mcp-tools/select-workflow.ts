import { z } from 'zod';
import { WorkflowLoader } from '../loaders/workflow-loader';

export const selectWorkflowToolSchema = {
  workflow_id: z.string().describe('ID of the workflow to select and analyze')
};

// Create shared instances
const workflowLoader = new WorkflowLoader();

// Helper function to get context descriptions
function getContextDescription(contextKey: string): string {
  const descriptions: Record<string, string> = {
    'bug_symptoms': 'Description of the bug behavior and symptoms',
    'reproduction_steps': 'Steps to reproduce the issue',
    'error_logs': 'Error messages and log files',
    'system_logs': 'System or application logs',
    'problem_analysis': 'Analysis of the problem and its scope',
    'solution_approach': 'Proposed solution strategy',
    'implemented_fix': 'Completed fix implementation',
    'test_cases': 'Test scenarios and cases',
    'reproduction_environment': 'Environment setup for testing',
    'existing_code_context': 'Related code files and context',
    'issue_description': 'Description of the issue or task',
    'requirements': 'Project or feature requirements',
    'technical_specs': 'Technical specifications and constraints',
    'user_stories': 'User stories and acceptance criteria',
    'architecture_design': 'System architecture and design',
    'implementation_plan': 'Development implementation plan'
  };
  return descriptions[contextKey] || contextKey;
}

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

    // Count total steps for summary
    const totalSteps = workflowConfig.phases.reduce((sum, phase) => sum + phase.steps.length, 0);
    
    // Create phases overview without execution predictions
    const phasesSummary = workflowConfig.phases.map(phase => {
      return `📋 **${phase.name}**: ${phase.steps.length} step${phase.steps.length > 1 ? 's' : ''}`;
    }).join('\n');

    // Create detailed step breakdown with context requirements
    const stepBreakdown = workflowConfig.phases.map(phase => {
      const stepDetails = phase.steps.map((step, index) => {
        // Access the actual YAML structure
        const stepPrereqs = step.prerequisites as any;
        const requiredContext = stepPrereqs?.requiredContext || [];
        const optionalContext = stepPrereqs?.optionalContext || [];
        
        let contextInfo = '';
        if (requiredContext.length > 0) {
          const contextDescriptions = requiredContext.map((ctx: string) => 
            `${ctx} (${getContextDescription(ctx)})`
          ).join(', ');
          contextInfo += `\n    📋 **Required:** ${contextDescriptions}`;
        }
        if (optionalContext.length > 0) {
          const contextDescriptions = optionalContext.map((ctx: string) => 
            `${ctx} (${getContextDescription(ctx)})`
          ).join(', ');
          contextInfo += `\n    💡 **Optional:** ${contextDescriptions}`;
        }
        
        return `  ${index + 1}. **${step.id}**${contextInfo}`;
      }).join('\n');
      
      return `**${phase.name}:**\n${stepDetails}`;
    }).join('\n\n');

    const nextStepsInfo = `\n\n**🚀 Ready to Start:**\nUse \`get_next_step\` with workflow_id="${workflow_id}" and current_step=0 to begin execution.\n\n**💡 Context Gathering:** Each step will guide you on how to gather the required context. Steps may auto-skip if context is missing or not needed.`;

    return {
      content: [{ 
        type: "text" as const, 
        text: `## 📋 ${workflowConfig.name}\n\n**Description:** ${workflowConfig.description}\n\n**Execution Strategy:** Smart Skip (Auto-skip missing prerequisites)\n\n**📊 Workflow Overview:**\n- **Total Steps:** ${totalSteps}\n- **Estimated Duration:** ${workflowConfig.estimated_duration || 'Unknown'}\n\n**📋 Phases Overview:**\n${phasesSummary}\n\n**📝 Detailed Step Breakdown:**\n${stepBreakdown}${nextStepsInfo}`
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