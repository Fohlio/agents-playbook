import { z } from 'zod';
import { WorkflowLoader } from '../loaders/workflow-loader';
import { SmartWorkflowEngine } from '../execution/smart-workflow-engine';
import { DefaultMCPRegistry } from '../validation/workflow-validator';
import { MiniPromptLoader } from '../loaders/mini-prompt-loader';
import { ExecutionContext } from '../types/workflow-types';

export const getNextStepToolSchema = {
  workflow_id: z.string().describe('ID of the workflow'),
  current_step: z.number().int().min(0).describe('Current step number (0-based)'),
  available_context: z.array(z.string()).optional().describe('Available context keys that the AI already has')
};

// Create shared instances
const workflowLoader = new WorkflowLoader();
const miniPromptLoader = new MiniPromptLoader();

// Simple in-memory session storage (in production, this should be persistent)
const executionSessions = new Map<string, ExecutionContext>();

export async function getNextStepHandler({ 
  workflow_id, 
  current_step, 
  available_context = [] 
}: { 
  workflow_id: string; 
  current_step: number; 
  available_context?: string[] 
}) {
  try {
    console.log(`[MCP] Getting next step for ${workflow_id}, current: ${current_step}, available_context: ${available_context.join(', ')}`);
    
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

    // Update completed steps based on current_step parameter
    // This represents the steps that the AI/Cursor has already completed
    const completedStepsCount = Math.max(0, current_step);
    
    // Generate completed step IDs based on current_step
    executionContext.completed_steps = [];
    for (let i = 0; i < completedStepsCount; i++) {
      executionContext.completed_steps.push(`step_${i}`);
    }

    // Update execution context with available context
    if (available_context && available_context.length > 0) {
      console.log(`[MCP] Updating context with available items: ${available_context.join(', ')}`);
      for (const contextItem of available_context) {
        executionContext.context_data.set(contextItem, `Available: ${contextItem}`);
      }
    }

    // Create MCP registry with available servers
    const mcpRegistry = new DefaultMCPRegistry(executionContext.available_mcp_servers);

    // Create smart workflow engine
    const smartEngine = new SmartWorkflowEngine(
      executionContext,
      mcpRegistry,
      miniPromptLoader
    );

    // Get execution plan to understand limits
    const executionPlan = await smartEngine.planWorkflow(workflowConfig);
    
    // Limit completed steps to not exceed executable steps
    const maxCompletedSteps = Math.min(completedStepsCount, executionPlan.executable_steps);
    executionContext.completed_steps = [];
    for (let i = 0; i < maxCompletedSteps; i++) {
      executionContext.completed_steps.push(`step_${i}`);
    }

    // Get the next step using smart engine
    const nextStepResponse = await smartEngine.getNextStep(workflowConfig, current_step);

    if (!nextStepResponse) {
      // Workflow is complete
      const executionSummary = smartEngine.getExecutionSummary(workflowConfig);
      
      // Clean up session
      executionSessions.delete(workflow_id);

      return {
        content: [{ 
          type: "text" as const, 
          text: `🎉 **Agents Playbook Workflow Complete: ${workflowConfig.name}**\n\n✅ **Summary:**\n- Completed Steps: ${executionSummary.completed}\n- Skipped Steps: ${executionSummary.skipped}\n- Completion Rate: ${Math.round(executionSummary.completionRate * 100)}%\n\n${executionSummary.skipped > 0 ? `⚠️ **Note:** This agents playbook workflow had ${executionSummary.skipped} skipped steps. For best results, consider reviewing and completing skipped steps if applicable.\n\n` : ''}**🚀 What's Next?**\nUse \`get_available_workflows\` to find related workflows or start a new one.`
        }],
      };
    }

    if (nextStepResponse.isComplete) {
      // Workflow is complete - return proper completion message
      const executionSummary = smartEngine.getExecutionSummary(workflowConfig);
      
      return {
        content: [{ 
          type: "text" as const, 
          text: `🎉 **Agents Playbook Workflow Complete: ${workflowConfig.name}**\n\n✅ **Summary:**\n- Completed Steps: ${executionSummary.completed}\n- Skipped Steps: ${executionSummary.skipped}\n- Completion Rate: ${Math.round(executionSummary.completionRate * 100)}%\n\n${executionSummary.skipped > 0 ? `⚠️ **Note:** This agents playbook workflow had ${executionSummary.skipped} skipped steps. For best results, consider reviewing and completing skipped steps if applicable.\n\n` : ''}**🚀 What's Next?**\nUse \`get_available_workflows\` to find related workflows or start a new one.`
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
      stepContent += `\nThis step cannot be executed due to missing MCP servers. Please install required servers first.\n\n`;
    }

    // Add skip suggestions if applicable
    if (currentStep.miniPrompt.skip_conditions && currentStep.miniPrompt.skip_conditions.length > 0) {
      const skipSuggestions = smartEngine.getSkipSuggestions(currentStep.miniPrompt.skip_conditions);
      if (skipSuggestions.canSkip) {
        stepContent += `💡 **Skip Suggestion:**\n`;
        stepContent += `This step can be skipped because:\n`;
        skipSuggestions.reasons.forEach((reason: string) => {
          stepContent += `- ${reason}\n`;
        });
        stepContent += `\n*You can proceed to the next step if you agree with this suggestion.*\n\n`;
      }
    }

    // Add context guidance if missing required context
    if (validation.missingContext.length > 0) {
      stepContent += `📋 **Required Context:**\n`;
      stepContent += `This step requires the following context to be gathered:\n`;
      validation.missingContext.forEach((ctx: string) => {
        stepContent += `- **${ctx}**: Please gather or create this context before proceeding\n`;
      });
      stepContent += `\n*Note: Missing context doesn't prevent execution - the step will guide you on gathering it.*\n\n`;
    }

    // Add context information section
    if (available_context.length > 0) {
      stepContent += `## 📋 Available Context\n\n`;
      stepContent += `**You already have the following context available:**\n`;
      available_context.forEach(context => {
        stepContent += `- **${context}** - Use existing ${context} from your project\n`;
      });
      stepContent += `\n*Note: When instructions mention creating or gathering the above context, reference your existing documents instead.*\n\n`;
    }

    // Add the complete mini-prompt content with context modification
    stepContent += `---\n\n`;
    stepContent += `## 📋 Mini-Prompt Instructions\n\n`;
    
    // Add workflow guidance
    stepContent += `**⚠️ Important:** Complete this step fully before proceeding.\n\n**🔄 General Instructions:**\n⚠️ **IMPORTANT:** For steps requiring user input, analysis, or answers:\n1. **First**: Try to find answers yourself using available tools, context, codebase search, and documentation\n2. **Then**: Present your findings to the user for validation and confirmation\n3. **Wait**: Do not proceed to the next step until the user validates your findings or provides corrections\n\n**📋 Context Gathering:**\nIf this step requires specific context that you don't have, gather it by:\n- Using codebase search to find relevant files and information\n- Reading existing documentation and project files\n- Analyzing the current project structure and setup\n- Asking targeted questions when automated gathering isn't sufficient\n\n`;
    
    // Modify mini-prompt content based on available context
    let modifiedContent = miniPrompt.fullContent;
    
    if (available_context.length > 0) {
      // Add context-aware instructions at the top
      const contextSection = `> **📋 Context Note:** You have access to existing context: ${available_context.join(', ')}. When the instructions below mention creating or gathering these items, reference your existing documents instead.\n\n`;
      modifiedContent = contextSection + modifiedContent;
    }
    
    stepContent += modifiedContent;
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
    stepContent += `\n**Next:** Complete this step fully and use \`get_next_step\` with current_step=${currentStep.stepNumber} to continue.`;

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