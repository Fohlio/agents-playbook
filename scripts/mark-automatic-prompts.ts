/**
 * Mark automatic mini-prompts (Memory Board and Internal Agents Chat) as automatic
 * These prompts are auto-injected and should not appear in discover section
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function markAutomaticPrompts() {
  try {
    console.log('Marking automatic mini-prompts...');

    // Update Memory Board prompt
    const memoryBoardResult = await prisma.miniPrompt.updateMany({
      where: {
        name: {
          contains: 'Handoff Memory Board',
        },
        isSystemMiniPrompt: true,
      },
      data: {
        isAutomatic: true,
      },
    });

    console.log(`Updated ${memoryBoardResult.count} Memory Board prompt(s)`);

    // Update Internal Agents Chat prompt
    const agentsChatResult = await prisma.miniPrompt.updateMany({
      where: {
        name: {
          contains: 'Internal Agents Chat',
        },
        isSystemMiniPrompt: true,
      },
      data: {
        isAutomatic: true,
      },
    });

    console.log(`Updated ${agentsChatResult.count} Internal Agents Chat prompt(s)`);

    console.log('✅ Successfully marked automatic mini-prompts');
  } catch (error) {
    console.error('Error marking automatic prompts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

markAutomaticPrompts();
