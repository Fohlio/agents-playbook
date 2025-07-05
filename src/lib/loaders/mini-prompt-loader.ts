import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MiniPrompt, StepPrerequisites } from '../types/workflow-types';

export class MiniPromptLoader {
  private miniPromptsPath: string;
  private cache: Map<string, MiniPrompt> = new Map();

  constructor(miniPromptsPath: string = './playbook/mini-prompts') {
    this.miniPromptsPath = miniPromptsPath;
  }

  /**
   * Load mini-prompt by phase and step ID
   */
  async loadMiniPrompt(phase: string, stepId: string): Promise<MiniPrompt> {
    const cacheKey = `${phase}:${stepId}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Try to find the mini-prompt file
    const miniPrompt = await this.findAndParseMiniPrompt(stepId);
    
    // Cache and return
    this.cache.set(cacheKey, miniPrompt);
    return miniPrompt;
  }

  /**
   * Find mini-prompt file by step ID across all categories
   */
  private async findAndParseMiniPrompt(stepId: string): Promise<MiniPrompt> {
    const categories = ['development', 'analysis', 'qa', 'business', 'operations', 'migration'];
    
    for (const category of categories) {
      const categoryPath = path.join(this.miniPromptsPath, category);
      
      if (!fs.existsSync(categoryPath)) {
        continue;
      }

      const files = fs.readdirSync(categoryPath).filter(file => file.endsWith('.md'));
      
      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const fileId = path.basename(file, '.md');
        
        // Check if this file matches the step ID
        if (fileId === stepId || file === `${stepId}.md`) {
          return await this.parseMiniPromptFile(filePath);
        }
      }
    }

    // If not found, create a default mini-prompt
    console.warn(`[MiniPromptLoader] Mini-prompt not found for step: ${stepId}`);
    return this.createDefaultMiniPrompt(stepId);
  }

  /**
   * Parse mini-prompt markdown file
   */
  private async parseMiniPromptFile(filePath: string): Promise<MiniPrompt> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Mini-prompt file not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(fileContent);
    const content = parsed.content;
    const frontmatter = parsed.data;

    // Extract title from content or frontmatter
    const title = frontmatter.title || this.extractTitle(content) || path.basename(filePath, '.md');
    
    // Extract purpose
    const purpose = frontmatter.purpose || this.extractPurpose(content) || '';

    // Extract prerequisites
    const prerequisites = this.extractPrerequisites(content, frontmatter);

    // Extract process steps
    const process = this.extractProcess(content, frontmatter);

    // Extract inputs and outputs
    const inputs = this.extractInputs(content, frontmatter);
    const outputs = this.extractOutputs(content, frontmatter);

    // Extract success criteria
    const success_criteria = this.extractSuccessCriteria(content, frontmatter);

    // Extract skip conditions
    const skip_conditions = this.extractSkipConditions(content, frontmatter);

    return {
      title,
      purpose,
      prerequisites,
      validation_logic: frontmatter.validation_logic,
      process,
      inputs,
      outputs,
      success_criteria,
      skip_conditions
    };
  }

  /**
   * Extract title from markdown content
   */
  private extractTitle(content: string): string {
    const match = content.match(/^#\s+(.+)$/m);
    if (match) {
      return match[1].replace(/^(Step\s*[•·]\s*)/i, '').trim();
    }
    return '';
  }

  /**
   * Extract purpose from content
   */
  private extractPurpose(content: string): string {
    const patterns = [
      /##\s*Purpose\s*\n(.+?)(?:\n##|\n\n|\Z)/is,
      /\*\*Purpose\*\*[:\s]*(.+?)(?:\n|\Z)/i
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return '';
  }

  /**
   * Extract prerequisites from content and frontmatter
   */
  private extractPrerequisites(content: string, frontmatter: any): StepPrerequisites {
    // Start with frontmatter prerequisites
    const prerequisites: StepPrerequisites = {
      mcp_servers: frontmatter.mcp_servers || [],
      context: frontmatter.context || [],
      optional: frontmatter.optional || []
    };

    // Extract from content if not in frontmatter
    if (prerequisites.mcp_servers.length === 0) {
      const mcpMatch = content.match(/\*\*Required MCP Servers\*\*[:\s]*(.+?)(?:\n|\Z)/i);
      if (mcpMatch) {
        prerequisites.mcp_servers = mcpMatch[1]
          .split(',')
          .map(s => s.trim())
          .filter(s => s && s !== 'None required');
      }
    }

    if (prerequisites.context.length === 0) {
      const contextMatch = content.match(/\*\*Required Context\*\*[:\s]*(.+?)(?:\n|\Z)/i);
      if (contextMatch) {
        prerequisites.context = contextMatch[1]
          .split(',')
          .map(s => s.trim())
          .filter(s => s);
      }
    }

    if (!prerequisites.optional || prerequisites.optional.length === 0) {
      const optionalMatch = content.match(/\*\*Optional Context\*\*[:\s]*(.+?)(?:\n|\Z)/i);
      if (optionalMatch) {
        prerequisites.optional = optionalMatch[1]
          .split(',')
          .map(s => s.trim())
          .filter(s => s);
      }
    }

    return prerequisites;
  }

  /**
   * Extract process steps
   */
  private extractProcess(content: string, frontmatter: any): string[] {
    if (frontmatter.process && Array.isArray(frontmatter.process)) {
      return frontmatter.process;
    }

    // Extract from content
    const patterns = [
      /##\s*Process\s*\n((?:\d+\.\s*.+\n?)+)/is,
      /##\s*Your Task\s*\n((?:\d+\.\s*.+\n?)+)/is
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1]
          .split('\n')
          .map(line => line.replace(/^\d+\.\s*/, '').trim())
          .filter(line => line);
      }
    }

    return [];
  }

  /**
   * Extract inputs
   */
  private extractInputs(content: string, frontmatter: any): string[] {
    if (frontmatter.inputs && Array.isArray(frontmatter.inputs)) {
      return frontmatter.inputs;
    }

    const match = content.match(/##\s*Inputs\s*\n(.+?)(?:\n##|\Z)/is);
    if (match) {
      return match[1]
        .split('\n')
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line);
    }

    return [];
  }

  /**
   * Extract outputs
   */
  private extractOutputs(content: string, frontmatter: any): string[] {
    if (frontmatter.outputs && Array.isArray(frontmatter.outputs)) {
      return frontmatter.outputs;
    }

    const match = content.match(/##\s*Outputs\s*\n(.+?)(?:\n##|\Z)/is);
    if (match) {
      return match[1]
        .split('\n')
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line);
    }

    return [];
  }

  /**
   * Extract success criteria
   */
  private extractSuccessCriteria(content: string, frontmatter: any): string[] {
    if (frontmatter.success_criteria && Array.isArray(frontmatter.success_criteria)) {
      return frontmatter.success_criteria;
    }

    const match = content.match(/##\s*Success Criteria\s*\n(.+?)(?:\n##|\Z)/is);
    if (match) {
      return match[1]
        .split('\n')
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line);
    }

    return [];
  }

  /**
   * Extract skip conditions
   */
  private extractSkipConditions(content: string, frontmatter: any): string[] {
    if (frontmatter.skip_conditions && Array.isArray(frontmatter.skip_conditions)) {
      return frontmatter.skip_conditions;
    }

    const match = content.match(/##\s*Skip Conditions\s*\n(.+?)(?:\n##|\Z)/is);
    if (match) {
      return match[1]
        .split('\n')
        .map(line => line.replace(/^-\s*/, '').trim())
        .filter(line => line);
    }

    return [];
  }

  /**
   * Create default mini-prompt for missing steps
   */
  private createDefaultMiniPrompt(stepId: string): MiniPrompt {
    return {
      title: stepId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      purpose: `Execute ${stepId} step`,
      prerequisites: {
        mcp_servers: [],
        context: [],
        optional: []
      },
      process: [`Execute ${stepId} step`],
      inputs: ['Previous step outputs'],
      outputs: [`${stepId} results`],
      success_criteria: [`${stepId} completed successfully`],
      skip_conditions: []
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get all available mini-prompts by category
   */
  async getAvailableMiniPrompts(): Promise<Record<string, string[]>> {
    const categories = ['development', 'analysis', 'qa', 'business', 'operations', 'migration'];
    const result: Record<string, string[]> = {};

    for (const category of categories) {
      const categoryPath = path.join(this.miniPromptsPath, category);
      
      if (fs.existsSync(categoryPath)) {
        const files = fs.readdirSync(categoryPath)
          .filter(file => file.endsWith('.md'))
          .map(file => path.basename(file, '.md'));
        
        result[category] = files;
      } else {
        result[category] = [];
      }
    }

    return result;
  }
} 