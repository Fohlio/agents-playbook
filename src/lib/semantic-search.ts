import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface WorkflowEmbedding {
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

export interface WorkflowSearchResult extends Omit<WorkflowEmbedding, 'embedding'> {
  similarity_score: number;
  match_score: number; // For compatibility with existing code
}

let cachedWorkflows: WorkflowEmbedding[] | null = null;

/**
 * Load workflow embeddings from JSON file
 */
export function loadWorkflowEmbeddings(): WorkflowEmbedding[] {
  if (cachedWorkflows) return cachedWorkflows;
  
  try {
    const embeddingsPath = path.join(process.cwd(), 'src', 'data', 'workflow-embeddings.json');
    const data = fs.readFileSync(embeddingsPath, 'utf-8');
    cachedWorkflows = JSON.parse(data);
    console.log(`[SemanticSearch] Loaded ${cachedWorkflows?.length || 0} workflow embeddings`);
    return cachedWorkflows || [];
  } catch (error) {
    console.error('[SemanticSearch] Failed to load embeddings:', error);
    return [];
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generate embedding for a search query
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('[SemanticSearch] Failed to generate query embedding:', error);
    throw error;
  }
}

/**
 * Search workflows using semantic similarity
 */
export async function searchWorkflowsBySemantic(
  query: string, 
  limit: number = 5,
  threshold: number = 0.7
): Promise<WorkflowSearchResult[]> {
  try {
    console.log(`[SemanticSearch] Searching for: "${query}"`);
    
    // Load workflows
    const workflows = loadWorkflowEmbeddings();
    if (workflows.length === 0) {
      console.warn('[SemanticSearch] No workflows loaded, falling back to empty results');
      return [];
    }
    
    // Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(query);
    
    // Calculate similarities
    const results: WorkflowSearchResult[] = [];
    
    for (const workflow of workflows) {
      const similarity = cosineSimilarity(queryEmbedding, workflow.embedding);
      
      if (similarity >= threshold) {
        results.push({
          ...workflow,
          similarity_score: similarity,
          match_score: Math.round(similarity * 100), // Convert to percentage for compatibility
        });
      }
    }
    
    // Sort by similarity (highest first) and limit results
    return results
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit);
      
  } catch (error) {
    console.error('[SemanticSearch] Search failed:', error);
    throw error;
  }
}

/**
 * Get full workflow content from file
 */
export function getFullWorkflowContent(workflow: WorkflowEmbedding): string {
  try {
    const filePath = path.join(process.cwd(), workflow.file_path);
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`[SemanticSearch] Failed to read workflow file ${workflow.file_path}:`, error);
    return workflow.content_preview;
  }
}

/**
 * Parse workflow steps from content (simple implementation)
 */
export function parseWorkflowSteps(content: string): Array<{step: number, title: string, content: string}> {
  const steps: Array<{step: number, title: string, content: string}> = [];
  
  // Look for numbered sections or workflow sections
  const workflowMatch = content.match(/## Workflow\s*\n([\s\S]+?)(?:\n##|$)/i);
  const workflowContent = workflowMatch ? workflowMatch[1] : content;
  
  // Try to find numbered steps
  const stepMatches = workflowContent.match(/(\d+)\.\s*\*\*(.+?)\*\*[:\s]*(.+?)(?=\n\d+\.|$)/gs);
  
  if (stepMatches) {
    stepMatches.forEach((stepMatch, index) => {
      const match = stepMatch.match(/(\d+)\.\s*\*\*(.+?)\*\*[:\s]*([\s\S]+)/);
      if (match) {
        steps.push({
          step: parseInt(match[1]),
          title: match[2].trim(),
          content: match[3].trim()
        });
      }
    });
  }
  
  // Fallback: create generic steps if no specific workflow found
  if (steps.length === 0) {
    steps.push({
      step: 1,
      title: "Follow the Prompt",
      content: "Use this workflow prompt as guidance for your task. Adapt the instructions to your specific needs."
    });
  }
  
  return steps;
} 