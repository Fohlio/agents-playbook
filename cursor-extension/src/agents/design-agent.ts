import { AgentType } from '../types';
import { SubAgentBase } from './sub-agent-base';

export class DesignAgent extends SubAgentBase {
  constructor(config: any) {
    super(AgentType.DESIGN, config);
  }

  protected getMiniPromptPath(): string {
    return 'design-architecture/design-architecture';
  }

  protected async performSpecificValidation(result: any): Promise<boolean> {
    // Basic validation - check that we have any meaningful output
    if (!result.outputs || result.outputs.size === 0) {
      console.warn('Design agent produced no outputs');
      return false;
    }

    // Check for key outputs that indicate design work was done
    const taskOutput = result.outputs.get('task_output');
    const executionLog = result.outputs.get('execution_log');

    if (!taskOutput && !executionLog) {
      console.warn('Design agent did not produce expected output types');
      return false;
    }

    console.log('Design agent validation passed');
    return true;
  }

  protected extractKeyDecisions(result: any): string[] {
    const design = result.outputs.get('design_specifications');
    if (!design) return [];

    return [
      `Architecture: ${design.architecture}`,
      `Components: ${design.components.length} defined`,
      `Key decisions: ${design.decisions.join(', ')}`
    ];
  }

  protected identifyNextSteps(result: any): string[] {
    return [
      'Proceed to implementation planning phase',
      'Use design specifications for task breakdown',
      'Ensure all components are planned for implementation'
    ];
  }
}