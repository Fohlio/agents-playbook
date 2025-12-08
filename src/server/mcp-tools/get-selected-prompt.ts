import { z } from 'zod';
import { prisma } from '@/server/db/client';

export const getSelectedPromptToolSchema = {
  prompt_id: z.string().describe('ID of the mini prompt (UUID). Use this OR key, not both.'),
  key: z.string().describe('Unique key of a system mini prompt (e.g., "memory-board"). Use this OR prompt_id, not both.')
};

export async function getSelectedPromptHandler({ prompt_id, key }: { prompt_id?: string; key?: string }) {
  try {
    // Validate that at least one identifier is provided
    if (!prompt_id && !key) {
      return {
        content: [{
          type: "text" as const,
          text: `❌ **Missing identifier**\n\nPlease provide either a \`prompt_id\` (UUID) or a \`key\` (e.g., "memory-board") to retrieve a mini prompt.`
        }],
      };
    }

    const identifier = key || prompt_id;
    console.log(`[MCP] Selecting mini prompt by ${key ? 'key' : 'id'}: ${identifier}`);

    // Fetch the mini prompt with metadata - try by key first if provided, otherwise by ID
    let miniPrompt;
    if (key) {
      miniPrompt = await prisma.miniPrompt.findUnique({
        where: { key },
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
    } else if (prompt_id) {
      miniPrompt = await prisma.miniPrompt.findUnique({
        where: { id: prompt_id },
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
    }

    if (!miniPrompt) {
      const lookupType = key ? `key "${key}"` : `ID "${prompt_id}"`;
      return {
        content: [{
          type: "text" as const,
          text: `❌ **Mini prompt not found**: ${lookupType}\n\nPlease use \`get_prompts\` to see available mini prompts, or check if the ${key ? 'key' : 'ID'} is correct.`
        }],
      };
    }

    // Check if this is an automatic prompt (should not be accessible via MCP)
    if (miniPrompt.isAutomatic) {
      return {
        content: [{
          type: "text" as const,
          text: `❌ **Automatic prompt not accessible**: "${identifier}"\n\nThis is an automatic prompt (Memory Board or Multi-Agent Chat) that is auto-injected into workflows. It cannot be accessed directly via MCP tools.\n\nPlease use \`get_prompts\` to see available mini prompts.`
        }],
      };
    }

    // Check if the mini prompt is active
    const statusBadge = miniPrompt.isActive ? '✅ Active' : '⚠️ Inactive';
    const visibilityBadge = miniPrompt.visibility === 'PUBLIC' ? '🌍 Public' : '🔒 Private';
    const systemBadge = miniPrompt.isSystemMiniPrompt ? '🔧 System' : '👤 User';

    // Format metadata - include key if it exists
    const metadataLines = [
      `**Status:** ${statusBadge}`,
      `**Visibility:** ${visibilityBadge}`,
      `**Type:** ${systemBadge}`,
      `**Author:** @${miniPrompt.user.username}`,
    ];
    
    if (miniPrompt.key) {
      metadataLines.push(`**Key:** \`${miniPrompt.key}\``);
    }
    
    metadataLines.push(
      `**Used in Workflows:** ${miniPrompt._count.stageMiniPrompts}`,
      `**In User Libraries:** ${miniPrompt._count.references}`,
      `**Created:** ${miniPrompt.createdAt.toLocaleDateString()}`,
      `**Last Updated:** ${miniPrompt.updatedAt.toLocaleDateString()}`
    );
    
    const metadata = metadataLines.join('\n');

    return {
      content: [{
        type: "text" as const,
        text: `## 📝 ${miniPrompt.name}\n\n${metadata}\n\n---\n\n${miniPrompt.content}\n\n---\n\n**⚠️ Important:** Strictly follow all the steps outlined above.\n\n**💡 How to Use:**\nThis mini prompt can be used as a reusable component in workflows or as a standalone guide for specific tasks.`
      }],
    };
  } catch (error) {
    console.error('[MCP] Error in get_selected_prompt:', error);
    const identifier = key || prompt_id || 'unknown';
    return {
      content: [{
        type: "text" as const,
        text: `❌ **Error retrieving mini prompt "${identifier}"**\n\nPlease check the identifier and try again. Use \`get_prompts\` to see available options.`
      }],
    };
  }
}
