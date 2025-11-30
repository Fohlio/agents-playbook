/**
 * Context Builder
 *
 * Orchestrates context providers to enrich AI prompts with relevant information.
 * Uses the Provider pattern for modular, priority-based context enrichment.
 */

import type { ContextProvider, ContextRequest, ContextSection } from './types';

export class ContextBuilder {
  constructor(
    private systemProviders: ContextProvider[] = [],
    private userProviders: ContextProvider[] = []
  ) {}

  /**
   * Build context for AI prompt
   *
   * @param request - Context request parameters
   * @returns System message (optional) and user content enrichment
   */
  async buildContext(request: ContextRequest): Promise<{
    systemMessage: string | undefined;
    userContent: string;
  }> {
    // Build system message (only if extended context is needed)
    let systemMessage: string | undefined;
    if (request.includeExtendedContext) {
      const systemSections = await this.buildSections(
        this.systemProviders,
        request
      );
      systemMessage = this.formatSections(systemSections);
    }

    // Build user content enrichment
    const userSections = await this.buildSections(this.userProviders, request);
    const userContent = this.formatSections(userSections);

    return { systemMessage, userContent };
  }

  /**
   * Build sections from providers
   *
   * @param providers - Array of context providers
   * @param request - Context request parameters
   * @returns Array of context sections, sorted by priority
   */
  private async buildSections(
    providers: ContextProvider[],
    request: ContextRequest
  ): Promise<ContextSection[]> {
    const sections: ContextSection[] = [];

    for (const provider of providers) {
      if (provider.shouldProvide(request)) {
        const section = await provider.buildContext(request);
        if (section) {
          sections.push(section);
        }
      }
    }

    // Sort by priority (higher first)
    return sections.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Format sections into markdown string
   *
   * @param sections - Array of context sections
   * @returns Formatted markdown string
   */
  private formatSections(sections: ContextSection[]): string {
    return sections
      .map((s) => s.content)
      .filter(Boolean)
      .join('\n\n');
  }
}
