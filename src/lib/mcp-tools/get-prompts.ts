import { z } from 'zod';
import { prisma } from '@/lib/db/client';

export const getPromptsToolSchema = {
  search: z.string().optional().describe('Optional search term to filter mini prompts by name or content')
};

export async function getPromptsHandler({ search }: { search?: string }) {
  try {
    console.log(`[MCP] Getting active mini prompts${search ? ` with search: ${search}` : ''}`);

    // Build where clause for active, public mini prompts
    const whereClause: any = {
      isActive: true,
      visibility: 'PUBLIC'
    };

    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Fetch active mini prompts with metadata
    const miniPrompts = await prisma.miniPrompt.findMany({
      where: whereClause,
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
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      take: 20 // Limit results
    });

    if (miniPrompts.length === 0) {
      return {
        content: [{
          type: "text" as const,
          text: `No active mini prompts found${search ? ` matching "${search}"` : ''}. Try a different search term or check if any mini prompts are marked as active.`
        }],
      };
    }

    // Format results in a user-friendly way
    const formattedResults = miniPrompts.map((prompt, index: number) => {
      const workflowsUsed = prompt._count.stageMiniPrompts;
      const inLibraries = prompt._count.references;

      // Preview first 100 chars of content
      const preview = prompt.content.slice(0, 100) + (prompt.content.length > 100 ? '...' : '');

      return `${index + 1}. **${prompt.name}**
   📝 ${preview}
   👤 @${prompt.user.username} | 🔄 Used in ${workflowsUsed} workflows | 📚 In ${inLibraries} libraries
   🆔 ID: ${prompt.id}`;
    });

    return {
      content: [{
        type: "text" as const,
        text: `Found ${miniPrompts.length} active mini prompts${search ? ` matching "${search}"` : ''}:\n\n${formattedResults.join('\n\n')}\n\n**Next Steps:**\nUse \`get_selected_prompt\` with one of these mini prompt IDs to view full content and details.`
      }],
    };
  } catch (error) {
    console.error('[MCP] Error in get_prompts:', error);
    return {
      content: [{ type: "text" as const, text: 'Error: Failed to fetch mini prompts. Please try again.' }],
    };
  }
}
