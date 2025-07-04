import { z } from 'zod';
import { searchWorkflowsBySemantic } from '@/lib/semantic-search';

export const getWorkflowsToolSchema = {
  task_description: z.string().describe('Description of the task to find workflows for')
};

export async function getWorkflowsHandler({ task_description }: { task_description: string }) {
  try {
    console.log(`[MCP] Semantic search for: ${task_description}`);
    
    const results = await searchWorkflowsBySemantic(task_description, 5, 0.4);
    
    if (results.length === 0) {
      return {
        content: [{ 
          type: "text" as const, 
          text: `No relevant workflows found for "${task_description}". Try broader terms like: "planning", "development", "bug fix", "testing", "architecture", "product development"`
        }],
      };
    }

    return {
      content: [{ 
        type: "text" as const, 
        text: `Found ${results.length} relevant workflows for "${task_description}":\n\n${
          results.map(w => 
            `🔹 **${w.title}** (${w.complexity})\n   ${w.description}\n   Similarity: ${Math.round(w.similarity_score * 100)}% | Category: ${w.category}\n   Use case: ${w.use_case || 'General workflow'}`
          ).join('\n\n')
        }\n\nUse \`select_workflow\` with one of these IDs: ${results.map(w => w.id).join(', ')}`
      }],
    };
  } catch (error) {
    console.error('[MCP] Error in semantic search:', error);
    return {
      content: [{ type: "text" as const, text: 'Error: Failed to search workflows. Please try again.' }],
    };
  }
} 