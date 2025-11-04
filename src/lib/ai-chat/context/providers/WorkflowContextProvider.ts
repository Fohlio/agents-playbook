/**
 * Workflow Context Provider
 *
 * Adds current workflow structure to AI prompts, including stages and mini-prompts.
 * Helps AI understand the workflow being edited for better suggestions.
 */

import type { ContextProvider, ContextRequest, ContextSection } from '../types';

export class WorkflowContextProvider implements ContextProvider {
  shouldProvide(request: ContextRequest): boolean {
    return !!request.workflowContext?.workflow || !!request.workflowContext?.currentMiniPrompt;
  }

  async buildContext(request: ContextRequest): Promise<ContextSection | null> {
    const workflow = request.workflowContext?.workflow;
    const currentMiniPrompt = request.workflowContext?.currentMiniPrompt;

    // If only currentMiniPrompt is provided (no workflow)
    if (!workflow && currentMiniPrompt) {
      const lines: string[] = [
        '## Currently Viewing Mini-Prompt',
        `**ID**: ${currentMiniPrompt.id}`,
        `**Name**: ${currentMiniPrompt.name}`,
      ];

      if (currentMiniPrompt.description) {
        lines.push(`**Description**: ${currentMiniPrompt.description}`);
      }

      lines.push('', '**Content**:');
      lines.push('```markdown');
      lines.push(currentMiniPrompt.content);
      lines.push('```');

      lines.push('', '_The user is currently viewing this mini-prompt. You can help them edit it by using the `modifyMiniPrompt` tool with miniPromptId: "' + currentMiniPrompt.id + '"._');

      return {
        content: lines.join('\n'),
        priority: 10, // Very high priority for focused editing
      };
    }

    // If workflow is provided
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

    // Add currently viewing mini-prompt if provided
    if (currentMiniPrompt) {
      lines.push('', '### Currently Viewing Mini-Prompt');
      lines.push(`**Name**: ${currentMiniPrompt.name}`);
      if (currentMiniPrompt.description) {
        lines.push(`**Description**: ${currentMiniPrompt.description}`);
      }
      lines.push('', '**Content**:');
      lines.push('```markdown');
      lines.push(currentMiniPrompt.content);
      lines.push('```');
      lines.push('', '_The user is currently viewing this mini-prompt. You can help them edit it by suggesting changes to the title, description, or content._');
    }

    return {
      content: lines.join('\n'),
      priority: 5, // High priority
    };
  }
}
