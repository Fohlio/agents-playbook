import {
  WorkflowConfig,
  WorkflowStep,
  ExecutionContext,
  StepValidation,
  StepPrerequisites,
  SkippedStep,
  WorkflowExecutionPlan,
  PhaseExecutionPlan,
  StepExecutionPlan,
  MiniPrompt
} from '../types/workflow-types';

export class WorkflowValidator {
  private context: ExecutionContext;
  private mcpRegistry: MCPRegistry;

  constructor(context: ExecutionContext, mcpRegistry: MCPRegistry) {
    this.context = context;
    this.mcpRegistry = mcpRegistry;
  }

  /**
   * Validate if a step can be executed
   */
  validateStep(step: WorkflowStep): StepValidation {
    const validation: StepValidation = {
      hasRequiredMCP: true,
      hasRequiredContext: true,
      hasOptionalContext: [],
      canExecute: false,
      skipReasons: [],
      missingMCP: [],
      missingContext: []
    };

    // Check MCP servers
    const mcpCheck = this.checkMCPServers(step.prerequisites.mcp_servers);
    validation.hasRequiredMCP = mcpCheck.allAvailable;
    validation.missingMCP = mcpCheck.missing;

    // Check required context
    const contextCheck = this.checkRequiredContext(step.prerequisites.context);
    validation.hasRequiredContext = contextCheck.allAvailable;
    validation.missingContext = contextCheck.missing;

    // Check optional context
    validation.hasOptionalContext = this.getAvailableOptional(
      step.prerequisites.optional || []
    );

    // Steps should always be executable unless MCP servers are missing
    // Context missing is not a reason to skip automatically
    validation.canExecute = validation.hasRequiredMCP;

    // Add skip reasons for missing MCP servers only
    if (!validation.hasRequiredMCP) {
      validation.skipReasons.push(
        ...validation.missingMCP.map(mcp => `Missing MCP server: ${mcp}`)
      );
    }

    // Note: Missing context is not a reason to skip steps automatically
    // Steps should provide guidance on gathering missing context

    return validation;
  }

  /**
   * Plan entire workflow execution with smart skipping
   */
  planWorkflowExecution(workflow: WorkflowConfig): WorkflowExecutionPlan {
    const plan: WorkflowExecutionPlan = {
      workflow_id: workflow.name,
      total_steps: 0,
      executable_steps: 0,
      skipped_steps: [],
      execution_rate: 0,
      phases: []
    };

    for (const phaseConfig of workflow.phases) {
      const phasePlan = this.planPhaseExecution(phaseConfig, workflow.name);
      plan.phases.push(phasePlan);
      plan.total_steps += phasePlan.total_steps;
      plan.executable_steps += phasePlan.executable_steps;
      plan.skipped_steps.push(...phasePlan.skipped_steps);
    }

    plan.execution_rate = plan.total_steps > 0 
      ? Math.round((plan.executable_steps / plan.total_steps) * 100)
      : 0;

    return plan;
  }

  /**
   * Plan phase execution
   */
  private planPhaseExecution(phaseConfig: any, workflowId: string): PhaseExecutionPlan {
    const phasePlan: PhaseExecutionPlan = {
      name: phaseConfig.name,
      total_steps: phaseConfig.steps.length,
      executable_steps: 0,
      skipped_steps: [],
      steps: []
    };

    for (const stepConfig of phaseConfig.steps) {
              // Create mock WorkflowStep for validation
        const mockStep: WorkflowStep = {
          id: stepConfig.id,
          miniPrompt: {} as MiniPrompt, // Will be loaded separately
          phase: phaseConfig.name,
          stepNumber: 0, // Will be set later
          totalSteps: 0, // Will be set later
          validation: {} as StepValidation, // Will be set below
          prerequisites: stepConfig.prerequisites,
          skipConditions: stepConfig.skip_conditions || []
        };

      const validation = this.validateStep(mockStep);
      
      const stepPlan: StepExecutionPlan = {
        id: stepConfig.id,
        title: stepConfig.id, // Will be updated with actual title
        will_execute: validation.canExecute,
        skip_reason: validation.skipReasons.join(', ') || undefined,
        validation
      };

      phasePlan.steps.push(stepPlan);

      if (validation.canExecute) {
        phasePlan.executable_steps++;
      } else {
        phasePlan.skipped_steps.push({
          id: stepConfig.id,
          reason: validation.skipReasons.join(', '),
          step_title: stepConfig.id
        });
      }
    }

    return phasePlan;
  }

