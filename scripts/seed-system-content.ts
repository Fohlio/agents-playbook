import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { globSync } from 'fast-glob';
import YAML from 'yaml';
import { config } from 'dotenv';
import { userWorkflowEmbeddings } from '../src/lib/embeddings/user-workflow-embeddings';

// Load environment variables from project root
config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

// Exclude E2E-related workflows and mini-prompts
const EXCLUDED_WORKFLOWS = ['e2e-test', 'e2e'];
const EXCLUDED_MINI_PROMPTS = ['e2e/', 'e2e-'];

// Helper to simplify mini-prompt names
function simplifyMiniPromptName(filePath: string): string {
  const relativePath = path.relative('public/playbook/mini-prompts', filePath);
  const nameWithoutExt = relativePath.replace(path.extname(relativePath), '');

  // Remove path prefixes, keep just the filename
  // e.g., "analysis/ask-clarifying-questions" -> "Ask Clarifying Questions"
  // e.g., "testing-review/test-cases-planning" -> "Test Cases Planning"
  const fileName = path.basename(nameWithoutExt);

  // Convert kebab-case to Title Case
  return fileName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper to check if workflow should be excluded
function shouldExcludeWorkflow(name: string, fileName: string): boolean {
  const lowerName = name.toLowerCase();
  const lowerFileName = fileName.toLowerCase();
  return EXCLUDED_WORKFLOWS.some(excluded =>
    lowerName.includes(excluded) || lowerFileName.includes(excluded)
  );
}

// Helper to check if mini-prompt should be excluded
function shouldExcludeMiniPrompt(filePath: string): boolean {
  return EXCLUDED_MINI_PROMPTS.some(excluded =>
    filePath.toLowerCase().includes(excluded)
  );
}

// Helper to extract phase color based on phase name
function getPhaseColor(phaseName: string): string {
  const colorMap: { [key: string]: string } = {
    'analysis': '#3B82F6',
    'design': '#8B5CF6',
    'planning': '#EC4899',
    'implementation': '#10B981',
    'testing': '#F59E0B',
    'review': '#EF4444',
    'deployment': '#06B6D4'
  };

  const lowerPhase = phaseName.toLowerCase();
  for (const [key, color] of Object.entries(colorMap)) {
    if (lowerPhase.includes(key)) {
      return color;
    }
  }

  return '#6B7280'; // Default gray
}

async function seedSystemContent() {
  console.log('🌱 Starting system content seed...\n');

  try {
    // 1. Create or find system user
    console.log('👤 Creating/finding system user...');
    const systemUser = await prisma.user.upsert({
      where: { email: 'system@agents-playbook.app' },
      create: {
        email: 'system@agents-playbook.app',
        username: 'system',
        passwordHash: 'N/A', // System user cannot login
        role: 'ADMIN',
        tier: 'PREMIUM'
      },
      update: {}
    });
    console.log(`✅ System user: ${systemUser.id}\n`);

    // 2. Seed mini-prompts first (needed for workflow stage references)
    console.log('📝 Seeding mini-prompts from MD files...');
    const promptFiles = globSync('public/playbook/mini-prompts/**/*.md');
    const miniPromptMap = new Map<string, string>(); // originalPath -> miniPromptId
    let promptCount = 0;
    let skippedPrompts = 0;

    for (const file of promptFiles) {
      try {
        // Skip E2E mini-prompts
        if (shouldExcludeMiniPrompt(file)) {
          console.log(`⏭️  Skipping E2E mini-prompt: ${file}`);
          continue;
        }

        const content = await fs.readFile(file, 'utf-8');
        const simplifiedName = simplifyMiniPromptName(file);
        const originalPath = path.relative('public/playbook/mini-prompts', file).replace(path.extname(file), '');

        // Check if already exists
        const exists = await prisma.miniPrompt.findFirst({
          where: {
            name: simplifiedName,
            isSystemMiniPrompt: true
          }
        });

        if (exists) {
          console.log(`⏭️  Skipping existing mini-prompt: ${simplifiedName}`);
          miniPromptMap.set(originalPath, exists.id);
          skippedPrompts++;
          continue;
        }

        // Create mini-prompt
        const miniPrompt = await prisma.miniPrompt.create({
          data: {
            userId: systemUser.id,
            name: simplifiedName,
            content,
            visibility: 'PUBLIC',
            isSystemMiniPrompt: true
          }
        });

        miniPromptMap.set(originalPath, miniPrompt.id);
        promptCount++;
        console.log(`✅ Seeded mini-prompt: ${simplifiedName}`);
      } catch (error) {
        console.error(`❌ Error processing file ${file}:`, error);
      }
    }

    console.log(`\n📊 Mini-prompts: ${promptCount} created, ${skippedPrompts} skipped\n`);

    // 3. Seed workflows with phases from YAML files
    console.log('📋 Seeding workflows from YAML files...');
    const workflowFiles = globSync('public/playbook/workflows/*.yml');
    let workflowCount = 0;
    let skippedWorkflows = 0;

    for (const file of workflowFiles) {
      try {
        const yamlContent = await fs.readFile(file, 'utf-8');
        const parsed = YAML.parse(yamlContent);

        // Extract workflow name
        const workflowName = parsed.name || path.basename(file, '.yml');
        const fileName = path.basename(file);

        // Skip E2E workflows
        if (shouldExcludeWorkflow(workflowName, fileName)) {
          console.log(`⏭️  Skipping E2E workflow: ${workflowName}`);
          continue;
        }

        // Check if already exists
        const exists = await prisma.workflow.findFirst({
          where: {
            name: workflowName,
            isSystemWorkflow: true
          }
        });

        if (exists) {
          console.log(`⏭️  Skipping existing workflow: ${workflowName}`);
          skippedWorkflows++;
          continue;
        }

        // Create workflow
        const workflow = await prisma.workflow.create({
          data: {
            userId: systemUser.id,
            name: workflowName,
            description: parsed.description || '',
            yamlContent,
            visibility: 'PUBLIC',
            isActive: true,
            isSystemWorkflow: true
          }
        });

        // Create workflow stages from phases
        if (parsed.phases && Array.isArray(parsed.phases)) {
          for (let i = 0; i < parsed.phases.length; i++) {
            const phase = parsed.phases[i];

            const stage = await prisma.workflowStage.create({
              data: {
                workflowId: workflow.id,
                name: phase.phase || `Phase ${i + 1}`,
                description: phase.description || '',
                color: getPhaseColor(phase.phase || ''),
                order: i
              }
            });

            // Link mini-prompts to stage
            if (phase.steps && Array.isArray(phase.steps)) {
              let order = 0;
              for (const step of phase.steps) {
                if (step.miniPrompt) {
                  const miniPromptId = miniPromptMap.get(step.miniPrompt);
                  if (miniPromptId) {
                    await prisma.stageMiniPrompt.create({
                      data: {
                        stageId: stage.id,
                        miniPromptId,
                        order: order++
                      }
                    });
                  } else {
                    console.log(`⚠️  Mini-prompt not found: ${step.miniPrompt}`);
                  }
                }
              }
            }
          }
          console.log(`  📋 Created ${parsed.phases.length} stages for workflow`);
        }

        // Generate embedding
        console.log(`  🔄 Generating embedding for: ${workflowName}...`);
        await userWorkflowEmbeddings.syncWorkflowEmbedding(workflow.id);

        workflowCount++;
        console.log(`✅ Seeded workflow: ${workflowName}`);
      } catch (error) {
        console.error(`❌ Error processing file ${file}:`, error);
      }
    }

    console.log(`\n📊 Workflows: ${workflowCount} created, ${skippedWorkflows} skipped\n`);

    // Summary
    console.log('🎉 Seed completed successfully!');
    console.log(`\n📈 Summary:`);
    console.log(`   • Workflows: ${workflowCount} new, ${skippedWorkflows} existing`);
    console.log(`   • Mini-prompts: ${promptCount} new, ${skippedPrompts} existing`);
    console.log(`   • System user: ${systemUser.email}`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seedSystemContent()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
