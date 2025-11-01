/**
 * Seed Automatic Mini-Prompts (Memory Board v2 & Internal Agents Chat v2)
 *
 * This script seeds or updates the two automatic system mini-prompts:
 * 1. Handoff Memory Board (v2) - For stage-level review
 * 2. Internal Agents Chat (v2) - For workflow-level multi-agent coordination
 *
 * Run after database migrations to ensure automatic prompts are available.
 * Safe to run multiple times - uses upsert logic.
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

const AUTOMATIC_PROMPTS_DIR = 'public/playbook/mini-prompts/automatic';

interface AutomaticPromptConfig {
  fileName: string;
  name: string;
  description: string;
}

const AUTOMATIC_PROMPTS: AutomaticPromptConfig[] = [
  {
    fileName: 'handoff-memory-board-v2.md',
    name: 'Handoff Memory Board',
    description: 'Document phase completion, track file changes, and capture learnings. Automatically added to stages with review enabled.',
  },
  {
    fileName: 'internal-agents-chat-v2.md',
    name: 'Internal Agents Chat',
    description: 'Enable multi-agent coordination through internal chat for parallel work execution. Automatically added after each mini-prompt when multi-agent chat is enabled.',
  },
];

async function seedAutomaticPrompts() {
  console.log('🤖 Seeding automatic mini-prompts...\n');

  try {
    // 1. Find or create system user
    console.log('👤 Finding/creating system user...');
    const systemUser = await prisma.user.upsert({
      where: { email: 'system@agents-playbook.app' },
      update: {},
      create: {
        email: 'system@agents-playbook.app',
        username: 'system',
        passwordHash: 'N/A', // System user doesn't need login
        role: 'ADMIN',
      },
    });
    console.log(`✅ System user: ${systemUser.email}\n`);

    // 2. Process each automatic prompt
    for (const promptConfig of AUTOMATIC_PROMPTS) {
      console.log(`📋 Processing: ${promptConfig.name}`);

      // Read prompt content from file
      const filePath = path.join(process.cwd(), AUTOMATIC_PROMPTS_DIR, promptConfig.fileName);

      let content: string;
      try {
        content = await fs.readFile(filePath, 'utf-8');
      } catch (error) {
        console.error(`❌ Failed to read ${promptConfig.fileName}:`, error);
        console.log(`   Skipping ${promptConfig.name}\n`);
        continue;
      }

      // Upsert mini-prompt (find by name and system flag)
      const existingPrompt = await prisma.miniPrompt.findFirst({
        where: {
          name: promptConfig.name,
          isSystemMiniPrompt: true,
        },
      });

      if (existingPrompt) {
        // Update existing prompt
        await prisma.miniPrompt.update({
          where: { id: existingPrompt.id },
          data: {
            content,
            description: promptConfig.description,
            isActive: true,
            updatedAt: new Date(),
          },
        });
        console.log(`   ✅ Updated existing prompt (ID: ${existingPrompt.id})`);
      } else {
        // Create new prompt
        const newPrompt = await prisma.miniPrompt.create({
          data: {
            userId: systemUser.id,
            name: promptConfig.name,
            description: promptConfig.description,
            content,
            visibility: 'PUBLIC',
            isActive: true,
            isSystemMiniPrompt: true,
          },
        });
        console.log(`   ✅ Created new prompt (ID: ${newPrompt.id})`);
      }

      console.log('');
    }

    console.log('✅ Automatic prompts seeded successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Run: npm run build:embeddings');
    console.log('   2. Verify prompts in admin panel: /dashboard/admin/system-prompts\n');

  } catch (error) {
    console.error('❌ Error seeding automatic prompts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  seedAutomaticPrompts()
    .then(() => {
      console.log('🎉 Seed complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seed failed:', error);
      process.exit(1);
    });
}

export { seedAutomaticPrompts };
