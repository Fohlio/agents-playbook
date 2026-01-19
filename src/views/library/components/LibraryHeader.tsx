'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, FolderPlus, FileText, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/shared/ui/atoms';
import Button from '@/shared/ui/atoms/Button';
import { cn } from '@/shared/lib/utils/cn';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';

interface LibraryHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateFolder: () => void;
  onCreateWorkflow: () => void;
  onCreatePrompt: () => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  selectedCount?: number;
  className?: string;
}

/**
 * LibraryHeader Component
 *
 * Header area for the Library view containing:
 * - Search bar (300ms debounce)
 * - View toggle (grid/list) - optional
 * - Create actions (+ New Folder, + New Workflow, + New Prompt)
 */
export function LibraryHeader({
  searchQuery,
  onSearchChange,
  onCreateFolder,
  onCreateWorkflow,
  onCreatePrompt,
  viewMode = 'grid',
  onViewModeChange,
  selectedCount = 0,
  className,
}: LibraryHeaderProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [createMenuAnchor, setCreateMenuAnchor] = useState<null | HTMLElement>(null);

  // Sync local search with external state
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);

  const handleClearSearch = useCallback(() => {
    setLocalSearch('');
    onSearchChange('');
  }, [onSearchChange]);

  const handleCreateMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setCreateMenuAnchor(event.currentTarget);
  };

  const handleCreateMenuClose = () => {
    setCreateMenuAnchor(null);
  };

  const handleCreateAction = (action: () => void) => {
    handleCreateMenuClose();
    action();
  };

  return (
    <div className={cn('flex items-center gap-4 mb-6', className)} data-testid="library-header">
      {/* Search bar */}
      <div className="relative flex-1 max-w-md" role="search">
        <label htmlFor="library-search" className="sr-only">Search library</label>
        <Input
          id="library-search"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search library..."
          testId="library-search"
          className="w-full pl-10"
          aria-describedby={localSearch ? "search-status" : undefined}
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {localSearch && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            data-testid="search-clear"
            aria-label="Clear search"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <span id="search-status" className="sr-only" aria-live="polite">
          {localSearch ? `Searching for ${localSearch}` : ''}
        </span>
      </div>

      {/* Selection count indicator */}
      {selectedCount > 0 && (
        <div
          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md text-sm font-medium"
          role="status"
          aria-live="polite"
        >
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </div>
      )}

      {/* View mode toggle */}
      {onViewModeChange && (
        <div className="flex items-center border rounded-md overflow-hidden" role="group" aria-label="View mode">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
              viewMode === 'grid'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:bg-gray-50'
            )}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
          >
            <LayoutGrid className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
              viewMode === 'list'
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-500 hover:bg-gray-50'
            )}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
          >
            <List className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Create actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={onCreateFolder}
          testId="create-folder-button"
          className="flex items-center gap-2"
        >
          <FolderPlus className="w-4 h-4" />
          <span className="hidden sm:inline">New Folder</span>
        </Button>

        <Button
          variant="primary"
          onClick={handleCreateMenuOpen}
          testId="create-menu-button"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create</span>
        </Button>

        <Menu
          anchorEl={createMenuAnchor}
          open={Boolean(createMenuAnchor)}
          onClose={handleCreateMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => handleCreateAction(onCreateWorkflow)}>
            <ListItemIcon>
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </ListItemIcon>
            <ListItemText>New Workflow</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleCreateAction(onCreatePrompt)}>
            <ListItemIcon>
              <FileText className="w-5 h-5 text-green-500" />
            </ListItemIcon>
            <ListItemText>New Prompt</ListItemText>
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}
