"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowParser = void 0;
class WorkflowParser {
    async parseWorkflowToExecutionPlan(workflow, availableContext = []) {
        console.log(`Parsing workflow: ${workflow.name}`);
        const phases = [];
        let totalSteps = 0;
        let executableSteps = 0;
        const allSkippedSteps = [];
        for (const phase of workflow.phases) {
            const phaseExecutionPlan = await this.parsePhase(phase, availableContext);
            phases.push(phaseExecutionPlan);
            totalSteps += phaseExecutionPlan.totalSteps;
            executableSteps += phaseExecutionPlan.executableSteps;
            allSkippedSteps.push(...phaseExecutionPlan.skippedSteps);
        }
        const executionRate = totalSteps > 0 ? (executableSteps / totalSteps) * 100 : 0;
        return {
            workflowId: workflow.name,
            totalSteps,
            executableSteps,
            skippedSteps: allSkippedSteps,
            executionRate,
            phases
        };
    }
    async parsePhase(phase, availableContext) {
        const steps = [];
        const skippedSteps = [];
        let executableSteps = 0;
        for (const step of phase.steps) {
            const stepPlan = await this.parseStep(step, availableContext);
            steps.push(stepPlan);
            if (stepPlan.willExecute) {
                executableSteps++;
            }
            else {
                skippedSteps.push({
                    id: step.id,
                    reason: stepPlan.skipReason || 'Prerequisites not met',
                    stepTitle: stepPlan.title
                });
            }
        }
        return {
            name: phase.phase,
            totalSteps: phase.steps.length,
            executableSteps,
            skippedSteps,
            steps
        };
    }
    async parseStep(step, availableContext) {
        // Check if step can be executed based on prerequisites
        const canExecute = this.checkStepPrerequisites(step, availableContext);
        return {
            id: step.id,
            title: step.miniPrompt.split('/').pop() || step.id,
            willExecute: canExecute.canExecute,
            skipReason: canExecute.skipReason,
            validation: canExecute // Store validation details
        };
    }
    checkStepPrerequisites(step, availableContext) {
        // Check required context
        if (step.prerequisites?.requiredContext) {
            for (const requiredItem of step.prerequisites.requiredContext) {
                if (!availableContext.includes(requiredItem)) {
                    return {
                        canExecute: false,
                        skipReason: `Missing required context: ${requiredItem}`
                    };
                }
            }
        }
        // For now, assume all steps can execute if no required context is missing
        return { canExecute: true };
    }
    /**
     * Determines the next executable step in the workflow
     */
    getNextStep(executionPlan, currentStep) {
        let globalStepIndex = 0;
        for (let phaseIndex = 0; phaseIndex < executionPlan.phases.length; phaseIndex++) {
            const phase = executionPlan.phases[phaseIndex];
            for (let stepIndex = 0; stepIndex < phase.steps.length; stepIndex++) {
                const step = phase.steps[stepIndex];
                if (globalStepIndex === currentStep) {
                    return {
                        step: step.willExecute ? step : null,
                        phaseIndex,
                        stepIndex
                    };
                }
                globalStepIndex++;
            }
        }
        return { step: null, phaseIndex: -1, stepIndex: -1 };
    }
    /**
     * Gets all steps in a specific phase
     */
    getStepsInPhase(executionPlan, phaseName) {
        const phase = executionPlan.phases.find(p => p.name === phaseName);
        return phase ? phase.steps : [];
    }
    /**
     * Calculates the completion percentage of the workflow
     */
    calculateProgress(executionPlan, completedSteps) {
        const overall = executionPlan.totalSteps > 0
            ? (completedSteps.length / executionPlan.totalSteps) * 100
            : 0;
        const byPhase = {};
        for (const phase of executionPlan.phases) {
            const phaseStepIds = phase.steps.map(s => s.id);
            const completedInPhase = completedSteps.filter(id => phaseStepIds.includes(id)).length;
            byPhase[phase.name] = phase.totalSteps > 0
                ? (completedInPhase / phase.totalSteps) * 100
                : 0;
        }
        return { overall, byPhase };
    }
    /**
     * Validates that all dependencies are satisfied for a step
     */
    validateStepDependencies(step, completedSteps) {
        const missingDependencies = [];
        if (step.dependencies) {
            for (const dependency of step.dependencies) {
                if (!completedSteps.includes(dependency)) {
                    missingDependencies.push(dependency);
                }
            }
        }
        return {
            valid: missingDependencies.length === 0,
            missingDependencies
        };
    }
    /**
     * Gets all steps that depend on a given step
     */
    getDependentSteps(executionPlan, stepId) {
        const dependentSteps = [];
        for (const phase of executionPlan.phases) {
            for (const step of phase.steps) {
                // Note: This would need access to the original step data with dependencies
                // For now, we'll return empty array
            }
        }
        return dependentSteps;
    }
    /**
     * Estimates the total execution time for the workflow
     */
    estimateExecutionTime(executionPlan) {
        const phaseEstimates = {};
        let totalMinutes = 0;
        for (const phase of executionPlan.phases) {
            // Rough estimation based on phase type and step count
            let phaseMinutes = 0;
            switch (phase.name) {
                case 'analysis':
                    phaseMinutes = phase.executableSteps * 5; // 5 minutes per step
                    break;
                case 'design-architecture':
                    phaseMinutes = phase.executableSteps * 10; // 10 minutes per step
                    break;
                case 'planning':
                    phaseMinutes = phase.executableSteps * 7; // 7 minutes per step
                    break;
                case 'implementation':
                    phaseMinutes = phase.executableSteps * 20; // 20 minutes per step
                    break;
                case 'testing-review':
                    phaseMinutes = phase.executableSteps * 8; // 8 minutes per step
                    break;
                default:
                    phaseMinutes = phase.executableSteps * 10; // Default 10 minutes per step
            }
            phaseEstimates[phase.name] = phaseMinutes;
            totalMinutes += phaseMinutes;
        }
        return {
            estimatedMinutes: totalMinutes,
            breakdown: phaseEstimates
        };
    }
}
exports.WorkflowParser = WorkflowParser;
//# sourceMappingURL=workflow-parser.js.map