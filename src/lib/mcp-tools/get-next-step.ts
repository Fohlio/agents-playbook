import { z } from 'zod';
import { getFullWorkflowContent, parseWorkflowSteps, loadWorkflowEmbeddings } from '@/lib/semantic-search';

export const getNextStepToolSchema = {
  workflow_id: z.string().describe('ID of the workflow'),
  current_step: z.number().int().min(0).describe('Current step number (0-based)')
};

export async function getNextStepHandler({ workflow_id, current_step }: { workflow_id: string; current_step: number }) {
  try {
    console.log(`[MCP] Getting next step for ${workflow_id}, current: ${current_step}`);
    
    const workflows = loadWorkflowEmbeddings();
    const workflow = workflows.find(w => w.id === workflow_id);
    
    if (!workflow) {
      return {
        content: [{ type: "text" as const, text: `Workflow "${workflow_id}" not found.` }],
      };
    }
    
    // Get full content and parse steps
    const fullContent = getFullWorkflowContent(workflow);
    const steps = parseWorkflowSteps(fullContent);
    
    const nextStepIndex = current_step;
    const totalSteps = steps.length;
    
    if (nextStepIndex >= totalSteps) {
      // Suggest related workflows based on category
      const allWorkflows = loadWorkflowEmbeddings();
      const relatedWorkflows = allWorkflows
        .filter(w => w.id !== workflow_id && (w.category === workflow.category || w.keywords.some(k => workflow.keywords.includes(k))))
        .slice(0, 3);
      
      const suggestions = relatedWorkflows.length > 0 
        ? `\n\n**Recommended next workflows:**\n${relatedWorkflows.map(w => `• ${w.id} (${w.title})`).join('\n')}`
        : '';
      
      return {
        content: [{ 
          type: "text" as const, 
          text: `✅ **Workflow "${workflow.title}" Complete!**\n\nYou've completed all ${totalSteps} steps.${suggestions}`
        }],
      };
    }

    const nextStep = steps[nextStepIndex];
    const progress = Math.round(((nextStep.step)/totalSteps)*100);
    
    return {
      content: [{ 
        type: "text" as const, 
        text: `## ${workflow.title} - Step ${nextStep.step} of ${totalSteps}\n\n### ${nextStep.title}\n\n${nextStep.content}\n\n**Progress**: Step ${nextStep.step}/${totalSteps} (${progress}% complete)\n\n**Next**: Use \`get_next_step\` with current_step=${nextStep.step} to continue.`
      }],
    };
  } catch (error) {
    console.error('[MCP] Error in get_next_step:', error);
    return {
      content: [{ type: "text" as const, text: `Error: Failed to get next step for '${workflow_id}'` }],
    };
  }
} 