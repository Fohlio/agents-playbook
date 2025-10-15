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

// Type guards and helpers
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isComplexity(value: unknown): value is 'Simple' | 'Standard' | 'Complex' {
  return isString(value) && ['Simple', 'Standard', 'Complex'].includes(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getString(obj: Record<string, unknown>, key: string, defaultValue: string): string {
  const value = obj[key];
  return isString(value) ? value : defaultValue;
}

function getStringArray(obj: Record<string, unknown>, key: string): string[] {
  const value = obj[key];
  return isStringArray(value) ? value : [];
}

function getComplexity(obj: Record<string, unknown>, key: string): 'Simple' | 'Standard' | 'Complex' {
  const value = obj[key];
  return isComplexity(value) ? value : 'Standard';
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
        const yamlData = yaml.load(yamlContent);
        
        if (!isRecord(yamlData)) {
          throw new Error('Invalid YAML structure: expected object');
        }
        
        const metadataObj = isRecord(yamlData.metadata) ? yamlData.metadata : {};
        
        const metadata: WorkflowMetadata = {
          id: workflowId,
          title: getString(yamlData, 'name', workflowId),
          description: getString(yamlData, 'description', ''),
          category: getString(yamlData, 'category', 'general'),
          complexity: getComplexity(metadataObj, 'complexity'),
          tags: getStringArray(yamlData, 'tags'),
          estimatedDuration: getString(metadataObj, 'estimatedDuration', 'Unknown'),
          teamSize: isString(metadataObj.teamSize) ? metadataObj.teamSize : undefined,
          skillLevel: isString(metadataObj.skillLevel) ? metadataObj.skillLevel : undefined
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
      const yamlData = yaml.load(yamlContent);
      
      if (!isRecord(yamlData)) {
        throw new Error('Invalid YAML structure: expected object');
      }
      
      const metadataObj = isRecord(yamlData.metadata) ? yamlData.metadata : {};
      const executionObj = isRecord(yamlData.execution) ? yamlData.execution : {};
      const phases = Array.isArray(yamlData.phases) ? yamlData.phases : [];
      
      // Transform YAML structure to WorkflowConfig
      const workflowConfig: WorkflowConfig = {
        name: getString(yamlData, 'name', workflowId),
        description: getString(yamlData, 'description', ''),
        complexity: getComplexity(metadataObj, 'complexity'),
        category: getString(yamlData, 'category', 'general'),
        phases: this.transformPhases(phases),
        execution_strategy: executionObj.allowSkipping ? 'smart_skip' : 'linear',
        estimated_duration: getString(metadataObj, 'estimatedDuration', 'Unknown')
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
  private transformPhases(yamlPhases: unknown[]): PhaseConfig[] {
    return yamlPhases.map((phase) => {
      if (!isRecord(phase)) {
        throw new Error('Invalid phase structure: expected object');
      }
      
      const phaseName = isString(phase.phase) ? phase.phase :
                       isString(phase.name) ? phase.name : 'Unknown Phase';
      const steps = Array.isArray(phase.steps) ? phase.steps : [];
      
      const phaseConfig: PhaseConfig = {
        name: phaseName,
        required: phase.required !== false,
        steps: this.transformSteps(steps)
      };

      return phaseConfig;
    });
  }

  /**
   * Transform YAML steps to StepConfig format
   */
  private transformSteps(yamlSteps: unknown[]): StepConfig[] {
    return yamlSteps.map((step) => {
      if (!isRecord(step)) {
        throw new Error('Invalid step structure: expected object');
      }
      
      const stepId = isString(step.id) ? step.id : 'unknown-step';
      const miniPrompt = isString(step.miniPrompt) ? step.miniPrompt :
                        isString(step.mini_prompt) ? step.mini_prompt :
                        stepId;
      
      const prereqObj = isRecord(step.prerequisites) ? step.prerequisites : {};
      
      const stepConfig: StepConfig = {
        id: stepId,
        mini_prompt: miniPrompt,
        required: step.required !== false,
        context: isString(step.context) ? step.context : undefined,
        prerequisites: {
          mcp_servers: getStringArray(prereqObj, 'mcpServers'),
          context: getStringArray(prereqObj, 'requiredContext'),
          optional: getStringArray(prereqObj, 'optionalContext')
        },
        skip_conditions: getStringArray(prereqObj, 'skipConditions')
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