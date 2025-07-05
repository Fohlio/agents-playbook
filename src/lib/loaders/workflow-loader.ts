import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { WorkflowConfig, PhaseConfig, StepConfig } from '../types/workflow-types';

export interface WorkflowMetadata {
  id: string;
  title: string;
  description: string;
  category: string;
  complexity: 'Simple' | 'Standard' | 'Complex';
  tags: string[];
  estimatedDuration: string;
  teamSize?: string;
  skillLevel?: string;
}

export class WorkflowLoader {
  private workflowsPath: string;
  private cache: Map<string, WorkflowConfig> = new Map();
  private metadataCache: Map<string, WorkflowMetadata> = new Map();

  constructor(workflowsPath?: string) {
    // Always use public/playbook/workflows for consistency
    this.workflowsPath = workflowsPath || path.join(process.cwd(), 'public', 'playbook', 'workflows');
    console.log(`[WorkflowLoader] Using workflows path: ${this.workflowsPath}`);
  }

  /**
   * Load all available workflows metadata for browsing
   */
  async loadWorkflowsMetadata(): Promise<WorkflowMetadata[]> {
    if (this.metadataCache.size === 0) {
      await this.buildMetadataCache();
    }

    return Array.from(this.metadataCache.values());
  }

  /**
   * Load specific workflow configuration
   */
  async loadWorkflowConfig(workflowId: string): Promise<WorkflowConfig | null> {
    const cacheKey = workflowId;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Load from file
    const workflow = await this.loadWorkflowFromFile(workflowId);
    if (workflow) {
      this.cache.set(cacheKey, workflow);
    }

    return workflow;
  }

  /**
   * Search workflows by description and category
   */
  async searchWorkflows(query: string, limit: number = 5): Promise<WorkflowMetadata[]> {
    const allWorkflows = await this.loadWorkflowsMetadata();
    
    // Simple text-based search for now
    const searchTerms = query.toLowerCase().split(' ');
    
    const scored = allWorkflows.map(workflow => {
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

      return { workflow, score };
    });

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.workflow);
  }

  /**
   * Build metadata cache from all YAML files
   */
  private async buildMetadataCache(): Promise<void> {
    if (!fs.existsSync(this.workflowsPath)) {
      console.warn(`[WorkflowLoader] Workflows directory not found: ${this.workflowsPath}`);
      console.log(`[WorkflowLoader] Current working directory: ${process.cwd()}`);
      console.log(`[WorkflowLoader] Available directories:`, fs.readdirSync(process.cwd()));
      return;
    }

    const files = fs.readdirSync(this.workflowsPath)
      .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));

    console.log(`[WorkflowLoader] Found ${files.length} workflow files:`, files);

    for (const file of files) {
      const workflowId = path.basename(file, path.extname(file));
      const filePath = path.join(this.workflowsPath, file);
      
      try {
        const yamlContent = fs.readFileSync(filePath, 'utf-8');
        const workflowData = yaml.load(yamlContent) as any;
        
        const metadata: WorkflowMetadata = {
          id: workflowId,
          title: workflowData.name || workflowId,
          description: workflowData.description || '',
          category: workflowData.category || 'general',
          complexity: workflowData.metadata?.complexity || 'Standard',
          tags: workflowData.tags || [],
          estimatedDuration: workflowData.metadata?.estimatedDuration || 'Unknown',
          teamSize: workflowData.metadata?.teamSize,
          skillLevel: workflowData.metadata?.skillLevel
        };

        this.metadataCache.set(workflowId, metadata);
      } catch (error) {
        console.error(`[WorkflowLoader] Error loading workflow metadata from ${file}:`, error);
      }
    }
  }

  /**
   * Load workflow from YAML file
   */
  private async loadWorkflowFromFile(workflowId: string): Promise<WorkflowConfig | null> {
    const filePath = path.join(this.workflowsPath, `${workflowId}.yml`);
    
    if (!fs.existsSync(filePath)) {
      // Try .yaml extension
      const altPath = path.join(this.workflowsPath, `${workflowId}.yaml`);
      if (!fs.existsSync(altPath)) {
        console.warn(`[WorkflowLoader] Workflow file not found: ${workflowId}`);
        console.log(`[WorkflowLoader] Tried paths:`, filePath, altPath);
        console.log(`[WorkflowLoader] Directory contents:`, 
          fs.existsSync(this.workflowsPath) ? fs.readdirSync(this.workflowsPath) : 'Directory does not exist');
        return null;
      }
    }

    try {
      const yamlContent = fs.readFileSync(filePath, 'utf-8');
      const workflowData = yaml.load(yamlContent) as any;
      
      // Transform YAML structure to WorkflowConfig
      const workflowConfig: WorkflowConfig = {
        name: workflowData.name || workflowId,
        description: workflowData.description || '',
        complexity: workflowData.metadata?.complexity || 'Standard',
        category: workflowData.category || 'general',
        phases: this.transformPhases(workflowData.phases || []),
        execution_strategy: workflowData.execution?.allowSkipping ? 'smart_skip' : 'linear',
        estimated_duration: workflowData.metadata?.estimatedDuration || 'Unknown'
      };

      console.log(`[WorkflowLoader] Successfully loaded workflow: ${workflowId}`);
      return workflowConfig;
    } catch (error) {
      console.error(`[WorkflowLoader] Error loading workflow ${workflowId}:`, error);
      return null;
    }
  }

  /**
   * Transform YAML phases to PhaseConfig format
   */
  private transformPhases(yamlPhases: any[]): PhaseConfig[] {
    return yamlPhases.map(yamlPhase => {
      const phaseConfig: PhaseConfig = {
        name: yamlPhase.phase || yamlPhase.name,
        required: yamlPhase.required !== false,
        steps: this.transformSteps(yamlPhase.steps || [])
      };

      return phaseConfig;
    });
  }

  /**
   * Transform YAML steps to StepConfig format
   */
  private transformSteps(yamlSteps: any[]): StepConfig[] {
    return yamlSteps.map(yamlStep => {
      const stepConfig: StepConfig = {
        id: yamlStep.id,
        mini_prompt: yamlStep.miniPrompt || yamlStep.mini_prompt || yamlStep.id,
        required: yamlStep.required !== false,
        context: yamlStep.context,
        prerequisites: {
          mcp_servers: yamlStep.prerequisites?.mcpServers || [],
          context: yamlStep.prerequisites?.requiredContext || [],
          optional: yamlStep.prerequisites?.optionalContext || []
        },
        skip_if_missing: yamlStep.prerequisites?.skipConditions || []
      };

      return stepConfig;
    });
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    this.metadataCache.clear();
  }

  /**
   * Get available workflow categories
   */
  async getWorkflowCategories(): Promise<string[]> {
    const workflows = await this.loadWorkflowsMetadata();
    const categories = new Set(workflows.map(w => w.category));
    return Array.from(categories).sort();
  }

  /**
   * Get workflows by category
   */
  async getWorkflowsByCategory(category: string): Promise<WorkflowMetadata[]> {
    const workflows = await this.loadWorkflowsMetadata();
    return workflows.filter(w => w.category === category);
  }
} 