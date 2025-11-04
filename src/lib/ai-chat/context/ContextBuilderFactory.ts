/**
 * Context Builder Factory
 *
 * Creates pre-configured ContextBuilder instances with appropriate providers.
 */

import { ContextBuilder } from './ContextBuilder';
import { WorkflowContextProvider } from './providers/WorkflowContextProvider';
import { MiniPromptLibraryProvider } from './providers/MiniPromptLibraryProvider';

export class ContextBuilderFactory {
  /**
   * Create default context builder for AI assistant
   *
   * @returns ContextBuilder with standard providers
   */
  static createDefault(): ContextBuilder {
    return new ContextBuilder(
      // System providers (for system message - currently none)
      [],
      // User providers (for user content enrichment)
      [
        new WorkflowContextProvider(),
        new MiniPromptLibraryProvider(),
      ]
    );
  }
}
