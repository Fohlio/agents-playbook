import { z } from 'zod';
import { prisma } from '@/lib/db/client';

export const getPromptsToolSchema = {
  search: z.string().optional().describe('Optional search term to filter mini prompts by name or content')
};

export async function getPromptsHandler({ search, userId }: { search?: string; userId?: string }) {
  try {
    console.log(`[MCP] Getting active mini prompts from library${search ? ` with search: ${search}` : ''}`);

    // If userId is not provided, show public system mini-prompts only
    if (!userId) {
      const whereClause: {
        isActive: boolean;
        isSystemMiniPrompt: boolean;
        isAutomatic: boolean;
        OR?: Array<{ name?: { contains: string; mode: 'insensitive' } } | { content?: { contains: string; mode: 'insensitive' } }>;
      } = {
        isActive: true,
        isSystemMiniPrompt: true,
        isAutomatic: false  // Exclude automatic prompts (Memory Board, Multi-Agent Chat)
      };

      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' as const } },
          { content: { contains: search, mode: 'insensitive' as const } }
        ];
      }

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
        orderBy: [{ createdAt: 'desc' }],
        take: 20
      });

      if (miniPrompts.length === 0) {
        return {
          content: [{
            type: "text" as const,
            text: `No active system mini prompts found${search ? ` matching "${search}"` : ''}. Try a different search term or authenticate to access your library mini prompts.`
          }],
        };
      }

      const formattedResults = miniPrompts.map((prompt, index: number) => {
        const workflowsUsed = prompt._count.stageMiniPrompts;
        const inLibraries = prompt._count.references;
        const preview = prompt.content.slice(0, 100) + (prompt.content.length > 100 ? '...' : '');

        return `${index + 1}. **${prompt.name}**
   📝 ${preview}
   👤 @${prompt.user.username} | 🔄 Used in ${workflowsUsed} workflows | 📚 In ${inLibraries} libraries
   🆔 ID: ${prompt.id}`;
      });

      return {
        content: [{
          type: "text" as const,
          text: `Found ${miniPrompts.length} active system mini prompts${search ? ` matching "${search}"` : ''}:\n\n${formattedResults.join('\n\n')}\n\n**Next Steps:**\nUse \`get_selected_prompt\` with one of these mini prompt IDs to view full content and details.\n\n**Tip:** Authenticate to access your personal library mini prompts.`
        }],
      };
    }

    // Get owned active mini prompts (exclude automatic prompts)
    const ownedMiniPrompts = await prisma.miniPrompt.findMany({
      where: {
        userId,
        isActive: true,
        isAutomatic: false  // Exclude automatic prompts
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

    // Get referenced active mini prompts (exclude automatic prompts)
    const referencedMiniPrompts = await prisma.miniPromptReference.findMany({
      where: {
        userId,
        miniPrompt: { 
          isActive: true,
          isAutomatic: false  // Exclude automatic prompts
        }
      },
      include: {
        miniPrompt: {
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
        }
      }
    });

    // Combine and deduplicate
    const allMiniPrompts = [
      ...ownedMiniPrompts,
      ...referencedMiniPrompts.map(ref => ref.miniPrompt),
    ];

    let miniPrompts = Array.from(
      new Map(allMiniPrompts.map((mp) => [mp.id, mp])).values()
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      miniPrompts = miniPrompts.filter(mp =>
        mp.name.toLowerCase().includes(searchLower) ||
        mp.content.toLowerCase().includes(searchLower)
      );
    }

    // Limit results
    miniPrompts = miniPrompts.slice(0, 20);

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
