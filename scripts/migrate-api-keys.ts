#!/usr/bin/env tsx
/**
 * Migration Script: Clear Old Bcrypt-Hashed OpenAI API Keys
 * 
 * This script clears all existing OpenAI API keys that were hashed with bcrypt
 * (the old implementation). Users will need to re-enter their keys using the 
 * new AES-256-GCM encryption.
 * 
 * Run: npx tsx scripts/migrate-api-keys.ts
 */

import { prisma } from '../src/server/db/client';

async function migrateApiKeys() {
  try {
    console.log('🔄 Starting API key migration...\n');

    // Find all users with API keys
    const usersWithKeys = await prisma.user.findMany({
      where: {
        openaiApiKey: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
        openaiApiKey: true,
      },
    });

    console.log(`📊 Found ${usersWithKeys.length} users with API keys\n`);

    if (usersWithKeys.length === 0) {
      console.log('✅ No API keys to migrate. Exiting.\n');
      return;
    }

    // Check if any keys are bcrypt-hashed (start with $2b$, $2a$, or $2y$)
    const bcryptKeys = usersWithKeys.filter(
      (user) => user.openaiApiKey?.match(/^\$2[aby]\$/)
    );

    if (bcryptKeys.length === 0) {
      console.log('✅ All API keys are already using the new encryption. No migration needed.\n');
      return;
    }

    console.log(`⚠️  Found ${bcryptKeys.length} bcrypt-hashed keys that need to be cleared:\n`);
    bcryptKeys.forEach((user) => {
      console.log(`   - ${user.email}`);
    });
    console.log('');

    // Clear bcrypt-hashed keys
    const result = await prisma.user.updateMany({
      where: {
        openaiApiKey: {
          startsWith: '$2',
        },
      },
      data: {
        openaiApiKey: null,
        openaiApiKeyUpdatedAt: null,
      },
    });

    console.log(`✅ Successfully cleared ${result.count} bcrypt-hashed API keys\n`);
    console.log('📝 Users will need to re-enter their OpenAI API keys in settings.\n');
    console.log('   The new encryption method (AES-256-GCM) is reversible and more secure.\n');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateApiKeys()
  .then(() => {
    console.log('✅ Migration complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });

