"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';

export interface SearchableItem {
  id: string;
  name: string;
  description?: string | null;
}

export interface UseLibrarySearchOptions {
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number;
  /** Whether to search in descriptions too (default: true) */
  searchDescriptions?: boolean;
}

export interface UseLibrarySearchReturn<T extends SearchableItem> {
  /** Current search query */
  query: string;
  /** Set the search query */
  setQuery: (query: string) => void;
  /** Filtered items based on search query */
  filteredItems: T[];
  /** Whether a search is in progress (debouncing) */
  isSearching: boolean;
  /** Whether there are any results */
  hasResults: boolean;
  /** Whether search is active (query is not empty) */
  isActive: boolean;
  /** Clear the search query */
  clearSearch: () => void;
  /** Debounced query value (what's actually being used for filtering) */
  debouncedQuery: string;
}

/**
 * useLibrarySearch Hook
 *
 * Provides client-side filtering for library items with:
 * - Debounced search input
 * - Case-insensitive matching
 * - Optional description search
 * - Search state indicators
 */
export function useLibrarySearch<T extends SearchableItem>(
  items: T[],
  options: UseLibrarySearchOptions = {}
): UseLibrarySearchReturn<T> {
  const { debounceMs = 300, searchDescriptions = true } = options;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Filter items based on debounced query
  const filteredItems = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return items;
    }

    const lowerQuery = debouncedQuery.toLowerCase().trim();

    return items.filter((item) => {
      // Match name
      if (item.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Match description if enabled
      if (searchDescriptions && item.description) {
        if (item.description.toLowerCase().includes(lowerQuery)) {
          return true;
        }
      }

      return false;
    });
  }, [items, debouncedQuery, searchDescriptions]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  // Search state
  const isSearching = query !== debouncedQuery;
  const hasResults = filteredItems.length > 0;
  const isActive = query.trim().length > 0;

  return {
    query,
    setQuery,
    filteredItems,
    isSearching,
    hasResults,
    isActive,
    clearSearch,
    debouncedQuery,
  };
}

/**
 * Multi-list search hook
 *
 * Use this when you have multiple item lists (folders, workflows, prompts)
 * that should all be filtered by the same search query.
 */
export interface UseMultiListSearchReturn<T extends SearchableItem> {
  query: string;
  setQuery: (query: string) => void;
  filterItems: (items: T[]) => T[];
  isSearching: boolean;
  isActive: boolean;
  clearSearch: () => void;
  debouncedQuery: string;
}

export function useMultiListSearch<T extends SearchableItem>(
  options: UseLibrarySearchOptions = {}
): UseMultiListSearchReturn<T> {
  const { debounceMs = 300, searchDescriptions = true } = options;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Filter function that can be applied to any list
  const filterItems = useCallback(
    (items: T[]): T[] => {
      if (!debouncedQuery.trim()) {
        return items;
      }

      const lowerQuery = debouncedQuery.toLowerCase().trim();

      return items.filter((item) => {
        if (item.name.toLowerCase().includes(lowerQuery)) {
          return true;
        }

        if (searchDescriptions && item.description) {
          if (item.description.toLowerCase().includes(lowerQuery)) {
            return true;
          }
        }

        return false;
      });
    },
    [debouncedQuery, searchDescriptions]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  const isSearching = query !== debouncedQuery;
  const isActive = query.trim().length > 0;

  return {
    query,
    setQuery,
    filterItems,
    isSearching,
    isActive,
    clearSearch,
    debouncedQuery,
  };
}