  /**
   * Get next executable step in workflow
   */
  getNextExecutableStep(
    workflow: WorkflowConfig, 
    currentStep: number
  ): WorkflowStep | null {
    let stepIndex = 0;
    
    for (const phaseConfig of workflow.phases) {
      for (const stepConfig of phaseConfig.steps) {
        stepIndex++;
        
        if (stepIndex <= currentStep) {
          continue; // Skip already completed steps
        }

        // Create WorkflowStep for validation
        const workflowStep: WorkflowStep = {
          id: stepConfig.id,
          miniPrompt: {} as MiniPrompt, // Will be loaded separately
          phase: phaseConfig.name,
          stepNumber: stepIndex,
          totalSteps: this.getTotalExecutableSteps(workflow),
          validation: {} as StepValidation,
          prerequisites: stepConfig.prerequisites,
          skipConditions: stepConfig.skip_conditions || []
        };

        const validation = this.validateStep(workflowStep);
        workflowStep.validation = validation;

        if (validation.canExecute) {
          return workflowStep;
        }

        // Log skipped step
        this.logSkippedStep(workflowStep, validation.skipReasons);
      }
    }

    return null; // Workflow complete
  }

  /**
   * Check if MCP servers are available
   */
  private checkMCPServers(requiredServers: string[]): {
    allAvailable: boolean;
    missing: string[];
  } {
    const missing = requiredServers.filter(server => 
      !this.mcpRegistry.isAvailable(server)
    );
    
    return {
      allAvailable: missing.length === 0,
      missing
    };
  }

  /**
   * Check if required context is available
   */
  private checkRequiredContext(requiredContext: string[]): {
    allAvailable: boolean;
    missing: string[];
  } {
    const missing = requiredContext.filter(ctx => 
      !this.context.context_data.has(ctx)
    );
    
    return {
      allAvailable: missing.length === 0,
      missing
    };
  }

  /**
   * Get available optional context items
   */
  private getAvailableOptional(optionalItems: string[]): string[] {
    return optionalItems.filter(item => 
      this.context.context_data.has(item) || 
      this.mcpRegistry.isAvailable(item)
    );
  }

  /**
   * Check skip conditions - these are positive conditions that suggest skipping
   * when present (not when missing)
   */
  checkSkipSuggestions(skipConditions: string[]): {
    canSkip: boolean;
    reasons: string[];
  } {
    const presentConditions = skipConditions.filter(condition => 
      this.context.context_data.has(condition) || 
      this.mcpRegistry.isAvailable(condition)
    );

    return {
      canSkip: presentConditions.length > 0,
      reasons: presentConditions.map(condition => `${condition} is already available`)
    };
  }

  /**
   * Get total executable steps in workflow
   */
  private getTotalExecutableSteps(workflow: WorkflowConfig): number {
    const plan = this.planWorkflowExecution(workflow);
    return plan.executable_steps;
  }

  /**
   * Log skipped step with detailed reason
   */
  private logSkippedStep(step: WorkflowStep, reasons: string[]): void {
    console.log(`[Workflow] Skipping step "${step.id}": ${reasons.join(', ')}`);
    
    // Add to execution context
    this.context.skipped_steps.push({
      id: step.id,
      reason: reasons.join(', '),
      step_title: step.id
    });
  }

  /**
   * Update execution context after step completion
   */
  updateContextAfterStep(stepId: string, outputs: Record<string, any>): void {
    // Mark step as completed (avoid duplicates)
    if (!this.context.completed_steps.includes(stepId)) {
      this.context.completed_steps.push(stepId);
      console.log(`[WorkflowValidator] Step completed: ${stepId}`);
    }
    
    // Add step outputs to context
    for (const [key, value] of Object.entries(outputs)) {
      this.context.context_data.set(key, value);
      console.log(`[WorkflowValidator] Added context: ${key} = ${value}`);
    }
  }
}

/**
 * MCP Registry interface for checking server availability
 */
export interface MCPRegistry {
  isAvailable(serverName: string): boolean;
  getAvailableServers(): string[];
}

/**
 * Default MCP Registry implementation
 */
export class DefaultMCPRegistry implements MCPRegistry {
  private availableServers: Set<string> = new Set();

  constructor(availableServers: string[] = []) {
    this.availableServers = new Set(availableServers);
  }

  isAvailable(serverName: string): boolean {
    return this.availableServers.has(serverName);
  }

  getAvailableServers(): string[] {
    return Array.from(this.availableServers);
  }

  addServer(serverName: string): void {
    this.availableServers.add(serverName);
  }

  removeServer(serverName: string): void {
    this.availableServers.delete(serverName);
  }
} 