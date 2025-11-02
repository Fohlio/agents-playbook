/**
 * Context Provider System Types
 *
 * Defines interfaces for the Provider pattern used to enrich AI prompts
 * with contextual information (workflow structure, available mini-prompts, etc.)
 */

export interface ContextProvider {
  /**
   * Determine if this provider should contribute context for the given request
   *
   * @param request - Context request information
   * @returns true if provider should contribute, false otherwise
   */
  shouldProvide(request: ContextRequest): boolean;

  /**
   * Build context section for the prompt
   *
   * @param request - Context request information
   * @returns Context section with content and priority, or null if no context
   */
  buildContext(request: ContextRequest): Promise<ContextSection | null>;
}

export interface ContextSection {
  /**
   * Markdown-formatted content to add to prompt
   */
  content: string;

  /**
   * Priority for ordering (higher = higher priority)
   */
  priority: number;
}

export interface ContextRequest {
  /**
   * User ID for personalization
   */
  userId: string;

  /**
   * AI assistant mode
   */
  mode: 'workflow' | 'mini-prompt';

  /**
   * Workflow context (if available)
   */
  workflowContext?: WorkflowContext;

  /**
   * Include extended context (true for first message or after auto-reset)
   */
  includeExtendedContext?: boolean;
}

export interface WorkflowContext {
  /**
   * Current workflow being edited
   */
  workflow?: {
    id: string;
    name: string;
    description?: string | null;
    complexity?: string | null;
    includeMultiAgentChat: boolean;
    stages?: Array<{
      id: string;
      name: string;
      description?: string | null;
      color?: string | null;
      withReview: boolean;
      order: number;
      miniPrompts?: Array<{
        miniPrompt: {
          id: string;
          name: string;
          description?: string | null;
        };
        order: number;
      }>;
    }>;
  };

  /**
   * Available mini-prompts in user's library
   */
  availableMiniPrompts?: Array<{
    id: string;
    name: string;
    description?: string | null;
  }>;

  /**
   * Current mode context
   */
  mode?: 'workflow' | 'mini-prompt';
}
