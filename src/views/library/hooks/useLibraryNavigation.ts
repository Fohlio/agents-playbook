'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';

export type LibraryView = 'folder' | 'trash' | 'uncategorized' | 'root';
export type LibraryTab = 'my-library' | 'discover';

interface NavigationState {
  currentFolderId: string | null;
  view: LibraryView;
  tab: LibraryTab;
  searchQuery: string;
}

interface NavigationActions {
  navigateToFolder: (folderId: string) => void;
  navigateToTrash: () => void;
  navigateToUncategorized: () => void;
  navigateToRoot: () => void;
  setTab: (tab: LibraryTab) => void;
  setSearchQuery: (query: string) => void;
}

/**
 * Hook for managing Library navigation state via URL params
 *
 * URL structure:
 * - /dashboard/library - Root view (My Library tab)
 * - /dashboard/library?tab=discover - Discover tab
 * - /dashboard/library?folder=<id> - Folder view
 * - /dashboard/library?view=trash - Trash view
 * - /dashboard/library?view=uncategorized - Uncategorized view
 * - /dashboard/library?search=<query> - Search filter
 */
export function useLibraryNavigation(): NavigationState & NavigationActions {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Parse current state from URL
  const currentFolderId = searchParams.get('folder');
  const viewParam = searchParams.get('view');
  const tabParam = searchParams.get('tab');
  const searchQuery = searchParams.get('search') ?? '';

  // Determine current view
  const view: LibraryView = useMemo(() => {
    if (currentFolderId) return 'folder';
    if (viewParam === 'trash') return 'trash';
    if (viewParam === 'uncategorized') return 'uncategorized';
    return 'root';
  }, [currentFolderId, viewParam]);

  // Determine current tab
  const tab: LibraryTab = useMemo(() => {
    if (tabParam === 'discover') return 'discover';
    return 'my-library';
  }, [tabParam]);

  // Build URL with params
  const buildUrl = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams();

      // Add non-null params
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          newParams.set(key, value);
        }
      });

      const queryString = newParams.toString();
      return queryString ? `${pathname}?${queryString}` : pathname;
    },
    [pathname]
  );

  // Navigation actions
  const navigateToFolder = useCallback(
    (folderId: string) => {
      const url = buildUrl({
        folder: folderId,
        tab: tab === 'discover' ? 'discover' : null,
        search: searchQuery || null,
      });
      router.push(url);
    },
    [buildUrl, router, tab, searchQuery]
  );

  const navigateToTrash = useCallback(() => {
    const url = buildUrl({
      view: 'trash',
      tab: tab === 'discover' ? 'discover' : null,
      search: null, // Clear search when navigating to trash
    });
    router.push(url);
  }, [buildUrl, router, tab]);

  const navigateToUncategorized = useCallback(() => {
    const url = buildUrl({
      view: 'uncategorized',
      tab: tab === 'discover' ? 'discover' : null,
      search: searchQuery || null,
    });
    router.push(url);
  }, [buildUrl, router, tab, searchQuery]);

  const navigateToRoot = useCallback(() => {
    const url = buildUrl({
      tab: tab === 'discover' ? 'discover' : null,
      search: searchQuery || null,
    });
    router.push(url);
  }, [buildUrl, router, tab, searchQuery]);

  const setTab = useCallback(
    (newTab: LibraryTab) => {
      const url = buildUrl({
        tab: newTab === 'discover' ? 'discover' : null,
        folder: currentFolderId,
        view: viewParam,
        search: searchQuery || null,
      });
      router.push(url);
    },
    [buildUrl, router, currentFolderId, viewParam, searchQuery]
  );

  const setSearchQuery = useCallback(
    (query: string) => {
      const url = buildUrl({
        folder: currentFolderId,
        view: viewParam,
        tab: tab === 'discover' ? 'discover' : null,
        search: query || null,
      });
      router.push(url);
    },
    [buildUrl, router, currentFolderId, viewParam, tab]
  );

  return {
    currentFolderId,
    view,
    tab,
    searchQuery,
    navigateToFolder,
    navigateToTrash,
    navigateToUncategorized,
    navigateToRoot,
    setTab,
    setSearchQuery,
  };
}
