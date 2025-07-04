#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import OpenAI from 'openai';
import { config } from 'dotenv';

// Load environment variables
config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface WorkflowEmbedding {
  id: string;
  title: string;
  description: string;
  complexity: string;
  category: string;
  keywords: string[];
  file_path: string;
  content_preview: string;
  embedding: number[];
  use_case: string;
  output: string;
}

async function generateEmbeddings() {
  console.log('🔍 Scanning playbook directory...');
  
  const playbookDir = path.join(process.cwd(), 'playbook');
  const workflows: WorkflowEmbedding[] = [];
  
  // Scan all directories in playbook
  const categories = ['planning', 'kickoff', 'qa', 'instructions', 'templates'];
  
  for (const category of categories) {
    const categoryPath = path.join(playbookDir, category);
    
    if (!fs.existsSync(categoryPath)) {
      console.log(`⚠️  Directory ${category} not found, skipping...`);
      continue;
    }
    
    const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.md'));
    console.log(`📁 Processing ${category}: ${files.length} files`);
    
    for (const file of files) {
      try {
        const filePath = path.join(categoryPath, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const parsed = matter(fileContent);
        
        // Extract metadata
        const id = path.basename(file, '.md').replace(/-prompt$/, '');
        const title = parsed.data.title || extractTitle(parsed.content) || id;
        const description = parsed.data.description || extractDescription(parsed.content);
        const complexity = parsed.data.complexity || inferComplexity(parsed.content);
        const keywords = parsed.data.keywords || extractKeywords(title, description, parsed.content);
        const useCase = extractUseCase(parsed.content);
        const output = extractOutput(parsed.content);
        
        // Create content for embedding (title + description + first 1000 chars)
        const embeddingContent = `${title}\n${description}\n${parsed.content.substring(0, 1000)}`;
        
        console.log(`🔄 Generating embedding for: ${title}`);
        
        // Generate embedding
        const response = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: embeddingContent,
        });
        
        workflows.push({
          id,
          title,
          description,
          complexity,
          category,
          keywords,
          file_path: path.relative(process.cwd(), filePath),
          content_preview: parsed.content.substring(0, 300) + '...',
          embedding: response.data[0].embedding,
          use_case: useCase,
          output: output
        });
        
        console.log(`✅ Generated embedding for: ${title}`);
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
      }
    }
  }
  
  // Save embeddings to JSON
  const outputPath = path.join(process.cwd(), 'src', 'data', 'workflow-embeddings.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(workflows, null, 2));
  
  console.log(`🎉 Generated ${workflows.length} workflow embeddings`);
  console.log(`💾 Saved to: ${outputPath}`);
  
  return workflows;
}

// Utility functions
function extractTitle(content: string): string {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].replace(/^(Prompt\s*[•·]\s*)/i, '').trim() : '';
}

function extractDescription(content: string): string {
  const patterns = [
    /use case[:\s]+(.+?)(?:\n|\|)/i,
    /description[:\s]+(.+?)(?:\n|\|)/i,
    /##\s*overview\s*\n(.+?)(?:\n#)/is
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) return match[1].trim();
  }
  
  // Fallback: first meaningful paragraph
  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  return lines[0]?.substring(0, 150) + '...' || '';
}

function inferComplexity(content: string): string {
  const length = content.length;
  const sectionCount = (content.match(/^##/gm) || []).length;
  
  if (length > 3000 || sectionCount > 8) return 'Complex';
  if (length > 1500 || sectionCount > 4) return 'Standard';
  return 'Simple';
}

function extractKeywords(title: string, description: string, content: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  const keywords = new Set<string>();
  
  const commonKeywords = [
    'planning', 'development', 'kickoff', 'qa', 'testing', 'validation',
    'feature', 'bug', 'fix', 'implementation', 'architecture', 'refactoring',
    'product', 'trd', 'brd', 'documentation', 'migration', 'research',
    'analysis', 'specification', 'requirements', 'design'
  ];
  
  commonKeywords.forEach(keyword => {
    if (text.includes(keyword)) keywords.add(keyword);
  });
  
  // Extract from title words
  title.toLowerCase().split(/[\s-]+/).forEach(word => {
    if (word.length > 3) keywords.add(word);
  });
  
  return Array.from(keywords);
}

function extractUseCase(content: string): string {
  const useCaseMatch = content.match(/use case[:\s]+(.+?)(?:\n|\|)/i);
  return useCaseMatch ? useCaseMatch[1].trim() : '';
}

function extractOutput(content: string): string {
  const outputMatch = content.match(/output[:\s]+(.+?)(?:\n|\|)/i);
  return outputMatch ? outputMatch[1].trim() : '';
}

// Run the script
if (require.main === module) {
  generateEmbeddings().catch(console.error);
}

export { generateEmbeddings }; 