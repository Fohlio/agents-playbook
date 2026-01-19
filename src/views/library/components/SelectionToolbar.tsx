"use client";

import { useState } from 'react';
import { X, FolderPlus, FolderInput, FolderMinus, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils/cn';
import { FolderWithItems } from '@/server/folders/types';
import { FolderSelectMenu } from './FolderSelectMenu';

export interface SelectionToolbarProps {
  /** Number of selected items */
  selectedCount: number;
  /** Available folders for move/add operations */
  folders: FolderWithItems[];
  /** Current folder ID (for "remove from folder" action) */
  currentFolderId?: string | null;
  /** Whether we're in a folder view (enables "remove from folder") */
  isInFolderView?: boolean;
  /** Whether any folders are in the selection (disables folder operations) */
  hasFoldersSelected?: boolean;
  /** Called when "Add to Folder" action is selected */
  onAddToFolder: (folderId: string) => void;
  /** Called when "Move to Folder" action is selected */
  onMoveToFolder: (folderId: string) => void;
  /** Called when "Remove from Folder" action is selected */
  onRemoveFromFolder: () => void;
  /** Called when "Move to Trash" action is selected */
  onMoveToTrash: () => void;
  /** Called when "Create Folder" is clicked (optional) */
  onCreateFolder?: () => void;
  /** Called when selection is cleared */
  onClearSelection: () => void;
  /** Additional class names */
  className?: string;
}

/**
 * SelectionToolbar Component
 *
 * Floating action bar displayed when items are selected.
 * Provides bulk operations like:
 * - Add to Folder
 * - Move to Folder
 * - Remove from Folder (when in folder view)
 * - Move to Trash
 */
export function SelectionToolbar({
  selectedCount,
  folders,
  currentFolderId,
  isInFolderView = false,
  hasFoldersSelected = false,
  onAddToFolder,
  onMoveToFolder,
  onRemoveFromFolder,
  onMoveToTrash,
  onCreateFolder,
  onClearSelection,
  className,
}: SelectionToolbarProps) {
  const [addMenuAnchor, setAddMenuAnchor] = useState<HTMLElement | null>(null);
  const [moveMenuAnchor, setMoveMenuAnchor] = useState<HTMLElement | null>(null);

  if (selectedCount === 0) {
    return null;
  }

  const handleAddToFolder = (folderId: string) => {
    onAddToFolder(folderId);
    setAddMenuAnchor(null);
  };

  const handleMoveToFolder = (folderId: string) => {
    onMoveToFolder(folderId);
    setMoveMenuAnchor(null);
  };

  // Filter out current folder from the move/add options
  const availableFolders = folders.filter((f) => f.id !== currentFolderId);

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-gray-900 text-white rounded-lg shadow-lg',
        'flex items-center gap-2 px-4 py-3',
        'animate-in slide-in-from-bottom-4 fade-in duration-200',
        className
      )}
      data-testid="selection-toolbar"
      role="toolbar"
      aria-label="Bulk actions toolbar"
    >
      {/* Selection count */}
      <span className="text-sm font-medium mr-2" role="status" aria-live="polite">
        {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
      </span>

      {/* Folder operations - hidden when folders are selected */}
      {!hasFoldersSelected && (
        <>
          <div className="h-4 w-px bg-gray-600 mx-2" aria-hidden="true" />

          {/* Add to Folder */}
          <button
            onClick={(e) => setAddMenuAnchor(e.currentTarget)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded hover:bg-gray-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[44px]"
            aria-label="Add to Folder"
            aria-haspopup="true"
            aria-expanded={Boolean(addMenuAnchor)}
          >
            <FolderPlus className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Add to Folder</span>
          </button>

          <FolderSelectMenu
            anchorEl={addMenuAnchor}
            open={Boolean(addMenuAnchor)}
            onClose={() => setAddMenuAnchor(null)}
            folders={availableFolders}
            onSelectFolder={handleAddToFolder}
            onCreateFolder={onCreateFolder}
          />

          {/* Move to Folder */}
          <button
            onClick={(e) => setMoveMenuAnchor(e.currentTarget)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded hover:bg-gray-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[44px]"
            aria-label="Move to Folder"
            aria-haspopup="true"
            aria-expanded={Boolean(moveMenuAnchor)}
          >
            <FolderInput className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Move</span>
          </button>

          <FolderSelectMenu
            anchorEl={moveMenuAnchor}
            open={Boolean(moveMenuAnchor)}
            onClose={() => setMoveMenuAnchor(null)}
            folders={availableFolders}
            onSelectFolder={handleMoveToFolder}
            onCreateFolder={onCreateFolder}
          />

          {/* Remove from Folder (only in folder view) */}
          {isInFolderView && currentFolderId && (
            <button
              onClick={onRemoveFromFolder}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded hover:bg-gray-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[44px]"
              aria-label="Remove from Folder"
            >
              <FolderMinus className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Remove</span>
            </button>
          )}
        </>
      )}

      <div className="h-4 w-px bg-gray-600 mx-2" aria-hidden="true" />

      {/* Move to Trash */}
      <button
        onClick={onMoveToTrash}
        className="flex items-center gap-1.5 px-3 py-2.5 rounded hover:bg-red-600 transition-colors text-sm text-red-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 min-h-[44px]"
        aria-label="Move to Trash"
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">Trash</span>
      </button>

      <div className="h-4 w-px bg-gray-600 mx-2" aria-hidden="true" />

      {/* Clear selection */}
      <button
        onClick={onClearSelection}
        className="p-2.5 rounded hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Clear selection (Escape)"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
