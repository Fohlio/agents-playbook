'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, FolderPlus, Zap, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/shared/lib/utils/cn';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';

interface LibraryHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateFolder: () => void;
  onCreateWorkflow: () => void;
  onCreateSkill: () => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  selectedCount?: number;
  className?: string;
}

/**
 * LibraryHeader Component - Cyberpunk Style
 *
 * Header with neon search bar and angular buttons
 */
export function LibraryHeader({
  searchQuery,
  onSearchChange,
  onCreateFolder,
  onCreateWorkflow,
  onCreateSkill,
  viewMode = 'grid',
  onViewModeChange,
  selectedCount = 0,
  className,
}: LibraryHeaderProps) {
  const t = useTranslations('libraryHeader');
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [createMenuAnchor, setCreateMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

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
      {/* Search bar - Cyberpunk Style */}
      <div className="relative flex-1 max-w-md" role="search">
        <label htmlFor="library-search" className="sr-only">{t('searchLibrary')}</label>
        <input
          id="library-search"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          data-testid="library-search"
          className="w-full px-4 py-2.5 pl-10 bg-[#0a0a0f]/80 border border-cyan-500/50 text-cyan-100 font-mono text-sm placeholder:text-cyan-500/40 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all"
          style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
          aria-describedby={localSearch ? "search-status" : undefined}
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/60"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-cyan-500/60 hover:text-cyan-400 transition-colors"
            data-testid="search-clear"
            aria-label={t('clearSearch')}
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <span id="search-status" className="sr-only" aria-live="polite">
          {localSearch ? t('searchingFor', { query: localSearch }) : ''}
        </span>
      </div>

      {/* Selection count indicator */}
      {selectedCount > 0 && (
        <div
          className="px-3 py-1.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 font-mono text-sm"
          role="status"
          aria-live="polite"
        >
          {t('selected')}: {selectedCount}
        </div>
      )}

      {/* View mode toggle - Cyberpunk Style */}
      {onViewModeChange && (
        <div className="flex items-center border border-cyan-500/30 overflow-hidden" role="group" aria-label={t('viewMode')}>
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-2.5 transition-all',
              viewMode === 'grid'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-cyan-100/40 hover:text-cyan-400 hover:bg-cyan-500/10'
            )}
            aria-label={t('gridView')}
            aria-pressed={viewMode === 'grid'}
          >
            <LayoutGrid className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-2.5 transition-all',
              viewMode === 'list'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-cyan-100/40 hover:text-cyan-400 hover:bg-cyan-500/10'
            )}
            aria-label={t('listView')}
            aria-pressed={viewMode === 'list'}
          >
            <List className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Create actions - Cyberpunk Style */}
      <div className="flex items-center gap-2">
        <button
          onClick={onCreateFolder}
          data-testid="create-folder-button"
          className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-cyan-500/50 text-cyan-400 font-mono text-sm uppercase tracking-wider hover:bg-cyan-500/10 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.2)] transition-all"
          style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
        >
          <FolderPlus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('folder')}</span>
        </button>

        <button
          onClick={handleCreateMenuOpen}
          data-testid="create-menu-button"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-[#050508] font-bold uppercase tracking-wider text-sm hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] transition-all"
          style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('create')}</span>
        </button>

        <Menu
          anchorEl={createMenuAnchor}
          open={Boolean(createMenuAnchor)}
          onClose={handleCreateMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: '#0a0a0f',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.15)',
              marginTop: '8px',
            },
            '& .MuiMenuItem-root': {
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              color: '#a5f3fc',
              padding: '12px 16px',
              '&:hover': {
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
              },
            },
          }}
        >
          <MenuItem onClick={() => handleCreateAction(onCreateWorkflow)}>
            <ListItemIcon>
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </ListItemIcon>
            <ListItemText sx={{ '& .MuiTypography-root': { fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
              {t('newWorkflow')}
            </ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleCreateAction(onCreateSkill)}>
            <ListItemIcon>
              <Zap className="w-5 h-5 text-cyan-400" />
            </ListItemIcon>
            <ListItemText sx={{ '& .MuiTypography-root': { fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
              {t('newSkill')}
            </ListItemText>
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}
