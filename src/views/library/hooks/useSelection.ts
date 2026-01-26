"use client";

import { useState, useCallback, useEffect } from 'react';

export type SelectableItemType = 'folder' | 'workflow' | 'prompt' | 'skill';

export interface SelectableItem {
  id: string;
  type: SelectableItemType;
}

export interface UseSelectionOptions {
  /** Callback when delete shortcut is pressed */
  onDeleteRequest?: () => void;
}

export interface UseSelectionReturn {
  /** Currently selected item IDs */
  selectedIds: Set<string>;
  /** Number of selected items */
  selectedCount: number;
  /** Single click - select item (clears others) */
  select: (id: string) => void;
  /** Ctrl/Cmd+click - toggle selection */
  toggle: (id: string) => void;
  /** Shift+click - range select */
  rangeSelect: (id: string) => void;
  /** Ctrl/Cmd+A - select all */
  selectAll: () => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Check if item is selected */
  isSelected: (id: string) => boolean;
  /** Get all selected items with their types */
  getSelectedItems: () => SelectableItem[];
  /** Handle click with modifier key detection */
  handleItemClick: (id: string, event: React.MouseEvent) => void;
}

/**
 * useSelection Hook
 *
 * Manages selection state for library items with support for:
 * - Single click selection
 * - Ctrl/Cmd+click toggle
 * - Shift+click range selection
 * - Ctrl/Cmd+A select all
 * - Escape to clear
 * - Delete/Backspace keyboard shortcuts
 */
export function useSelection(
  items: SelectableItem[],
  options: UseSelectionOptions = {}
): UseSelectionReturn {
  const { onDeleteRequest } = options;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  // Single click - select item (clears others)
  const select = useCallback((id: string) => {
    setSelectedIds(new Set([id]));
    setLastSelectedId(id);
  }, []);

  // Ctrl/Cmd+click - toggle selection
  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setLastSelectedId(id);
  }, []);

  // Shift+click - range select
  const rangeSelect = useCallback(
    (id: string) => {
      if (!lastSelectedId) {
        select(id);
        return;
      }

      const itemIds = items.map((i) => i.id);
      const lastIndex = itemIds.indexOf(lastSelectedId);
      const currentIndex = itemIds.indexOf(id);

      if (lastIndex === -1 || currentIndex === -1) {
        select(id);
        return;
      }

      const start = Math.min(lastIndex, currentIndex);
      const end = Math.max(lastIndex, currentIndex);
      const range = itemIds.slice(start, end + 1);

      setSelectedIds((prev) => {
        const next = new Set(prev);
        range.forEach((itemId) => next.add(itemId));
        return next;
      });
    },
    [items, lastSelectedId, select]
  );

  // Ctrl/Cmd+A - select all
  const selectAll = useCallback(() => {
    setSelectedIds(new Set(items.map((i) => i.id)));
  }, [items]);

  // Escape - clear selection
  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const selectedCount = selectedIds.size;

  // Get selected items with their types
  const getSelectedItems = useCallback(() => {
    return items.filter((i) => selectedIds.has(i.id));
  }, [items, selectedIds]);

  // Handle click with modifier key detection
  const handleItemClick = useCallback(
    (id: string, event: React.MouseEvent) => {
      if (event.shiftKey) {
        rangeSelect(id);
      } else if (event.metaKey || event.ctrlKey) {
        toggle(id);
      } else {
        // If clicking already selected item without modifiers, deselect it
        if (selectedIds.has(id) && selectedIds.size === 1) {
          clearSelection();
        } else {
          select(id);
        }
      }
    },
    [select, toggle, rangeSelect, selectedIds, clearSelection]
  );

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd+A - select all
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        selectAll();
      }

      // Escape - clear selection
      if (e.key === 'Escape') {
        clearSelection();
      }

      // Delete/Backspace - trigger delete request
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCount > 0) {
        e.preventDefault();
        if (onDeleteRequest) {
          onDeleteRequest();
        }
        // Also dispatch custom event for parent components
        window.dispatchEvent(new CustomEvent('library:deleteSelected'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectAll, clearSelection, selectedCount, onDeleteRequest]);

  // Clear selection when items change (e.g., navigating to different folder)
  useEffect(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, [items.length]);

  return {
    selectedIds,
    selectedCount,
    select,
    toggle,
    rangeSelect,
    selectAll,
    clearSelection,
    isSelected,
    getSelectedItems,
    handleItemClick,
  };
}
