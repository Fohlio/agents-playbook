"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X, FolderPlus, FolderInput, FolderMinus, Trash2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils/cn';
import { FolderWithItems } from '@/server/folders/types';
import { FolderSelectMenu } from './FolderSelectMenu';

export interface SelectionToolbarProps {
  selectedCount: number;
  folders: FolderWithItems[];
  currentFolderId?: string | null;
  isInFolderView?: boolean;
  hasFoldersSelected?: boolean;
  onAddToFolder: (folderId: string) => void;
  onMoveToFolder: (folderId: string) => void;
  onRemoveFromFolder: () => void;
  onMoveToTrash: () => void;
  onCreateFolder?: () => void;
  onClearSelection: () => void;
  className?: string;
}

/**
 * SelectionToolbar Component - Cyberpunk Style
 *
 * Floating neon action bar for bulk operations
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
  const t = useTranslations('selectionToolbar');
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

  const availableFolders = folders.filter((f) => f.id !== currentFolderId);

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-[#0a0a0f]/95 backdrop-blur-md border border-cyan-500/50',
        'flex items-center gap-2 px-4 py-3',
        'animate-in slide-in-from-bottom-4 fade-in duration-200',
        'shadow-[0_0_30px_rgba(0,255,255,0.2)]',
        className
      )}
      style={{ clipPath: 'polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)' }}
      data-testid="selection-toolbar"
      role="toolbar"
      aria-label="Bulk actions toolbar"
    >
      {/* Selection count */}
      <span className="text-sm font-mono text-cyan-400 mr-2" role="status" aria-live="polite">
        {t('selected').toUpperCase()}: <span className="text-white">{selectedCount}</span> {selectedCount === 1 ? t('item').toUpperCase() : t('items').toUpperCase()}
      </span>

      {/* Folder operations */}
      {!hasFoldersSelected && (
        <>
          <div className="h-4 w-px bg-cyan-500/30 mx-2" aria-hidden="true" />

          {/* Add to Folder */}
          <button
            onClick={(e) => setAddMenuAnchor(e.currentTarget)}
            className="flex items-center gap-1.5 px-3 py-2 text-cyan-400 font-mono text-xs uppercase hover:bg-cyan-500/10 hover:text-cyan-300 transition-all"
            aria-label={t('add')}
            aria-haspopup="true"
            aria-expanded={Boolean(addMenuAnchor)}
          >
            <FolderPlus className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('add')}</span>
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
            className="flex items-center gap-1.5 px-3 py-2 text-cyan-400 font-mono text-xs uppercase hover:bg-cyan-500/10 hover:text-cyan-300 transition-all"
            aria-label={t('move')}
            aria-haspopup="true"
            aria-expanded={Boolean(moveMenuAnchor)}
          >
            <FolderInput className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t('move')}</span>
          </button>

          <FolderSelectMenu
            anchorEl={moveMenuAnchor}
            open={Boolean(moveMenuAnchor)}
            onClose={() => setMoveMenuAnchor(null)}
            folders={availableFolders}
            onSelectFolder={handleMoveToFolder}
            onCreateFolder={onCreateFolder}
          />

          {/* Remove from Folder */}
          {isInFolderView && currentFolderId && (
            <button
              onClick={onRemoveFromFolder}
              className="flex items-center gap-1.5 px-3 py-2 text-cyan-400 font-mono text-xs uppercase hover:bg-cyan-500/10 hover:text-cyan-300 transition-all"
              aria-label={t('remove')}
            >
              <FolderMinus className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t('remove')}</span>
            </button>
          )}
        </>
      )}

      <div className="h-4 w-px bg-cyan-500/30 mx-2" aria-hidden="true" />

      {/* Move to Trash - Pink accent */}
      <button
        onClick={onMoveToTrash}
        className="flex items-center gap-1.5 px-3 py-2 text-pink-400 font-mono text-xs uppercase hover:bg-pink-500/10 hover:text-pink-300 transition-all"
        aria-label={t('trash')}
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">{t('trash')}</span>
      </button>

      <div className="h-4 w-px bg-cyan-500/30 mx-2" aria-hidden="true" />

      {/* Clear selection */}
      <button
        onClick={onClearSelection}
        className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all"
        aria-label={t('clearSelection')}
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
