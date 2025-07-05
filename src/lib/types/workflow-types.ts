// Types for the new three-level smart workflow architecture
// Workflow → Phases → Steps with smart validation and skipping

export interface WorkflowConfig {
  name: string;
  description: string;
  complexity: 'Simple' | 'Standard' | 'Complex';
  category: string;
  phases: PhaseConfig[];
  execution_strategy: 'smart_skip' | 'linear';
  estimated_duration: string;
}

export interface PhaseConfig {
  name: string;
  required: boolean;
  steps: StepConfig[];
}

export interface StepConfig {
  id: string;
  mini_prompt: string; // path to mini-prompt file
  required?: boolean;
  context?: string; // optional context override
  prerequisites: StepPrerequisites;
  skip_if_missing?: string[]; // conditions for auto-skipping
}

export interface StepPrerequisites {
  mcp_servers: string[]; // Required MCP servers
  context: string[]; // Required context items
  optional?: string[]; // Optional context items
}

export interface MiniPrompt {
  title: string;
  purpose: string;
  prerequisites: StepPrerequisites;
  validation_logic?: string; // JavaScript validation function
  process: string[];
  inputs: string[];
  outputs: string[];
  success_criteria: string[];
  skip_conditions: string[];
}

export interface PhaseDefinition {
  name: string;
  purpose: string;
  steps_sequence: string[];
  phase_prerequisites: string[];
  phase_success_criteria: string[];
  skip_conditions: string[];
}

// Execution context and validation

export interface ExecutionContext {
  available_mcp_servers: string[];
  context_data: Map<string, any>;
  workflow_id: string;
  current_phase: string;
  completed_steps: string[];
  skipped_steps: SkippedStep[];
}

export interface SkippedStep {
  id: string;
  reason: string;
  step_title: string;
}

export interface StepValidation {
  hasRequiredMCP: boolean;
  hasRequiredContext: boolean;
  hasOptionalContext: string[];
  canExecute: boolean;
  skipReasons: string[];
  missingMCP: string[];
  missingContext: string[];
}

export interface WorkflowStep {
  id: string;
  miniPrompt: MiniPrompt;
  phase: string;
  stepNumber: number;
  totalSteps: number;
  validation: StepValidation;
  prerequisites: StepPrerequisites;
  skipIfMissing: string[];
}

// Execution responses for MCP tools

export interface GetNextStepResponse {
  workflow: string;
  currentPhase: {
    name: string;
    stepInPhase: number;
    totalInPhase: number;
  };
  currentStep: {
    stepNumber: number;
    totalSteps: number;
    miniPrompt: MiniPrompt;
    validation: StepValidation;
    progress: string;
    note?: string;
  };
  skippedSteps: SkippedStep[];
  isComplete: boolean;
}

export interface WorkflowExecutionPlan {
  workflow_id: string;
  total_steps: number;
  executable_steps: number;
  skipped_steps: SkippedStep[];
  execution_rate: number; // percentage of steps that will execute
  phases: PhaseExecutionPlan[];
}

export interface PhaseExecutionPlan {
  name: string;
  total_steps: number;
  executable_steps: number;
  skipped_steps: SkippedStep[];
  steps: StepExecutionPlan[];
}

export interface StepExecutionPlan {
  id: string;
  title: string;
  will_execute: boolean;
  skip_reason?: string;
  validation: StepValidation;
}

// File system structure types

export interface WorkflowFileStructure {
  workflows_dir: string; // playbook/workflows/
  phases_dir: string; // playbook/phases/
  mini_prompts_dir: string; // playbook/mini-prompts/
}

export interface MiniPromptCategory {
  name: string;
  path: string;
  prompts: string[];
} 