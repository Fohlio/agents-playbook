"use client";

import { useState, useMemo } from 'react';
import { Trash2, RotateCcw, AlertTriangle, FileText, Folder } from 'lucide-react';
import { TrashedItem } from '@/server/folders/types';
import { cn } from '@/shared/lib/utils/cn';
import { EmptyState } from '@/shared/ui/molecules/EmptyState';
import Button from '@/shared/ui/atoms/Button';
import { formatDistanceToNow } from 'date-fns';

export interface TrashViewProps {
  /** List of trashed items */
  items: TrashedItem[];
  /** Loading state */
  isLoading?: boolean;
  /** Called when "Restore" is clicked for a single item */
  onRestore: (type: TrashedItem['type'], id: string) => void;
  /** Called when "Delete Permanently" is clicked for a single item */
  onDeletePermanently: (type: TrashedItem['type'], id: string) => void;
  /** Called when "Restore Selected" is clicked */
  onRestoreSelected: (items: TrashedItem[]) => void;
  /** Called when "Delete Selected Permanently" is clicked */
  onDeleteSelectedPermanently: (items: TrashedItem[]) => void;
  /** Called when "Empty Trash" is clicked */
  onEmptyTrash: () => void;
  /** Additional class names */
  className?: string;
}

/**
 * TrashView Component
 *
 * Displays trashed items (folders, workflows, prompts) with:
 * - Individual restore/delete actions
 * - Bulk selection and actions
 * - Empty trash action
 * - Empty state when trash is empty
 */
export function TrashView({
  items,
  isLoading = false,
  onRestore,
  onDeletePermanently,
  onRestoreSelected,
  onDeleteSelectedPermanently,
  onEmptyTrash,
  className,
}: TrashViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);
  const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds]
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(items.map((i) => i.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleRestoreSelected = () => {
    onRestoreSelected(selectedItems);
    clearSelection();
  };

  const handleDeleteSelectedPermanently = () => {
    if (confirmDeleteSelected) {
      onDeleteSelectedPermanently(selectedItems);
      clearSelection();
      setConfirmDeleteSelected(false);
    } else {
      setConfirmDeleteSelected(true);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setConfirmDeleteSelected(false), 3000);
    }
  };

  const handleEmptyTrash = () => {
    if (confirmEmptyTrash) {
      onEmptyTrash();
      setConfirmEmptyTrash(false);
    } else {
      setConfirmEmptyTrash(true);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setConfirmEmptyTrash(false), 3000);
    }
  };

  const getItemIcon = (type: TrashedItem['type']) => {
    switch (type) {
      case 'WORKFLOW':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case 'MINI_PROMPT':
        return <FileText className="w-5 h-5 text-green-500" />;
      default:
        return <Folder className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: TrashedItem['type']) => {
    switch (type) {
      case 'WORKFLOW':
        return 'Workflow';
      case 'MINI_PROMPT':
        return 'Prompt';
      default:
        return 'Folder';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-20', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <EmptyState
        icon={
          <Trash2 className="w-16 h-16" />
        }
        title="Trash is empty"
        description="Items you delete will appear here for 30 days before being permanently removed."
        className={className}
      />
    );
  }

  return (
    <div className={cn('space-y-4', className)} role="region" aria-label="Trash contents">
      {/* Trash header with bulk actions */}
      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3" role="toolbar" aria-label="Trash actions">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedIds.size === items.length && items.length > 0}
            onChange={() => {
              if (selectedIds.size === items.length) {
                clearSelection();
              } else {
                selectAll();
              }
            }}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            aria-label={selectedIds.size === items.length ? 'Deselect all items' : 'Select all items'}
          />
          <span className="text-sm text-gray-600" role="status" aria-live="polite">
            {selectedIds.size > 0
              ? `${selectedIds.size} of ${items.length} selected`
              : `${items.length} ${items.length === 1 ? 'item' : 'items'} in trash`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRestoreSelected}
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Restore Selected
              </Button>
              <Button
                variant={confirmDeleteSelected ? "primary" : "secondary"}
                size="sm"
                onClick={handleDeleteSelectedPermanently}
                className={confirmDeleteSelected ? "bg-red-600 hover:bg-red-700" : "text-red-600 hover:bg-red-50"}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                {confirmDeleteSelected ? "Confirm Delete" : "Delete Selected"}
              </Button>
            </>
          ) : (
            <Button
              variant={confirmEmptyTrash ? "primary" : "secondary"}
              size="sm"
              onClick={handleEmptyTrash}
              className={confirmEmptyTrash ? "bg-red-600 hover:bg-red-700" : "text-red-600 hover:bg-red-50"}
            >
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              {confirmEmptyTrash ? "Confirm Empty Trash" : "Empty Trash"}
            </Button>
          )}
        </div>
      </div>

      {/* Trash items list */}
      <div className="bg-white rounded-lg border divide-y" role="list" aria-label="Trashed items">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors',
              selectedIds.has(item.id) && 'bg-blue-50'
            )}
            role="listitem"
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={selectedIds.has(item.id)}
              onChange={() => toggleSelection(item.id)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              aria-label={`Select ${item.name}`}
            />

            {/* Icon */}
            <div className="flex-shrink-0" aria-hidden="true">{getItemIcon(item.type)}</div>

            {/* Item info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{item.name}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{getTypeLabel(item.type)}</span>
                <span className="text-gray-300" aria-hidden="true">|</span>
                <span>
                  Deleted {formatDistanceToNow(item.deletedAt, { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRestore(item.type, item.id)}
                className="flex items-center gap-1 px-3 py-2.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                aria-label={`Restore ${item.name}`}
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Restore</span>
              </button>
              <button
                onClick={() => onDeletePermanently(item.type, item.id)}
                className="flex items-center gap-1 px-3 py-2.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px]"
                aria-label={`Permanently delete ${item.name}`}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Auto-delete notice */}
      <p className="text-sm text-gray-500 text-center py-2">
        Items in trash will be automatically deleted after 30 days
      </p>
    </div>
  );
}
