import { PrismaClient, UserTier, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ============================================================================
  // Admin User
  // ============================================================================
  const adminEmail = 'admin@agents-playbook.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  
  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        username: 'admin',
        passwordHash: await bcrypt.hash('Admin@123456', 12),
        tier: UserTier.PREMIUM,
        role: UserRole.ADMIN,
      },
    });
    console.log('✅ Created admin user:', {
      id: adminUser.id,
      email: adminUser.email,
      username: adminUser.username,
      tier: adminUser.tier,
      role: adminUser.role,
    });
  } else {
    console.log('ℹ️  Admin user already exists:', {
      id: existingAdmin.id,
      email: existingAdmin.email,
    });
  }
  
  // ============================================================================
  // Test User
  // ============================================================================
  const testEmail = 'test@agents-playbook.com';
  const existingTest = await prisma.user.findUnique({
    where: { email: testEmail },
  });
  
  if (!existingTest) {
    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        username: 'testuser',
        passwordHash: await bcrypt.hash('Test@123456', 12),
        tier: UserTier.FREE,
        role: UserRole.USER,
      },
    });
    console.log('✅ Created test user:', {
      id: testUser.id,
      email: testUser.email,
      username: testUser.username,
      tier: testUser.tier,
      role: testUser.role,
    });
  } else {
    console.log('ℹ️  Test user already exists:', {
      id: existingTest.id,
      email: existingTest.email,
    });
  }
  
  // ============================================================================
  // Default Tags
  // ============================================================================

  // Get admin user for tag creation
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminUser) {
    throw new Error('Admin user not found - cannot create tags');
  }

  const defaultTags = [
    { name: 'development', color: '#3B82F6' },
    { name: 'documentation', color: '#10B981' },
    { name: 'testing', color: '#F59E0B' },
    { name: 'design', color: '#8B5CF6' },
    { name: 'refactoring', color: '#EF4444' },
    { name: 'deployment', color: '#06B6D4' },
    { name: 'analysis', color: '#EC4899' },
    { name: 'planning', color: '#6366F1' },
  ];

  for (const tagData of defaultTags) {
    const existingTag = await prisma.tag.findUnique({
      where: { name: tagData.name },
    });

    if (!existingTag) {
      const tag = await prisma.tag.create({
        data: {
          ...tagData,
          createdBy: adminUser.id,
        },
      });
      console.log(`✅ Created tag: ${tag.name}`);
    } else {
      console.log(`ℹ️  Tag already exists: ${tagData.name}`);
    }
  }

  console.log('🌱 Database seed completed!');
  console.log('');
  console.log('📋 Seed Data Summary:');
  console.log('  Admin:  admin@agents-playbook.com / Admin@123456');
  console.log('  Test:   test@agents-playbook.com / Test@123456');
  console.log(`  Tags:   ${defaultTags.length} default tags created`);
  console.log('');
  console.log('⚠️  WARNING: Change these passwords in production!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

