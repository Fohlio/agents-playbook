import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { WorkflowLoader } from './loaders/workflow-loader';

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

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  complexity: string;
  similarity: number;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Always use public/workflow-embeddings.json for consistency
const EMBEDDINGS_FILE = path.join(process.cwd(), 'public', 'workflow-embeddings.json');

export class SemanticSearch {
  private embeddings: WorkflowEmbedding[] = [];
  private loaded = false;
  private workflowLoader: WorkflowLoader;

  constructor(workflowsPath?: string) {
    this.workflowLoader = new WorkflowLoader(workflowsPath);
  }

  /**
   * Load embeddings from cache file
   */
  private async loadEmbeddings(): Promise<void> {
    if (this.loaded) return;

    console.log(`[SemanticSearch] Attempting to load embeddings from: ${EMBEDDINGS_FILE}`);

    if (!fs.existsSync(EMBEDDINGS_FILE)) {
      console.warn('[SemanticSearch] Embeddings file not found. Run "npm run build:embeddings" first.');
      console.log(`[SemanticSearch] Current working directory: ${process.cwd()}`);
      console.log(`[SemanticSearch] Looking for file at: ${EMBEDDINGS_FILE}`);
      
      // Try alternative paths for production
      const altPaths = [
        path.join(process.cwd(), 'workflow-embeddings.json'),
        path.join(process.cwd(), 'public', 'workflow-embeddings.json'),
        path.join(process.cwd(), '.next', 'static', 'workflow-embeddings.json')
      ];
      
      for (const altPath of altPaths) {
        if (fs.existsSync(altPath)) {
          console.log(`[SemanticSearch] Found embeddings at alternative path: ${altPath}`);
          const embeddingsData = fs.readFileSync(altPath, 'utf-8');
          this.embeddings = JSON.parse(embeddingsData);
          this.loaded = true;
          console.log(`[SemanticSearch] Loaded ${this.embeddings.length} workflow embeddings`);
          return;
        }
      }
      
      console.log(`[SemanticSearch] Checked alternative paths:`, altPaths);
      return;
    }

    try {
      const embeddingsData = fs.readFileSync(EMBEDDINGS_FILE, 'utf-8');
      this.embeddings = JSON.parse(embeddingsData);
      this.loaded = true;
      console.log(`[SemanticSearch] Loaded ${this.embeddings.length} workflow embeddings`);
    } catch (error) {
      console.error('[SemanticSearch] Error loading embeddings:', error);
    }
  }

  /**
   * Search workflows using semantic similarity
   */
  async searchWorkflows(query: string, limit: number = 5): Promise<SearchResult[]> {
    await this.loadEmbeddings();

    if (this.embeddings.length === 0) {
      console.warn('[SemanticSearch] No embeddings available, falling back to text search');
      return this.fallbackTextSearch(query, limit);
    }

    if (!process.env.OPENAI_API_KEY) {
      console.warn('[SemanticSearch] OpenAI API key not available, falling back to text search');
      return this.fallbackTextSearch(query, limit);
    }

    try {
      // Generate embedding for search query
      console.log(`[SemanticSearch] Generating query embedding for: "${query}"`);
      const queryEmbeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query.toLowerCase(),
        encoding_format: 'float'
      });

      const queryEmbedding = queryEmbeddingResponse.data[0].embedding;

      // Calculate similarities with all workflow embeddings
      const similarities = this.embeddings.map(workflow => {
        const similarity = this.cosineSimilarity(queryEmbedding, workflow.embedding);
        
        return {
          id: workflow.id,
          title: workflow.title,
          description: workflow.description,
          category: workflow.category,
          tags: workflow.tags,
          complexity: workflow.complexity,
          similarity
        };
      });

      // Sort by similarity and return top results
      const results = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      console.log(`[SemanticSearch] Found ${results.length} results with similarities:`, 
        results.map(r => `${r.id}: ${Math.round(r.similarity * 100)}%`));

      return results;

    } catch (error) {
      console.error('[SemanticSearch] Error in semantic search:', error);
      // Fallback to text search
      return this.fallbackTextSearch(query, limit);
    }
  }

  /**
   * Fallback text-based search when semantic search fails
   */
  private async fallbackTextSearch(query: string, limit: number): Promise<SearchResult[]> {
    console.log('[SemanticSearch] Using fallback text search via WorkflowLoader');
    
    try {
      const workflows = await this.workflowLoader.searchWorkflows(query, limit);
      
      return workflows.map(workflow => ({
        id: workflow.id,
        title: workflow.title,
        description: workflow.description,
        category: workflow.category,
        tags: workflow.tags,
        complexity: workflow.complexity,
        similarity: workflow.similarity ?? 0
      }));
    } catch (error) {
      console.error('[SemanticSearch] Error in fallback text search:', error);
      return [];
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Get all available workflow categories
   */
  async getAvailableCategories(): Promise<string[]> {
    await this.loadEmbeddings();
    const categories = [...new Set(this.embeddings.map(w => w.category))];
    return categories.sort();
  }

  /**
   * Get workflows by category
   */
  async getWorkflowsByCategory(category: string): Promise<SearchResult[]> {
    await this.loadEmbeddings();
    
    return this.embeddings
      .filter(w => w.category.toLowerCase() === category.toLowerCase())
      .map(w => ({
        id: w.id,
        title: w.title,
        description: w.description,
        category: w.category,
        tags: w.tags,
        complexity: w.complexity,
        similarity: 1.0 // Perfect match for category filter
      }));
  }

  /**
   * Clear embeddings cache (useful for testing)
   */
  clearCache(): void {
    this.embeddings = [];
    this.loaded = false;
  }
}

// Export singleton instance
export const semanticSearch = new SemanticSearch(); 