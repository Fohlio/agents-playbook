import { EmptyStateProps, EmptyStateIcons } from "./EmptyState";
import { ROUTES, PROTECTED_ROUTES } from "@/shared/routes";

/**
 * Empty State Presets
 *
 * Pre-configured empty state configurations for common scenarios.
 * Each preset returns EmptyStateProps that can be spread into EmptyState component.
 * 
 * Note: These presets use hardcoded English strings for backwards compatibility.
 * For translated versions, use the useEmptyStatePresets hook from @/shared/hooks/use-empty-state-presets.
 */

/**
 * No search results empty state
 */
export function noSearchResults(
  searchTerm: string,
  onClear: () => void
): EmptyStateProps {
  return {
    icon: EmptyStateIcons.search,
    title: `No results for "${searchTerm}"`,
    description: "Try different keywords or clear your search",
    actions: [
      {
        label: "Clear Search",
        onClick: onClear,
        variant: "primary",
      },
    ],
    testId: "empty-state-no-search-results",
  };
}

/**
 * Empty workflow library
 */
export function emptyWorkflowLibrary(): EmptyStateProps {
  return {
    icon: EmptyStateIcons.library,
    title: "Your workflow library is empty",
    description: "Discover workflows from the community or create your own",
    actions: [
      {
        label: "Explore Workflows",
        href: ROUTES.DISCOVER,
        variant: "primary",
      },
      {
        label: "Create Workflow",
        href: ROUTES.LIBRARY.WORKFLOWS.NEW,
        variant: "secondary",
      },
    ],
    testId: "empty-state-workflow-library",
  };
}

/**
 * Empty mini-prompt library
 */
export function emptyMiniPromptLibrary(): EmptyStateProps {
  return {
    icon: EmptyStateIcons.prompt,
    title: "Your mini-prompts library is empty",
    description: "Discover mini-prompts from the community or create your own",
    actions: [
      {
        label: "Explore Mini-Prompts",
        href: ROUTES.DISCOVER,
        variant: "primary",
      },
      {
        label: "Create Mini-Prompt",
        href: ROUTES.LIBRARY.MINI_PROMPTS.NEW,
        variant: "secondary",
      },
    ],
    testId: "empty-state-mini-prompt-library",
  };
}

/**
 * No shared items
 */
export function noSharedItems(): EmptyStateProps {
  return {
    icon: EmptyStateIcons.share,
    title: "You haven't shared anything yet",
    description: "Share your workflows or mini-prompts to collaborate with others",
    actions: [
      {
        label: "Go to Library",
        href: PROTECTED_ROUTES.LIBRARY,
        variant: "primary",
      },
    ],
    testId: "empty-state-no-shared-items",
  };
}

/**
 * No filter results
 */
export function noFilterResults(onClearFilters: () => void): EmptyStateProps {
  return {
    icon: EmptyStateIcons.filter,
    title: "No results match your filters",
    description: "Try adjusting or clearing your filters to see more results",
    actions: [
      {
        label: "Clear All Filters",
        onClick: onClearFilters,
        variant: "primary",
      },
    ],
    testId: "empty-state-no-filter-results",
  };
}

/**
 * Generic empty discovery state
 */
export function emptyDiscovery(type: "workflow" | "mini-prompt"): EmptyStateProps {
  const typeLabel = type === "workflow" ? "workflows" : "mini-prompts";
  return {
    icon: EmptyStateIcons.library,
    title: `No ${typeLabel} found`,
    description: `Be the first to share a ${type === "workflow" ? "workflow" : "mini-prompt"} with the community!`,
    actions: [
      {
        label: `Create ${type === "workflow" ? "Workflow" : "Mini-Prompt"}`,
        href: type === "workflow" 
          ? ROUTES.LIBRARY.WORKFLOWS.NEW
          : ROUTES.LIBRARY.MINI_PROMPTS.NEW,
        variant: "primary",
      },
    ],
    testId: `empty-state-discovery-${type}`,
  };
}

/**
 * Collection of all presets for easy export
 */
export const emptyStatePresets = {
  noSearchResults,
  emptyWorkflowLibrary,
  emptyMiniPromptLibrary,
  noSharedItems,
  noFilterResults,
  emptyDiscovery,
};
