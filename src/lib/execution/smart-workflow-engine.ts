import {
  WorkflowConfig,
  WorkflowStep,
  ExecutionContext,
  GetNextStepResponse,
  WorkflowExecutionPlan,
  MiniPrompt
} from '../types/workflow-types';
import { WorkflowValidator, MCPRegistry } from '../validation/workflow-validator';
import { MiniPromptLoader } from '../loaders/mini-prompt-loader';

export class SmartWorkflowEngine {
  private validator: WorkflowValidator;
  private miniPromptLoader: MiniPromptLoader;
  private context: ExecutionContext;

  constructor(
    context: ExecutionContext,
    mcpRegistry: MCPRegistry,
    miniPromptLoader: MiniPromptLoader
  ) {
    this.context = context;
    this.validator = new WorkflowValidator(context, mcpRegistry);
    this.miniPromptLoader = miniPromptLoader;
  }

  /**
   * Execute smart workflow planning and get execution summary
   */
  async planWorkflow(workflow: WorkflowConfig): Promise<WorkflowExecutionPlan> {
    console.log(`[SmartEngine] Planning workflow: ${workflow.name}`);
    
    const plan = this.validator.planWorkflowExecution(workflow);
    
    console.log(`[SmartEngine] Execution plan:
      - Total steps: ${plan.total_steps}
      - Executable steps: ${plan.executable_steps}
      - Skipped steps: ${plan.skipped_steps.length}
      - Execution rate: ${plan.execution_rate}%`);

    if (plan.skipped_steps.length > 0) {
      console.log(`[SmartEngine] Skipped steps:`);
      plan.skipped_steps.forEach(skip => {
        console.log(`  - ${skip.id}: ${skip.reason}`);
      });
    }

    return plan;
  }

  /**
   * Get next step with smart skipping
   */
  async getNextStep(
    workflow: WorkflowConfig,
    currentStep: number
  ): Promise<GetNextStepResponse | null> {
    console.log(`[SmartEngine] Getting next step after ${currentStep}`);

    // Get next executable step
    const nextStep = this.validator.getNextExecutableStep(workflow, currentStep);
    
    if (!nextStep) {
      console.log(`[SmartEngine] Workflow complete`);
      return {
        workflow: workflow.name,
        currentPhase: { name: 'Complete', stepInPhase: 0, totalInPhase: 0 },
        currentStep: {
          stepNumber: 0,
          totalSteps: 0,
          miniPrompt: {} as MiniPrompt,
          validation: {
            hasRequiredMCP: true,
            hasRequiredContext: true,
            hasOptionalContext: [],
            canExecute: false,
            skipReasons: ['Workflow complete'],
            missingMCP: [],
            missingContext: []
          },
          progress: '100% complete'
        },
        skippedSteps: this.context.skipped_steps,
        isComplete: true
      };
    }

    // Load mini-prompt for the step
    const miniPrompt = await this.miniPromptLoader.loadMiniPrompt(
      nextStep.phase,
      nextStep.id
    );
    nextStep.miniPrompt = miniPrompt;

    // Calculate phase progress
    const phaseInfo = this.calculatePhaseProgress(workflow, nextStep);
    
    // Calculate total progress
    const totalExecutable = this.validator.planWorkflowExecution(workflow).executable_steps;
    const completedExecutable = this.context.completed_steps.length;
    const progressPercent = Math.round((completedExecutable / totalExecutable) * 100);

    const response: GetNextStepResponse = {
      workflow: workflow.name,
      currentPhase: {
        name: nextStep.phase,
        stepInPhase: phaseInfo.stepInPhase,
        totalInPhase: phaseInfo.totalInPhase
      },
      currentStep: {
        stepNumber: completedExecutable + 1,
        totalSteps: totalExecutable,
        miniPrompt: nextStep.miniPrompt,
        validation: nextStep.validation,
        progress: `${progressPercent}% complete (Step ${completedExecutable + 1}/${totalExecutable})`,
        note: this.generateProgressNote(nextStep, this.context.skipped_steps.length)
      },
      skippedSteps: this.context.skipped_steps,
      isComplete: false
    };

    console.log(`[SmartEngine] Next step: ${nextStep.id} (${nextStep.phase})`);
    return response;
  }

  /**
   * Mark step as completed and update context
   */
  async completeStep(
    stepId: string,
    outputs: Record<string, unknown>
  ): Promise<void> {
    console.log(`[SmartEngine] Completing step: ${stepId}`);
    
    this.validator.updateContextAfterStep(stepId, outputs);
    
    console.log(`[SmartEngine] Step ${stepId} completed. Context updated with outputs.`);
  }

