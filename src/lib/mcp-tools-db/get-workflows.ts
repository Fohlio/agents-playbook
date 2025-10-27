import { z } from 'zod';
import { dbSemanticSearch } from '../workflows/db-semantic-search';
import { tokenAuth } from '../auth/token-auth';

export const getWorkflowsToolSchema = {
  task_description: z.string().describe('Description of the task to find workflows for'),
  user_token: z.string().optional().describe('Optional user authentication token for personalized workflows')
};

export async function getWorkflowsHandler({
  task_description,
  user_token
}: {
  task_description: string;
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
          text: `Authentication failed: ${validation.error}. Please check your token.`
        }]
      };
    }

    userId = validation.userId;
    console.log(`[MCP-DB] Authenticated user: ${userId}`);
  }

  try {
    console.log(`[MCP-DB] Semantic search for: ${task_description}`);

    // Use DB semantic search
    const results = await dbSemanticSearch.searchWorkflows(task_description, 5, userId);

    if (results.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: `No relevant workflows found for "${task_description}". ${userId ? 'Try creating a custom workflow or check system workflows.' : 'Try different search terms or authenticate to see user workflows.'}`
        }]
      };
    }

    // Format results with source indicators
    const formattedResults = results.map((workflow, index: number) => {
      const sourceIndicator = workflow.source === 'system' ? '[SYSTEM]' : '[USER]';
      const complexity = getComplexityIcon(workflow.complexity);
      const similarity = Math.round(workflow.similarity * 100);

      return `${index + 1}. ${sourceIndicator} **${workflow.title}** ${complexity} (${similarity}% match)\n   ${workflow.description}\n   📁 ${workflow.category} | 🏷️ ${workflow.tags.join(', ')}`;
    });

    const matchQuality = getMatchQuality(results[0].similarity);

    return {
      content: [{
        type: "text" as const,
        text: `Found ${results.length} workflows for "${task_description}" ${matchQuality}:\n\n${formattedResults.join('\n\n')}\n\n**Next Steps:**\nUse \`select_workflow\` with one of these workflow IDs: ${results.map(w => `"${w.id}"`).join(', ')}`
      }]
    };
  } catch (error) {
    console.error('[MCP-DB] Error in workflow search:', error);
    return {
      content: [{
        type: "text" as const,
        text: 'Error: Failed to search workflows. Please try again.'
      }]
    };
  }
}

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

function getMatchQuality(similarity: number): string {
  if (similarity >= 0.8) return '🎯';
  if (similarity >= 0.6) return '✅';
  if (similarity >= 0.4) return '👍';
  if (similarity >= 0.2) return '🤔';
  return '❓';
}
