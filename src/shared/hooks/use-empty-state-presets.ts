'use client';

import { useTranslations } from 'next-intl';
import { EmptyStateProps, EmptyStateIcons } from '@/shared/ui/molecules/EmptyState';
import { ROUTES, PROTECTED_ROUTES } from '@/shared/routes';

/**
 * Hook for translated empty state presets
 * 
 * Returns functions that generate EmptyStateProps with translated strings.
 */
export function useEmptyStatePresets() {
  const t = useTranslations('discover');
  const tLibrary = useTranslations('library');
  const tSharing = useTranslations('sharing');

  const noSearchResults = (
    searchTerm: string,
    onClear: () => void
  ): EmptyStateProps => ({
    icon: EmptyStateIcons.search,
    title: t('noResults'),
    description: t('noResultsDescription'),
    actions: [
      {
        label: t('clearSearch'),
        onClick: onClear,
        variant: 'primary',
      },
    ],
    testId: 'empty-state-no-search-results',
  });

  const emptyWorkflowLibrary = (): EmptyStateProps => ({
    icon: EmptyStateIcons.library,
    title: tLibrary('workflows.empty'),
    description: tLibrary('workflows.emptyDescription'),
    actions: [
      {
        label: tLibrary('workflows.explore'),
        href: ROUTES.DISCOVER,
        variant: 'primary',
      },
      {
        label: tLibrary('workflows.create'),
        href: ROUTES.LIBRARY.WORKFLOWS.NEW,
        variant: 'secondary',
      },
    ],
    testId: 'empty-state-workflow-library',
  });

  const emptyMiniPromptLibrary = (): EmptyStateProps => ({
    icon: EmptyStateIcons.prompt,
    title: tLibrary('miniPrompts.empty'),
    description: tLibrary('miniPrompts.emptyDescription'),
    actions: [
      {
        label: tLibrary('miniPrompts.explore'),
        href: ROUTES.DISCOVER,
        variant: 'primary',
      },
      {
        label: tLibrary('miniPrompts.create'),
        href: ROUTES.LIBRARY.MINI_PROMPTS.NEW,
        variant: 'secondary',
      },
    ],
    testId: 'empty-state-mini-prompt-library',
  });

  const noSharedItems = (): EmptyStateProps => ({
    icon: EmptyStateIcons.share,
    title: tSharing('empty'),
    description: tSharing('emptyDescription'),
    actions: [
      {
        label: tSharing('goToLibrary'),
        href: PROTECTED_ROUTES.LIBRARY,
        variant: 'primary',
      },
    ],
    testId: 'empty-state-no-shared-items',
  });

  const noFilterResults = (onClearFilters: () => void): EmptyStateProps => ({
    icon: EmptyStateIcons.filter,
    title: t('noFilterResults'),
    description: t('noFilterResultsDescription'),
    actions: [
      {
        label: t('clearFilters'),
        onClick: onClearFilters,
        variant: 'primary',
      },
    ],
    testId: 'empty-state-no-filter-results',
  });

  const emptyDiscovery = (type: 'workflow' | 'mini-prompt'): EmptyStateProps => ({
    icon: EmptyStateIcons.library,
    title: type === 'workflow' ? t('emptyWorkflows') : t('emptyMiniPrompts'),
    description: type === 'workflow' ? t('emptyWorkflowsDescription') : t('emptyMiniPromptsDescription'),
    actions: [
      {
        label: type === 'workflow' 
          ? tLibrary('workflows.create') 
          : tLibrary('miniPrompts.create'),
        href: type === 'workflow'
          ? ROUTES.LIBRARY.WORKFLOWS.NEW
          : ROUTES.LIBRARY.MINI_PROMPTS.NEW,
        variant: 'primary',
      },
    ],
    testId: `empty-state-discovery-${type}`,
  });

  return {
    noSearchResults,
    emptyWorkflowLibrary,
    emptyMiniPromptLibrary,
    noSharedItems,
    noFilterResults,
    emptyDiscovery,
  };
}
