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

      lines.push('', `**ACTION REQUIRED**: When the user asks to translate this mini-prompt, IMMEDIATELY use \`translateMiniPrompt({ miniPromptId: "${currentMiniPrompt.id}", targetLanguage: "..." })\`. Do NOT ask for the ID or content - you already have it above.`);

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

    if (workflow.stages && workflow.stages.length > 0) {
      lines.push('', '### Stages:');
      workflow.stages.forEach((stage) => {
        const stageFeatures: string[] = [];
        if (stage.withReview) {
          stageFeatures.push('Review');
        }
        if (stage.includeMultiAgentChat) {
          stageFeatures.push('Multi-Agent Chat');
        }
        
        lines.push(`${stage.order + 1}. **${stage.name}**${stageFeatures.length > 0 ? ` (${stageFeatures.join(', ')})` : ''}`);
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
      lines.push('', '## ⚠️ IMPORTANT: Currently Viewing Mini-Prompt');
      lines.push(`**ID**: \`${currentMiniPrompt.id}\``);
      lines.push(`**Name**: ${currentMiniPrompt.name}`);
      if (currentMiniPrompt.description) {
        lines.push(`**Description**: ${currentMiniPrompt.description}`);
      }
      lines.push('', '**Full Content**:');
      lines.push('```markdown');
      lines.push(currentMiniPrompt.content);
      lines.push('```');
      lines.push('', `**ACTION REQUIRED**: When the user asks to translate this mini-prompt, IMMEDIATELY use \`translateMiniPrompt({ miniPromptId: "${currentMiniPrompt.id}", targetLanguage: "..." })\`. Do NOT ask for the ID or content - you already have it above.`);
      
      // Increase priority when currentMiniPrompt is present
      return {
        content: lines.join('\n'),
        priority: 15, // Very high priority when viewing a specific mini-prompt
      };
    }

    return {
      content: lines.join('\n'),
      priority: 5, // High priority
    };
  }
}
