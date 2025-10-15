import { z } from 'zod';
import { semanticSearch } from '../semantic-search';

export const getWorkflowsToolSchema = {
  task_description: z.string().describe('Description of the task to find workflows for')
};

export async function getWorkflowsHandler({ task_description }: { task_description: string }) {
  try {
    console.log(`[MCP] Semantic search for: ${task_description}`);
    
    // Use semantic search to find relevant workflows
    const results = await semanticSearch.searchWorkflows(task_description, 5);
    
    if (results.length === 0) {
      // Get available categories to suggest
      const categories = await semanticSearch.getAvailableCategories();
      return {
        content: [{ 
          type: "text" as const, 
          text: `No relevant workflows found for "${task_description}". Try terms related to these categories: ${categories.join(', ')}`
        }],
      };
    }

    // Format results in a user-friendly way
    const formattedResults = results.map((workflow, index: number) => {
      const complexity = getComplexityIcon(workflow.complexity);
      const similarity = Math.round(workflow.similarity * 100);
      
      return `${index + 1}. **${workflow.title}** ${complexity} (${similarity}% match)\n   ${workflow.description}\n   📁 ${workflow.category} | 🏷️ ${workflow.tags.join(', ')}`;
    });

    const matchQuality = getMatchQuality(results[0].similarity);

    return {
      content: [{ 
        type: "text" as const, 
        text: `Found ${results.length} relevant agents playbook workflows for "${task_description}" ${matchQuality}:\n\n${formattedResults.join('\n\n')}\n\n**⚠️ Agents Playbook Workflows:**\nThese are carefully designed workflows meant to be followed step-by-step without shortcuts. Each step has been optimized for best results.\n\n**Next Steps:**\nUse \`select_workflow\` with one of these workflow IDs: ${results.map(w => `"${w.id}"`).join(', ')}`
      }],
    };
  } catch (error) {
    console.error('[MCP] Error in semantic workflow search:', error);
    return {
      content: [{ type: "text" as const, text: 'Error: Failed to search workflows. Please try again.' }],
    };
  }
}

/**
 * Get complexity icon for display
 */
function getComplexityIcon(complexity: string): string {
  switch (complexity?.toLowerCase()) {
    case 'low':
    case 'simple':
      return '🟢';
    case 'medium':
    case 'standard':
      return '🟡';
    case 'high':
    case 'complex':
      return '🔴';
    default:
      return '⚪';
  }
}

/**
 * Get match quality indicator based on similarity score
 */
function getMatchQuality(similarity: number): string {
  if (similarity >= 0.8) return '🎯';
  if (similarity >= 0.6) return '✅';
  if (similarity >= 0.4) return '👍';
  if (similarity >= 0.2) return '🤔';
  return '❓';
} 