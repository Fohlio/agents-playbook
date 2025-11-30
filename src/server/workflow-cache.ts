import fs from 'fs';
import path from 'path';
import { WorkflowParser, ParsedWorkflow } from './workflow-parser';

export interface WorkflowCache {
  workflows: ParsedWorkflow[];
  lastUpdated: string;
  totalCount: number;
  categories: string[];
}

export class WorkflowCacheManager {
  private cachePath: string;
  private parser: WorkflowParser;

  constructor(cachePath: string = './src/data/workflows.json') {
    this.cachePath = cachePath;
    this.parser = new WorkflowParser();
  }

  /**
   * Generate and save workflow cache
   */
  async generateCache(): Promise<WorkflowCache> {
    console.log('[Cache] Generating workflow cache...');
    
    try {
      // Parse all workflows
      const workflows = await this.parser.parseAllWorkflows();
      
      // Generate cache object
      const cache: WorkflowCache = {
        workflows,
        lastUpdated: new Date().toISOString(),
        totalCount: workflows.length,
        categories: [...new Set(workflows.map(w => w.category))]
      };

      // Ensure cache directory exists
      const cacheDir = path.dirname(this.cachePath);
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // Save cache to file
      fs.writeFileSync(this.cachePath, JSON.stringify(cache, null, 2));
      
      console.log(`[Cache] Generated cache with ${workflows.length} workflows`);
      console.log(`[Cache] Categories: ${cache.categories.join(', ')}`);
      
      return cache;
      
    } catch (error) {
      console.error('[Cache] Error generating cache:', error);
      throw error;
    }
  }

  /**
   * Load cache from file
   */
  async loadCache(): Promise<WorkflowCache | null> {
    try {
      if (!fs.existsSync(this.cachePath)) {
        console.log('[Cache] Cache file not found, generating...');
        return await this.generateCache();
      }

      const cacheContent = fs.readFileSync(this.cachePath, 'utf-8');
      const cache: WorkflowCache = JSON.parse(cacheContent);
      
      console.log(`[Cache] Loaded cache with ${cache.totalCount} workflows`);
      return cache;
      
    } catch (error) {
      console.error('[Cache] Error loading cache:', error);
      console.log('[Cache] Regenerating cache...');
      return await this.generateCache();
    }
  }

  /**
   * Check if cache needs refresh
   */
  async shouldRefreshCache(): Promise<boolean> {
    try {
      if (!fs.existsSync(this.cachePath)) {
        return true;
      }

      const cache = await this.loadCache();
      if (!cache) return true;

      // Check if cache is older than 1 hour (for development)
      const cacheAge = Date.now() - new Date(cache.lastUpdated).getTime();
      const oneHour = 60 * 60 * 1000;
      
      return cacheAge > oneHour;
      
    } catch (error) {
      console.error('[Cache] Error checking cache freshness:', error);
      return true;
    }
  }

  /**
   * Get workflows with optional filtering
   */
  async getWorkflows(category?: string): Promise<ParsedWorkflow[]> {
    const cache = await this.loadCache();
    if (!cache) return [];

    if (category) {
      return cache.workflows.filter(w => w.category === category);
    }

    return cache.workflows;
  }

  /**
   * Get workflow by ID
   */
  async getWorkflowById(id: string): Promise<ParsedWorkflow | null> {
    const cache = await this.loadCache();
    if (!cache) return null;

    return cache.workflows.find(w => w.id === id) || null;
  }

  /**
   * Search workflows by keywords
   */
  async searchWorkflows(query: string): Promise<{ workflow: ParsedWorkflow; score: number }[]> {
    const cache = await this.loadCache();
    if (!cache) return [];

    const normalizedQuery = query.toLowerCase();
    const results: { workflow: ParsedWorkflow; score: number }[] = [];

    cache.workflows.forEach(workflow => {
      let score = 0;
      
      // Check title (highest weight)
      if (workflow.title.toLowerCase().includes(normalizedQuery)) {
        score += 50;
      }

      // Check description
      if (workflow.description.toLowerCase().includes(normalizedQuery)) {
        score += 30;
      }

      // Check keywords
      const keywordMatches = workflow.keywords.filter(keyword => 
        keyword.toLowerCase().includes(normalizedQuery) || 
        normalizedQuery.includes(keyword.toLowerCase())
      );
      score += keywordMatches.length * 20;

      // Check use case and output
      if (workflow.use_case.toLowerCase().includes(normalizedQuery)) {
        score += 15;
      }
      if (workflow.output.toLowerCase().includes(normalizedQuery)) {
        score += 15;
      }

      // Partial matches in title/description
      const titleWords = workflow.title.toLowerCase().split(/\s+/);
      const queryWords = normalizedQuery.split(/\s+/);
      const titleMatches = queryWords.filter(word => 
        titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))
      );
      score += titleMatches.length * 10;

      if (score > 0) {
        results.push({ workflow, score });
      }
    });

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }
} 