  /**
   * Skip step manually with reason
   * ⚠️ WARNING: This is an agents playbook workflow - only skip if absolutely necessary
   */
  async skipStep(stepId: string, reason: string): Promise<void> {
    console.log(`[SmartEngine] ⚠️ WARNING: Skipping agents playbook step: ${stepId} - ${reason}`);
    console.log(`[SmartEngine] ⚠️ REMINDER: Agents playbook workflows are designed to be followed completely for optimal results`);
    
    this.context.skipped_steps.push({
      id: stepId,
      reason: `Manual skip: ${reason} (⚠️ Agents playbook step skipped)`,
      step_title: stepId
    });
  }

  /**
   * Get skip suggestions based on skip conditions
   */
  getSkipSuggestions(skipConditions: string[]): {
    canSkip: boolean;
    reasons: string[];
  } {
    return this.validator.checkSkipSuggestions(skipConditions);
  }

  /**
   * Get current execution summary
   */
  getExecutionSummary(workflow?: WorkflowConfig): {
    completed: number;
    skipped: number;
    remaining: number;
    completionRate: number;
  } {
    let executableSteps = 1; // Default to 1 to avoid division by zero
    
    if (workflow) {
      const plan = this.validator.planWorkflowExecution(workflow);
      executableSteps = plan.executable_steps;
    }
    
    return {
      completed: this.context.completed_steps.length,
      skipped: this.context.skipped_steps.length,
      remaining: Math.max(0, executableSteps - this.context.completed_steps.length),
      completionRate: this.context.completed_steps.length / executableSteps
    };
  }

  /**
   * Calculate phase progress information
   */
  private calculatePhaseProgress(
    workflow: WorkflowConfig,
    currentStep: WorkflowStep
  ): { stepInPhase: number; totalInPhase: number } {
    let stepInPhase = 0;
    let totalInPhase = 0;
    
    // Find the current phase
    const currentPhase = workflow.phases.find(phase => phase.name === currentStep.phase);
    if (!currentPhase) {
      return { stepInPhase: 1, totalInPhase: 1 };
    }

    // Count executable steps in this phase
    for (const stepConfig of currentPhase.steps) {
      const mockStep: WorkflowStep = {
        id: stepConfig.id,
        miniPrompt: {} as MiniPrompt,
        phase: currentPhase.name,
        stepNumber: 0,
        totalSteps: 0,
        validation: {
          hasRequiredMCP: true,
          hasRequiredContext: true,
          hasOptionalContext: [],
          canExecute: false,
          skipReasons: [],
          missingMCP: [],
          missingContext: []
        },
        prerequisites: stepConfig.prerequisites,
                  skipConditions: stepConfig.skip_conditions || []
      };

      const validation = this.validator.validateStep(mockStep);
      if (validation.canExecute) {
        totalInPhase++;
        if (stepConfig.id === currentStep.id) {
          stepInPhase = totalInPhase;
        }
      }
    }

    return { stepInPhase, totalInPhase };
  }

  /**
   * Generate progress note for current step
   */
  private generateProgressNote(
    currentStep: WorkflowStep,
    totalSkipped: number
  ): string | undefined {
    if (totalSkipped === 0) {
      return undefined;
    }

    if (totalSkipped === 1) {
      return "Auto-skipped 1 step due to missing prerequisites";
    }

    return `Auto-skipped ${totalSkipped} steps due to missing prerequisites`;
  }

  /**
   * Validate workflow configuration
   */
  validateWorkflowConfig(workflow: WorkflowConfig): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check workflow structure
    if (!workflow.name || !workflow.description) {
      errors.push("Workflow must have name and description");
    }

    if (!workflow.phases || workflow.phases.length === 0) {
      errors.push("Workflow must have at least one phase");
    }

    // Check phases
    for (const phase of workflow.phases || []) {
      if (!phase.name) {
        errors.push("Each phase must have a name");
      }

      if (!phase.steps || phase.steps.length === 0) {
        warnings.push(`Phase "${phase.name}" has no steps`);
      }

      // Check steps
      for (const step of phase.steps || []) {
        if (!step.id || !step.mini_prompt) {
          errors.push(`Step in phase "${phase.name}" missing id or mini_prompt`);
        }

        if (!step.prerequisites) {
          warnings.push(`Step "${step.id}" has no prerequisites defined`);
        }
      }
    }

    // Calculate execution rate
    const plan = this.validator.planWorkflowExecution(workflow);
    if (plan.execution_rate < 30) {
      warnings.push(`Low execution rate: ${plan.execution_rate}% (${plan.executable_steps}/${plan.total_steps} steps executable)`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
} 