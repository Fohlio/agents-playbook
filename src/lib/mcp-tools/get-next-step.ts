import { z } from 'zod';
import { WorkflowLoader } from '../loaders/workflow-loader';
import { SmartWorkflowEngine } from '../execution/smart-workflow-engine';
import { DefaultMCPRegistry } from '../validation/workflow-validator';
import { MiniPromptLoader } from '../loaders/mini-prompt-loader';
import { ExecutionContext } from '../types/workflow-types';

export const getNextStepToolSchema = {
  workflow_id: z.string().describe('ID of the workflow'),
  current_step: z.number().int().min(0).describe('Current step number (0-based)')
};

// Create shared instances
const workflowLoader = new WorkflowLoader();
const miniPromptLoader = new MiniPromptLoader();

// Simple in-memory session storage (in production, this should be persistent)
const executionSessions = new Map<string, ExecutionContext>();

export async function getNextStepHandler({ workflow_id, current_step }: { workflow_id: string; current_step: number }) {
  try {
    console.log(`[MCP] Getting next step for ${workflow_id}, current: ${current_step}`);
    
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

    // Get or create execution context for this workflow
    let executionContext = executionSessions.get(workflow_id);
    if (!executionContext) {
      executionContext = {
        available_mcp_servers: ['base'], // Basic server always available
        context_data: new Map(),
        workflow_id: workflow_id,
        current_phase: '',
        completed_steps: [],
        skipped_steps: []
      };
      executionSessions.set(workflow_id, executionContext);
    }

    // Create MCP registry with available servers
    const mcpRegistry = new DefaultMCPRegistry(executionContext.available_mcp_servers);

    // Create smart workflow engine
    const smartEngine = new SmartWorkflowEngine(
      executionContext,
      mcpRegistry,
      miniPromptLoader
    );

    // Get the next step using smart engine
    const nextStepResponse = await smartEngine.getNextStep(workflowConfig, current_step);

    if (!nextStepResponse) {
      // Workflow is complete
      const executionSummary = smartEngine.getExecutionSummary();
      
      // Clean up session
      executionSessions.delete(workflow_id);

      return {
        content: [{ 
          type: "text" as const, 
          text: `🎉 **Workflow Complete: ${workflowConfig.name}**\n\n✅ **Summary:**\n- Completed Steps: ${executionSummary.completed}\n- Skipped Steps: ${executionSummary.skipped}\n- Completion Rate: ${Math.round(executionSummary.completionRate * 100)}%\n\n**🚀 What's Next?**\nUse \`get_available_workflows\` to find related workflows or start a new one.`
        }],
      };
    }

    if (nextStepResponse.isComplete) {
      return {
        content: [{ 
          type: "text" as const, 
          text: nextStepResponse.currentStep.progress
        }],
      };
    }

    // Format the step response
    const { currentPhase, currentStep, skippedSteps } = nextStepResponse;
    const miniPrompt = currentStep.miniPrompt;

    // Build step content with full mini-prompt
    let stepContent = `## ${workflowConfig.name}\n\n`;
    stepContent += `### 📋 Phase: ${currentPhase.name} (Step ${currentPhase.stepInPhase}/${currentPhase.totalInPhase})\n\n`;
    
    // Add validation status first if there are issues
    const validation = currentStep.validation;
    if (!validation.canExecute) {
      stepContent += `⚠️ **Step Issues:**\n`;
      validation.skipReasons.forEach(reason => {
        stepContent += `- ${reason}\n`;
      });
      stepContent += `\nThis step will be automatically skipped. Proceeding to next step...\n\n`;
    }

    // Add the complete mini-prompt content
    stepContent += `---\n\n`;
    stepContent += `## 📋 Mini-Prompt Instructions\n\n`;
    stepContent += miniPrompt.fullContent;
    stepContent += `\n\n---\n\n`;

    // Add workflow context
    stepContent += `## 🔄 Workflow Context\n\n`;
    stepContent += `**Progress:** ${currentStep.progress}\n`;
    
    if (currentStep.note) {
      stepContent += `**Note:** ${currentStep.note}\n`;
    }

    // Add prerequisites info
    if (miniPrompt.prerequisites.mcp_servers.length > 0) {
      stepContent += `**Required Tools:** ${miniPrompt.prerequisites.mcp_servers.join(', ')}\n`;
    }
    if (miniPrompt.prerequisites.context.length > 0) {
      stepContent += `**Required Context:** ${miniPrompt.prerequisites.context.join(', ')}\n`;
    }

    // Add skipped steps summary if any
    if (skippedSteps.length > 0) {
      stepContent += `\n**⚠️ Recent Skipped Steps (${skippedSteps.length} total):**\n`;
      skippedSteps.slice(-3).forEach(skip => { // Show last 3 skipped steps
        stepContent += `- ${skip.step_title}: ${skip.reason}\n`;
      });
    }

    // Add continuation instruction
    stepContent += `\n**Next:** Complete this step and use \`get_next_step\` with current_step=${currentStep.stepNumber} to continue.`;

    return {
      content: [{ 
        type: "text" as const, 
        text: stepContent
      }],
    };
  } catch (error) {
    console.error('[MCP] Error in get_next_step:', error);
    return {
      content: [{ 
        type: "text" as const, 
        text: `❌ **Error getting next step for '${workflow_id}'**\n\nPlease check the workflow ID and step number. Use \`select_workflow\` to see the workflow execution plan.`
      }],
    };
  }
} 