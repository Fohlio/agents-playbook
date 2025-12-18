#!/usr/bin/env tsx
/**
 * Populates keys for existing workflows and mini-prompts
 * Run before applying the migration with unique constraint
 */

import { prisma } from '../src/server/db/client';
import { generateUniqueKey } from '../src/shared/lib/generate-key';

async function populateKeys() {
  console.log('Starting key population...\n');

  try {
    // 1. Populate keys for workflows without keys
    console.log('Checking workflows without keys...');
    const workflowsWithoutKeys = await prisma.workflow.findMany({
      where: { key: null },
      select: { id: true, name: true },
    });

    console.log(`Found ${workflowsWithoutKeys.length} workflows without keys`);

    for (const workflow of workflowsWithoutKeys) {
      const key = generateUniqueKey(workflow.name);
      await prisma.workflow.update({
        where: { id: workflow.id },
        data: { key },
      });
      console.log(`✓ Workflow "${workflow.name}" -> key: "${key}"`);
    }

    // 2. Populate keys for mini-prompts without keys
    console.log('\nChecking mini-prompts without keys...');
    const miniPromptsWithoutKeys = await prisma.miniPrompt.findMany({
      where: { key: null },
      select: { id: true, name: true },
    });

    console.log(`Found ${miniPromptsWithoutKeys.length} mini-prompts without keys`);

    for (const miniPrompt of miniPromptsWithoutKeys) {
      const key = generateUniqueKey(miniPrompt.name);
      await prisma.miniPrompt.update({
        where: { id: miniPrompt.id },
        data: { key },
      });
      console.log(`✓ Mini-prompt "${miniPrompt.name}" -> key: "${key}"`);
    }

    console.log('\n✅ Key population completed successfully!');
  } catch (error) {
    console.error('❌ Error populating keys:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

populateKeys();
