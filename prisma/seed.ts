import { PrismaClient, UserTier, UserRole, ModelCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Predefined AI models
const PREDEFINED_MODELS = [
  // LLMs
  { name: 'Claude', slug: 'claude', category: ModelCategory.LLM },
  { name: 'GPT', slug: 'gpt', category: ModelCategory.LLM },
  { name: 'Gemini', slug: 'gemini', category: ModelCategory.LLM },
  { name: 'Qwen', slug: 'qwen', category: ModelCategory.LLM },
  { name: 'Grok', slug: 'grok', category: ModelCategory.LLM },
  { name: 'Cursor Composer', slug: 'cursor-composer', category: ModelCategory.LLM },
  // Image Models
  { name: 'Midjourney', slug: 'midjourney', category: ModelCategory.IMAGE },
  { name: 'Flux', slug: 'flux', category: ModelCategory.IMAGE },
  { name: 'Stable Diffusion', slug: 'stable-diffusion', category: ModelCategory.IMAGE },
  { name: 'DALL-E', slug: 'dall-e', category: ModelCategory.IMAGE },
];

async function seedModels() {
  console.log('🤖 Seeding predefined AI models...');
  
  for (const model of PREDEFINED_MODELS) {
    await prisma.model.upsert({
      where: { slug: model.slug },
      update: { name: model.name, category: model.category },
      create: model,
    });
  }
  
  console.log(`✅ Seeded ${PREDEFINED_MODELS.length} AI models`);
}

// Test user for E2E tests
const TEST_USER = {
  email: 'test@agents-playbook.com',
  username: 'testuser',
  password: 'Test@123456',
  tier: UserTier.FREE,
  role: UserRole.USER,
};

async function seedTestUser() {
  console.log('👤 Seeding test user for E2E tests...');

  const passwordHash = await bcrypt.hash(TEST_USER.password, 12);

  await prisma.user.upsert({
    where: { email: TEST_USER.email },
    update: {
      username: TEST_USER.username,
      passwordHash,
      tier: TEST_USER.tier,
      role: TEST_USER.role,
    },
    create: {
      email: TEST_USER.email,
      username: TEST_USER.username,
      passwordHash,
      tier: TEST_USER.tier,
      role: TEST_USER.role,
    },
  });

  console.log(`✅ Test user created: ${TEST_USER.email}`);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Seed predefined AI models
  await seedModels();

  // Seed test user for E2E tests (only in non-production)
  if (process.env.NODE_ENV !== 'production') {
    await seedTestUser();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

