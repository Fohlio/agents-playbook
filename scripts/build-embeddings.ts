#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import OpenAI from 'openai';
import { config } from 'dotenv';

// Load environment variables
config();

interface WorkflowEmbedding {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  complexity: string;
  searchableText: string;
  embedding: number[];
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const WORKFLOWS_DIR = './public/playbook/workflows';
const OUTPUT_FILE = './public/workflow-embeddings.json';

async function buildEmbeddings() {
  console.log('🚀 Building workflow embeddings...');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is required');
    process.exit(1);
  }

  try {
    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Read all YAML workflow files
    const workflowFiles = fs.readdirSync(WORKFLOWS_DIR)
      .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

    if (workflowFiles.length === 0) {
      console.error('❌ No workflow files found in', WORKFLOWS_DIR);
      process.exit(1);
    }

    console.log(`📄 Found ${workflowFiles.length} workflow files`);

    const embeddings: WorkflowEmbedding[] = [];

    for (const file of workflowFiles) {
      const filePath = path.join(WORKFLOWS_DIR, file);
      const workflowId = path.basename(file, path.extname(file));
      
      console.log(`⚡ Processing: ${workflowId}`);

      try {
        // Read and parse YAML
        const yamlContent = fs.readFileSync(filePath, 'utf-8');
        const workflow = yaml.load(yamlContent) as any;

        // Extract workflow metadata
        const title = workflow.name || workflowId;
        const description = workflow.description || '';
        const category = workflow.category || 'general';
        const tags = workflow.tags || [];
        const complexity = workflow.metadata?.complexity || 'medium';

        // Build searchable text from all relevant fields
        const searchableText = [
          title,
          description,
          category,
          ...tags,
          complexity,
          // Include phases and steps for better searchability
          ...(workflow.phases || []).map((phase: any) => {
            const phaseText = [
              phase.phase || phase.name || '',
              phase.description || '',
              ...(phase.steps || []).map((step: any) => {
                return [
                  step.id || '',
                  step.miniPrompt || '',
                  step.description || ''
                ].join(' ');
              })
            ];
            return phaseText.join(' ');
          })
        ].join(' ').toLowerCase();

        // Generate embedding
        console.log(`🧠 Generating embedding for: ${title}`);
        const embeddingResponse = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: searchableText,
          encoding_format: 'float'
        });

        const embedding: WorkflowEmbedding = {
          id: workflowId,
          title,
          description,
          category,
          tags,
          complexity,
          searchableText,
          embedding: embeddingResponse.data[0].embedding
        };

        embeddings.push(embedding);
        console.log(`✅ Generated embedding for: ${title} (${embeddingResponse.data[0].embedding.length} dimensions)`);

        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
      }
    }

    // Save embeddings to file
    console.log(`💾 Saving ${embeddings.length} embeddings to ${OUTPUT_FILE}`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(embeddings, null, 2));

    console.log('✅ Workflow embeddings generated successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - ${embeddings.length} workflows processed`);
    console.log(`   - Categories: ${[...new Set(embeddings.map(e => e.category))].join(', ')}`);
    console.log(`   - File size: ${Math.round(fs.statSync(OUTPUT_FILE).size / 1024)} KB`);

  } catch (error) {
    console.error('❌ Error building embeddings:', error);
    process.exit(1);
  }
}

// Run the script
buildEmbeddings(); 