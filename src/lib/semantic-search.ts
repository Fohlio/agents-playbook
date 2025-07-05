import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

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

// Use absolute path for production compatibility
// Try public/ first for Vercel deployment, then fallback to src/data/
function getEmbeddingsPath(): string {
  const publicPath = path.join(process.cwd(), 'public', 'workflow-embeddings.json');
  const localPath = path.join(process.cwd(), 'src', 'data', 'workflow-embeddings.json');
  
  return fs.existsSync(publicPath) ? publicPath : localPath;
}

const EMBEDDINGS_FILE = getEmbeddingsPath();

export class SemanticSearch {
  private embeddings: WorkflowEmbedding[] = [];
  private loaded = false;

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
      console.warn('[SemanticSearch] No embeddings available for search');
      return [];
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
  private fallbackTextSearch(query: string, limit: number): SearchResult[] {
    console.log('[SemanticSearch] Using fallback text search');
    
    const searchTerms = query.toLowerCase().split(' ');
    
    const scored = this.embeddings.map(workflow => {
      let score = 0;
      const searchableText = `${workflow.title} ${workflow.description} ${workflow.category} ${workflow.tags.join(' ')}`.toLowerCase();
      
      searchTerms.forEach(term => {
        if (searchableText.includes(term)) {
          score += 1;
          // Boost score for title matches
          if (workflow.title.toLowerCase().includes(term)) {
            score += 2;
          }
          // Boost score for category matches
          if (workflow.category.toLowerCase().includes(term)) {
            score += 1.5;
          }
        }
      });

      // Normalize score to 0-1 range for consistency
      const normalizedSimilarity = Math.min(score / searchTerms.length, 1);

      return {
        id: workflow.id,
        title: workflow.title,
        description: workflow.description,
        category: workflow.category,
        tags: workflow.tags,
        complexity: workflow.complexity,
        similarity: normalizedSimilarity
      };
    });

    return scored
      .filter(item => item.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
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