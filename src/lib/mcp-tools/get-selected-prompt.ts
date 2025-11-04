import { z } from 'zod';
import { prisma } from '@/lib/db/client';

export const getSelectedPromptToolSchema = {
  prompt_id: z.string().describe('ID of the mini prompt to retrieve')
};

export async function getSelectedPromptHandler({ prompt_id }: { prompt_id: string }) {
  try {
    console.log(`[MCP] Selecting mini prompt: ${prompt_id}`);

    // Fetch the mini prompt with metadata
    const miniPrompt = await prisma.miniPrompt.findUnique({
      where: {
        id: prompt_id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        },
        _count: {
          select: {
            stageMiniPrompts: true,
            references: true
          }
        }
      }
    });

    if (!miniPrompt) {
      return {
        content: [{
          type: "text" as const,
          text: `❌ **Mini prompt not found**: "${prompt_id}"\n\nPlease use \`get_prompts\` to see available mini prompts.`
        }],
      };
    }

    // Check if the mini prompt is active
    const statusBadge = miniPrompt.isActive ? '✅ Active' : '⚠️ Inactive';
    const visibilityBadge = miniPrompt.visibility === 'PUBLIC' ? '🌍 Public' : '🔒 Private';

    // Format metadata
    const metadata = [
      `**Status:** ${statusBadge}`,
      `**Visibility:** ${visibilityBadge}`,
      `**Author:** @${miniPrompt.user.username}`,
      `**Used in Workflows:** ${miniPrompt._count.stageMiniPrompts}`,
      `**In User Libraries:** ${miniPrompt._count.references}`,
      `**Created:** ${miniPrompt.createdAt.toLocaleDateString()}`,
      `**Last Updated:** ${miniPrompt.updatedAt.toLocaleDateString()}`
    ].join('\n');

    return {
      content: [{
        type: "text" as const,
        text: `## 📝 ${miniPrompt.name}\n\n${metadata}\n\n---\n\n${miniPrompt.content}\n\n---\n\n**💡 How to Use:**\nThis mini prompt can be used as a reusable component in workflows or as a standalone guide for specific tasks.`
      }],
    };
  } catch (error) {
    console.error('[MCP] Error in get_selected_prompt:', error);
    return {
      content: [{
        type: "text" as const,
        text: `❌ **Error retrieving mini prompt "${prompt_id}"**\n\nPlease check the prompt ID and try again. Use \`get_prompts\` to see available options.`
      }],
    };
  }
}
