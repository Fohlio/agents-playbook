import { z } from 'zod';
import { getFullWorkflowContent, loadWorkflowEmbeddings } from '@/lib/semantic-search';
import matter from 'gray-matter';

export const selectWorkflowToolSchema = {
  workflow_id: z.string().describe('ID of the workflow to retrieve')
};

export async function selectWorkflowHandler({ workflow_id }: { workflow_id: string }) {
  try {
    console.log(`[MCP] Selecting workflow: ${workflow_id}`);
    
    const workflows = loadWorkflowEmbeddings();
    const workflow = workflows.find(w => w.id === workflow_id);
    
    if (!workflow) {
      const availableIds = workflows.map(w => w.id).join(', ');
      return {
        content: [{ 
          type: "text" as const, 
          text: `Workflow "${workflow_id}" not found. Available workflows: ${availableIds}`
        }],
      };
    }

    // Get full content from MD file
    const fullContent = getFullWorkflowContent(workflow);
    const parsed = matter(fullContent);
    
    return {
      content: [{ 
        type: "text" as const, 
        text: `# ${workflow.title}\n\n**Description**: ${workflow.description}\n**Complexity**: ${workflow.complexity}\n**Category**: ${workflow.category}\n**Use Case**: ${workflow.use_case}\n**Expected Output**: ${workflow.output}\n\n---\n\n${parsed.content}\n\n---\n\n**Next**: Use \`get_next_step\` with workflow_id="${workflow_id}" and current_step=0 to start guided execution.`
      }],
    };
  } catch (error) {
    console.error('[MCP] Error in select_workflow:', error);
    return {
      content: [{ type: "text" as const, text: `Error: Failed to retrieve workflow '${workflow_id}'` }],
    };
  }
} 