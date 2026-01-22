'use client';

import { useState, MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import { Folder, Inbox, Trash2, Plus, MoreVertical } from 'lucide-react';
import { cn } from '@/shared/lib/utils/cn';
import { FolderWithItems } from '@/server/folders/types';
import { LibraryView } from '../hooks/useLibraryNavigation';
import { Menu, MenuItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface LibrarySidebarProps {
  folders: FolderWithItems[];
  currentFolderId: string | null;
  currentView: LibraryView;
  uncategorizedCount: number;
  trashCount: number;
  onFolderClick: (folderId: string) => void;
  onUncategorizedClick: () => void;
  onTrashClick: () => void;
  onRootClick: () => void;
  onCreateFolder: () => void;
  onRenameFolder?: (folderId: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  className?: string;
}

/**
 * LibrarySidebar Component - Cyberpunk Style
 *
 * Terminal-style folder tree navigation
 */
export function LibrarySidebar({
  folders,
  currentFolderId,
  currentView,
  uncategorizedCount,
  trashCount,
  onFolderClick,
  onUncategorizedClick,
  onTrashClick,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onRootClick,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  className,
}: LibrarySidebarProps) {
  const t = useTranslations('library.sidebar');
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    folderId: string;
  } | null>(null);
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);

  const handleContextMenu = (event: MouseEvent, folderId: string) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      folderId,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleContextAction = (action: (folderId: string) => void) => {
    if (contextMenu) {
      action(contextMenu.folderId);
    }
    handleCloseContextMenu();
  };

  return (
    <aside
      className={cn(
        'w-52 border-r border-cyan-500/30 bg-[#0a0a0f]/95 backdrop-blur-md flex flex-col relative',
        className
      )}
      data-testid="library-sidebar"
      role="navigation"
      aria-label="Library navigation"
    >
      {/* Circuit pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}></div>

      {/* Neon edge glow */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/0 via-cyan-500/50 to-cyan-500/0"></div>

      {/* Header */}
      <div className="relative p-3 border-b border-cyan-500/20 space-y-1">
        {/* Uncategorized */}
        <button
          onClick={onUncategorizedClick}
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2 text-left text-sm font-mono uppercase tracking-wider transition-all',
            currentView === 'uncategorized'
              ? 'bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400'
              : 'text-cyan-100/60 hover:text-cyan-400 hover:bg-cyan-500/10 border-l-2 border-transparent'
          )}
          data-testid="sidebar-uncategorized"
        >
          <Inbox className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{t('uncategorized')}</span>
          {uncategorizedCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">
              {uncategorizedCount}
            </span>
          )}
        </button>

        {/* Trash */}
        <button
          onClick={onTrashClick}
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2 text-left text-sm font-mono uppercase tracking-wider transition-all',
            currentView === 'trash'
              ? 'bg-pink-500/20 text-pink-400 border-l-2 border-pink-400'
              : 'text-cyan-100/60 hover:text-pink-400 hover:bg-pink-500/10 border-l-2 border-transparent'
          )}
          data-testid="sidebar-trash"
        >
          <Trash2 className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{t('trash')}</span>
          {trashCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-mono bg-pink-500/20 text-pink-400 border border-pink-500/50">
              {trashCount}
            </span>
          )}
        </button>
      </div>

      {/* Folders section */}
      <div className="relative flex-1 overflow-y-auto p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-mono text-cyan-500/70 uppercase tracking-wider">
            {'//'} {t('folders')}
          </h3>
          <button
            onClick={onCreateFolder}
            className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
            title={t('createFolder')}
            aria-label={t('createFolder')}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <nav className="space-y-0.5" role="list" aria-label={t('foldersListLabel')}>
          {folders.length === 0 ? (
            <p className="text-sm text-cyan-100/30 font-mono px-2 py-4">
              &gt; {t('noFolders')}
            </p>
          ) : (
            folders.map((folder) => (
              <div
                key={folder.id}
                className="relative group"
                role="listitem"
                onMouseEnter={() => setHoveredFolderId(folder.id)}
                onMouseLeave={() => setHoveredFolderId(null)}
              >
                <button
                  onClick={() => onFolderClick(folder.id)}
                  onContextMenu={(e) => handleContextMenu(e, folder.id)}
                  className={cn(
                    'flex items-center gap-2 w-full px-3 py-2 pr-8 text-left text-sm font-mono transition-all',
                    currentFolderId === folder.id
                      ? 'bg-cyan-500/20 text-cyan-400 border-l-2 border-cyan-400'
                      : 'text-cyan-100/60 hover:text-cyan-400 hover:bg-cyan-500/10 border-l-2 border-transparent'
                  )}
                  data-testid={`sidebar-folder-${folder.id}`}
                  aria-current={currentFolderId === folder.id ? 'page' : undefined}
                  aria-label={`${folder.name} ${t('folder')}, ${folder.itemCount} ${t('items')}`}
                >
                  <Folder className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate">{folder.name}</span>
                  <span className="text-xs text-cyan-500/50 tabular-nums flex-shrink-0" aria-hidden="true">
                    [{folder.itemCount}]
                  </span>
                </button>

                {/* Inline menu button */}
                {(hoveredFolderId === folder.id || contextMenu?.folderId === folder.id) && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContextMenu(e as unknown as MouseEvent, folder.id);
                    }}
                    aria-label={`${t('moreOptions')} ${folder.name}`}
                    sx={{
                      position: 'absolute',
                      right: 4,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '4px',
                      minWidth: '28px',
                      minHeight: '28px',
                      color: '#00ffff',
                      backgroundColor: 'rgba(0, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 255, 0.2)',
                      },
                    }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </IconButton>
                )}
              </div>
            ))
          )}
        </nav>
      </div>

      {/* System status */}
      <div className="relative p-3 border-t border-cyan-500/20">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ boxShadow: '0 0 8px #00ff66' }}></span>
          <span className="text-green-400">VAULT_ONLINE</span>
        </div>
      </div>

      {/* Context menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: '#0a0a0f',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.1)',
          },
          '& .MuiMenuItem-root': {
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            color: '#a5f3fc',
            '&:hover': {
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
            },
          },
        }}
      >
        {onRenameFolder && (
          <MenuItem onClick={() => handleContextAction(onRenameFolder)}>
            <ListItemIcon sx={{ color: '#00ffff' }}>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('rename')}</ListItemText>
          </MenuItem>
        )}
        {onDeleteFolder && (
          <MenuItem
            onClick={() => handleContextAction(onDeleteFolder)}
            sx={{ color: '#ff0066 !important' }}
          >
            <ListItemIcon sx={{ color: '#ff0066' }}>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('moveToTrash')}</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </aside>
  );
}
