import { AgentType } from '../types';
import { SubAgentBase } from './sub-agent-base';

export class AnalysisAgent extends SubAgentBase {
  constructor(config: any) {
    super(AgentType.ANALYSIS, config);
  }

  protected getMiniPromptPath(): string {
    return 'analysis/create-structured-requirements';
  }

  protected async performSpecificValidation(result: any): Promise<boolean> {
    // Basic validation - check that we have any meaningful output
    if (!result.outputs || result.outputs.size === 0) {
      console.warn('Analysis agent produced no outputs');
      return false;
    }

    // Check for key outputs that indicate analysis work was done
    const taskOutput = result.outputs.get('task_output');
    const executionLog = result.outputs.get('execution_log');

    if (!taskOutput && !executionLog) {
      console.warn('Analysis agent did not produce expected output types');
      return false;
    }

    // If we have task output, it should contain some analysis content
    if (taskOutput && typeof taskOutput === 'string' && taskOutput.length < 10) {
      console.warn('Analysis agent produced insufficient output content');
      return false;
    }

    console.log('Analysis agent validation passed');
    return true;
  }

  protected extractKeyDecisions(result: any): string[] {
    const reqs = result.outputs.get('structured_requirements');
    if (!reqs) return [];

    return [
      `Requirements scope: ${reqs.requirements.length} items`,
      `Constraints identified: ${reqs.constraints.length} items`,
      `Success criteria defined: ${reqs.success_criteria.length} items`
    ];
  }

  protected identifyNextSteps(result: any): string[] {
    return [
      'Proceed to design and architecture phase',
      'Use structured requirements for technical design',
      'Ensure all requirements are addressed in design'
    ];
  }
}