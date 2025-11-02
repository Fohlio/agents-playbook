/**
 * Workflow Context Provider
 *
 * Adds current workflow structure to AI prompts, including stages and mini-prompts.
 * Helps AI understand the workflow being edited for better suggestions.
 */

import type { ContextProvider, ContextRequest, ContextSection } from '../types';

export class WorkflowContextProvider implements ContextProvider {
  shouldProvide(request: ContextRequest): boolean {
    return !!request.workflowContext?.workflow;
  }

  async buildContext(request: ContextRequest): Promise<ContextSection | null> {
    const workflow = request.workflowContext?.workflow;
    if (!workflow) return null;

    const lines: string[] = [
      '## Current Workflow Context',
      `**Name**: ${workflow.name}`,
    ];

    if (workflow.description) {
      lines.push(`**Description**: ${workflow.description}`);
    }

    if (workflow.complexity) {
      lines.push(`**Complexity**: ${workflow.complexity}`);
    }

    lines.push(
      `**Multi-Agent Chat**: ${workflow.includeMultiAgentChat ? 'Enabled' : 'Disabled'}`
    );

    if (workflow.stages && workflow.stages.length > 0) {
      lines.push('', '### Stages:');
      workflow.stages.forEach((stage) => {
        lines.push(`${stage.order + 1}. **${stage.name}**`);
        if (stage.description) {
          lines.push(`   _${stage.description}_`);
        }
        if (stage.miniPrompts && stage.miniPrompts.length > 0) {
          const miniPromptNames = stage.miniPrompts
            .map((mp) => mp.miniPrompt.name)
            .join(', ');
          lines.push(`   Mini-prompts: ${miniPromptNames}`);
        }
      });
    }

    return {
      content: lines.join('\n'),
      priority: 5, // High priority
    };
  }
}
