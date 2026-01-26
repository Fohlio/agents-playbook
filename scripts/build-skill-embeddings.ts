/**
 * Build Skill Embeddings Script
 *
 * Generates OpenAI embeddings for all skills that don't have them yet.
 * Fetches skills where SkillEmbedding is null, then calls generateSkillEmbedding
 * for each with a small delay to avoid rate limits.
 *
 * Usage: npx tsx scripts/build-skill-embeddings.ts
 */

import { PrismaClient } from '@prisma/client';
import { generateSkillEmbedding } from '../src/server/skills/skill-embedding-service';

const prisma = new PrismaClient();

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('[build-skill-embeddings] Starting...');

  // Find all skills that don't have embeddings yet
  const skillsWithoutEmbeddings = await prisma.skill.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      embedding: null,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (skillsWithoutEmbeddings.length === 0) {
    console.log('[build-skill-embeddings] All skills already have embeddings. Nothing to do.');
    return;
  }

  console.log(`[build-skill-embeddings] Found ${skillsWithoutEmbeddings.length} skills without embeddings.`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < skillsWithoutEmbeddings.length; i++) {
    const skill = skillsWithoutEmbeddings[i];
    console.log(`[build-skill-embeddings] (${i + 1}/${skillsWithoutEmbeddings.length}) Generating embedding for: ${skill.name}`);

    try {
      await generateSkillEmbedding(skill.id);
      successCount++;
    } catch (error) {
      console.error(`[build-skill-embeddings] Failed for skill ${skill.id} (${skill.name}):`, error);
      errorCount++;
    }

    // Small delay to avoid rate limits (500ms between calls)
    if (i < skillsWithoutEmbeddings.length - 1) {
      await sleep(500);
    }
  }

  console.log(`[build-skill-embeddings] Complete. Success: ${successCount}, Errors: ${errorCount}`);
}

main()
  .catch((error) => {
    console.error('[build-skill-embeddings] Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
