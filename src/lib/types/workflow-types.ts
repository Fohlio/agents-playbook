// Types for the new three-level smart workflow architecture
// Workflow → Phases → Steps with smart validation and skipping

// Standard context types based on analysis of all workflow files
export enum StandardContext {
  // Requirements and Planning
  REQUIREMENTS = "requirements",
  CLARIFIED_REQUIREMENTS = "clarified_requirements",
  BUSINESS_REQUIREMENTS = "business_requirements",
  PRODUCT_VISION = "product_vision",
  PROJECT_VISION = "project_vision",
  
  // Analysis
  FEATURE_ANALYSIS = "feature_analysis",
  ARCHITECTURE_ANALYSIS = "architecture_analysis",
  CODE_ANALYSIS = "code_analysis",
  TECHNICAL_REQUIREMENTS = "technical_requirements",
  BUSINESS_ANALYSIS = "business_analysis",
  
  // Design
  DESIGN_SPECIFICATIONS = "design_specifications",
  TECHNICAL_ARCHITECTURE = "technical_architecture",
  IMPLEMENTATION_PLAN = "implementation_plan",
  REFACTORING_DESIGN = "refactoring_design",
  
  // Implementation
  IMPLEMENTED_FEATURE = "implemented_feature",
  IMPLEMENTED_FEATURES = "implemented_features",
  REFACTORED_CODE = "refactored_code",
  COMPLETED_FEATURE = "completed_feature",
  
  // Testing
  TEST_PLAN = "test_plan",
  TESTED_FEATURE = "tested_feature",
  VALIDATED_PRODUCT = "validated_product",
  
  // Documentation
  TRD = "trd",
  BRD_DOCUMENT = "brd_document",
  COMPLETED_TRD = "completed_trd",
  DOCUMENTATION = "documentation",
  
  // Project Context
  PROJECT_CODEBASE = "project_codebase",
  EXISTING_CODEBASE = "existing_codebase",
  SYSTEM_ARCHITECTURE = "system_architecture",
  PROJECT_NAVIGATION = "project_navigation",
  
  // Deployment
  DEPLOYED_APPLICATION = "deployed_application",
  DEPLOYMENT_ENVIRONMENT = "deployment_environment",
  
  // Special cases
  ISSUE_DESCRIPTION = "issue_description",
  BUG_SYMPTOMS = "bug_symptoms",
  INFRASTRUCTURE_REQUIREMENTS = "infrastructure_requirements"
}

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
  fullContent: string; // Complete markdown content of the mini-prompt
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

// Context management types
export interface ContextInfo {
  key: string;
  description: string;
  category: 'requirements' | 'analysis' | 'design' | 'implementation' | 'testing' | 'documentation' | 'project' | 'deployment';
  isOptional?: boolean;
}

export interface StepContextRequirements {
  required: string[];
  optional?: string[];
}

export interface WorkflowStepWithContext extends WorkflowStep {
  contextRequirements: StepContextRequirements;
  availableContext?: string[];
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
    contextRequirements?: StepContextRequirements;
    availableContext?: string[];
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