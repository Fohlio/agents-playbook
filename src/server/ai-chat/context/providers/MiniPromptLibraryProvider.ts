/**
 * Mini-Prompt Library Provider
 *
 * Adds available mini-prompts to AI prompts for workflow construction.
 * Helps AI suggest relevant mini-prompts from the user's library.
 */

import type { ContextProvider, ContextRequest, ContextSection } from '../types';

export class MiniPromptLibraryProvider implements ContextProvider {
  /**
   * Maximum mini-prompts to include (avoid overwhelming the prompt)
   */
  private static readonly MAX_MINI_PROMPTS = 20;

  shouldProvide(request: ContextRequest): boolean {
    return !!(
      request.workflowContext?.availableMiniPrompts &&
      request.workflowContext.availableMiniPrompts.length > 0
    );
  }

  async buildContext(request: ContextRequest): Promise<ContextSection | null> {
    const miniPrompts = request.workflowContext?.availableMiniPrompts;
    if (!miniPrompts || miniPrompts.length === 0) return null;

    const limited = miniPrompts.slice(0, MiniPromptLibraryProvider.MAX_MINI_PROMPTS);

    const lines = [
      '## Available Mini-Prompts',
      '',
      ...limited.map((mp) => {
        const desc = mp.description ? `: ${mp.description}` : '';
        return `- **${mp.name}** (ID: ${mp.id})${desc}`;
      }),
    ];

    if (miniPrompts.length > limited.length) {
      lines.push(`\n_...and ${miniPrompts.length - limited.length} more_`);
    }

    return {
      content: lines.join('\n'),
      priority: 4, // Medium-high priority
    };
  }
}
